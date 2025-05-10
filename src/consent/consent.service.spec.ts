import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

import { ConsentService } from './consent.service';
import { Consent, ConsentDocument } from './schemas/consent.schema';
import { CreateConsentDto } from './dto/create-consent.dto';
import { DocumentEntity, DocumentDocument } from '../documents/schemas/document.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';

// Mocks para los modelos
const mockConsentModel = {
  findOneAndUpdate: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockDocumentModel = {
  findById: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockStudentModel = {
  findById: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

// Datos de ejemplo
const studentId = new Types.ObjectId().toHexString();
const documentId = new Types.ObjectId().toHexString();
const consentId = new Types.ObjectId().toHexString();

const mockStudentInstance: Partial<StudentDocument> = { _id: studentId as any, nombres: 'Test Student' };
const mockDocumentInstance: Partial<DocumentDocument> = { _id: documentId as any, studentId: new Types.ObjectId(studentId), fileNameOriginal: 'test.pdf' };
const mockConsentInstance: Partial<ConsentDocument> = {
  _id: consentId as any,
  studentId: new Types.ObjectId(studentId),
  documentId: new Types.ObjectId(documentId),
  isConsentGiven: true,
  consentDate: new Date(),
};

const createConsentDto: CreateConsentDto = {
  documentId: documentId,
  isConsentGiven: true,
};

describe('ConsentService', () => {
  let service: ConsentService;
  let consentModel: Model<ConsentDocument>;
  let documentModel: Model<DocumentDocument>;
  let studentModel: Model<StudentDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsentService,
        { provide: getModelToken(Consent.name), useValue: mockConsentModel },
        { provide: getModelToken(DocumentEntity.name), useValue: mockDocumentModel },
        { provide: getModelToken(Student.name), useValue: mockStudentModel },
      ],
    }).compile();

    service = module.get<ConsentService>(ConsentService);
    consentModel = module.get<Model<ConsentDocument>>(getModelToken(Consent.name));
    documentModel = module.get<Model<DocumentDocument>>(getModelToken(DocumentEntity.name));
    studentModel = module.get<Model<StudentDocument>>(getModelToken(Student.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('giveOrUpdateConsent', () => {
    it('should create or update consent successfully', async () => {
      mockStudentModel.exec.mockResolvedValueOnce(mockStudentInstance);
      mockDocumentModel.exec.mockResolvedValueOnce(mockDocumentInstance);
      mockConsentModel.exec.mockResolvedValueOnce(mockConsentInstance);

      const result = await service.giveOrUpdateConsent(studentId, createConsentDto, '127.0.0.1', 'test-agent');
      
      expect(studentModel.findById).toHaveBeenCalledWith(studentId);
      expect(documentModel.findById).toHaveBeenCalledWith(documentId);
      expect(consentModel.findOneAndUpdate).toHaveBeenCalledWith(
        { studentId: new Types.ObjectId(studentId), documentId: new Types.ObjectId(documentId) },
        expect.objectContaining({ $set: { isConsentGiven: true } }),
        { new: true, upsert: true, runValidators: true },
      );
      expect(result).toEqual(mockConsentInstance);
    });

    it('should throw BadRequestException for invalid studentId', async () => {
      await expect(service.giveOrUpdateConsent('invalid-id', createConsentDto)).rejects.toThrow(BadRequestException);
    });
    
    it('should throw BadRequestException for invalid documentId', async () => {
      const dtoWithInvalidDocId = { ...createConsentDto, documentId: 'invalid-doc-id' };
      await expect(service.giveOrUpdateConsent(studentId, dtoWithInvalidDocId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentModel.exec.mockResolvedValueOnce(null);
      await expect(service.giveOrUpdateConsent(studentId, createConsentDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if document not found', async () => {
      mockStudentModel.exec.mockResolvedValueOnce(mockStudentInstance);
      mockDocumentModel.exec.mockResolvedValueOnce(null);
      await expect(service.giveOrUpdateConsent(studentId, createConsentDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if document does not belong to student', async () => {
      const otherStudentId = new Types.ObjectId().toHexString();
      const docOfOtherStudent = { ...mockDocumentInstance, studentId: new Types.ObjectId(otherStudentId) };
      mockStudentModel.exec.mockResolvedValueOnce(mockStudentInstance);
      mockDocumentModel.exec.mockResolvedValueOnce(docOfOtherStudent);
      await expect(service.giveOrUpdateConsent(studentId, createConsentDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getConsentForDocumentByStudent', () => {
    it('should return consent if found', async () => {
      mockConsentModel.exec.mockResolvedValueOnce(mockConsentInstance);
      const result = await service.getConsentForDocumentByStudent(studentId, documentId);
      expect(consentModel.findOne).toHaveBeenCalledWith({
        studentId: new Types.ObjectId(studentId),
        documentId: new Types.ObjectId(documentId),
      });
      expect(result).toEqual(mockConsentInstance);
    });

    it('should return null if consent not found', async () => {
      mockConsentModel.exec.mockResolvedValueOnce(null);
      const result = await service.getConsentForDocumentByStudent(studentId, documentId);
      expect(result).toBeNull();
    });
    
    it('should throw BadRequestException for invalid studentId', async () => {
      await expect(service.getConsentForDocumentByStudent('invalid-id', documentId)).rejects.toThrow(BadRequestException);
    });
    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(service.getConsentForDocumentByStudent(studentId, 'invalid-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getConsentsByStudent', () => {
    it('should return an array of consents for a student', async () => {
      mockConsentModel.exec.mockResolvedValueOnce([mockConsentInstance]);
      const result = await service.getConsentsByStudent(studentId);
      expect(consentModel.find).toHaveBeenCalledWith({ studentId: new Types.ObjectId(studentId) });
      expect(result).toEqual([mockConsentInstance]);
    });
    it('should throw BadRequestException for invalid studentId', async () => {
      await expect(service.getConsentsByStudent('invalid-id')).rejects.toThrow(BadRequestException);
    });
  });
});
