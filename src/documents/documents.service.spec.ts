import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ForbiddenException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentEntity } from './schemas/document.schema';
import { Student } from '../students/schemas/student.schema';
import { UserRole } from '../users/schemas/user.schema';
import { UserPublicData } from '../users/interfaces/user-public-data.interface';

const mockDocumentId = new Types.ObjectId().toHexString();
const ownerStudentId = new Types.ObjectId().toHexString();
const otherStudentId = new Types.ObjectId().toHexString();

const mockDocument = {
  _id: mockDocumentId,
  studentId: new Types.ObjectId(ownerStudentId),
};

const adminUser: UserPublicData = {
  _id: new Types.ObjectId().toHexString(),
  email: 'admin@ucn.cl',
  nombreCompleto: 'Admin',
  roles: [UserRole.COORDINADOR],
  isActive: true,
};

const ownerStudentUser: UserPublicData = {
  _id: new Types.ObjectId().toHexString(),
  email: 'owner@alumnos.ucn.cl',
  nombreCompleto: 'Owner Student',
  roles: [UserRole.ESTUDIANTE],
  isActive: true,
  studentId: ownerStudentId,
};

const otherStudentUser: UserPublicData = {
  _id: new Types.ObjectId().toHexString(),
  email: 'other@alumnos.ucn.cl',
  nombreCompleto: 'Other Student',
  roles: [UserRole.ESTUDIANTE],
  isActive: true,
  studentId: otherStudentId,
};

const nonPrivilegedUser: UserPublicData = {
  _id: new Types.ObjectId().toHexString(),
  email: 'teacher@ucn.cl',
  nombreCompleto: 'Teacher',
  roles: [UserRole.DOCENTE],
  isActive: true,
};


describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentModel: Model<DocumentEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getModelToken(DocumentEntity.name),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(Student.name),
          useValue: {}, // No se usa directamente en authorizeAccess
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    documentModel = module.get<Model<DocumentEntity>>(getModelToken(DocumentEntity.name));
    
    // Mock para getDocumentById que es llamado internamente por authorizeAccess
    jest.spyOn(service, 'getDocumentById').mockImplementation(async (id) => {
        if (id === mockDocumentId) {
            return mockDocument as any;
        }
        return null;
    });
  });

  describe('authorizeAccess', () => {
    it('debería permitir el acceso a un usuario con rol de administrador', async () => {
      await expect(service.authorizeAccess(mockDocumentId, adminUser)).resolves.not.toThrow();
    });

    it('debería permitir el acceso a un estudiante que es propietario del documento', async () => {
      await expect(service.authorizeAccess(mockDocumentId, ownerStudentUser)).resolves.not.toThrow();
    });

    it('debería lanzar ForbiddenException para un estudiante que no es propietario del documento', async () => {
      await expect(service.authorizeAccess(mockDocumentId, otherStudentUser)).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar ForbiddenException para un usuario con un rol no privilegiado (DOCENTE)', async () => {
      await expect(service.authorizeAccess(mockDocumentId, nonPrivilegedUser)).rejects.toThrow(ForbiddenException);
    });
  });
}); 