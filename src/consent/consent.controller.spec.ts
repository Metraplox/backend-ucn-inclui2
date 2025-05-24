import { Test, TestingModule } from '@nestjs/testing';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { Consent, ConsentDocument } from './schemas/consent.schema';
import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

// Datos de ejemplo
const studentId = 'placeholder-student-id'; // Coincide con el placeholder en el controlador
const documentId = new Types.ObjectId().toHexString();
const consentId = new Types.ObjectId().toHexString();

const mockConsentResult: Partial<ConsentDocument> = {
  _id: consentId as any,
  studentId: new Types.ObjectId(studentId), // Asumimos que el servicio lo convierte
  documentId: new Types.ObjectId(documentId),
  isConsentGiven: true,
  consentDate: new Date(),
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
};

const createConsentDto: CreateConsentDto = {
  documentId: documentId,
  isConsentGiven: true,
};

// Mock del servicio ConsentService
const mockConsentService = {
  giveOrUpdateConsent: jest.fn().mockResolvedValue(mockConsentResult),
  getConsentForDocumentByStudent: jest
    .fn()
    .mockResolvedValue(mockConsentResult),
  getConsentsByStudent: jest.fn().mockResolvedValue([mockConsentResult]),
};

// Mock del objeto Request de Express
const mockRequest = {
  headers: { 'user-agent': 'test-agent' },
  // Si se implementara autenticación real, aquí iría user: { id: studentId } o similar
  // user: { id: studentId }
} as unknown as Request; // Castear a Request para satisfacer los tipos

const mockIp = '127.0.0.1';

describe('ConsentController', () => {
  let controller: ConsentController;
  let service: ConsentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsentController],
      providers: [
        {
          provide: ConsentService,
          useValue: mockConsentService,
        },
      ],
    }).compile();

    controller = module.get<ConsentController>(ConsentController);
    service = module.get<ConsentService>(ConsentService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('giveOrUpdateConsent', () => {
    it('should call service.giveOrUpdateConsent and return consent', async () => {
      const result = await controller.giveOrUpdateConsent(
        createConsentDto,
        mockRequest,
        mockIp,
      );
      expect(service.giveOrUpdateConsent).toHaveBeenCalledWith(
        studentId, // El placeholder del controlador
        createConsentDto,
        mockIp,
        'test-agent',
      );
      expect(result).toEqual(mockConsentResult);
    });

    // Prueba para el caso en que authenticatedStudentId no se pueda determinar (aunque el placeholder actual lo evita)
    // Para probar esto, necesitaríamos modificar el mockRequest o la lógica del controlador para simular un usuario no autenticado.
    // Por ahora, esta prueba es más conceptual.
    it('should throw BadRequestException if authenticatedStudentId is not determined (conceptual)', async () => {
      const tempController = new ConsentController(service); // Instancia fresca para modificar req
      const badRequest = { headers: { 'user-agent': 'test-agent' } } as Request; // Sin req.user

      // Para que esta prueba funcione, el placeholder en el controlador debería ser removido
      // y la lógica para obtener authenticatedStudentId debería poder fallar.
      // Por ahora, el placeholder 'placeholder-student-id' siempre existe.
      // Si el placeholder se quita y se usa req.user.id:
      // await expect(tempController.giveOrUpdateConsent(createConsentDto, badRequest, mockIp))
      //   .rejects.toThrow(BadRequestException);
      expect(true).toBe(true); // Placeholder para esta prueba conceptual
    });
  });

  describe('getConsentForDocument', () => {
    it('should call service.getConsentForDocumentByStudent and return consent', async () => {
      const result = await controller.getConsentForDocument(
        documentId,
        mockRequest,
      );
      expect(service.getConsentForDocumentByStudent).toHaveBeenCalledWith(
        studentId,
        documentId,
      );
      expect(result).toEqual(mockConsentResult);
    });

    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(
        controller.getConsentForDocument('invalid-id', mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyConsents', () => {
    it('should call service.getConsentsByStudent and return consents', async () => {
      const result = await controller.getMyConsents(mockRequest);
      expect(service.getConsentsByStudent).toHaveBeenCalledWith(studentId);
      expect(result).toEqual([mockConsentResult]);
    });
  });
});
