import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentMetadataDto } from './dto/update-document-metadata.dto';
import {
  DocumentCategory,
  DocumentDocument,
  DocumentEntity,
} from './schemas/document.schema';
import { Types } from 'mongoose';
import {
  StreamableFile,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import * as fs from 'fs'; // <--- Añadido import para fs

// Datos de ejemplo
const studentId = new Types.ObjectId().toHexString();
const documentId = new Types.ObjectId().toHexString();
const staffId = 'staff-user-id'; // Usado en el servicio, el controlador lo pasaría

const mockMulterFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 12345,
  destination: '/uploads',
  filename: 'test-uuid.pdf',
  path: '/uploads/test-uuid.pdf',
  stream: new Readable({ read() {} }),
  buffer: Buffer.from('test'),
};

const createDocDto: CreateDocumentDto = {
  studentId: studentId,
  category: DocumentCategory.INFORME_MEDICO,
  description: 'Test description',
};

const mockDocumentResult: Partial<DocumentDocument> = {
  // Usar DocumentDocument para _id
  _id: documentId as any,
  studentId: new Types.ObjectId(studentId),
  fileNameOriginal: mockMulterFile.originalname,
  storageFileName: mockMulterFile.filename,
  filePath: mockMulterFile.path,
  mimeType: mockMulterFile.mimetype,
  sizeBytes: mockMulterFile.size,
  category: createDocDto.category,
  description: createDocDto.description,
  uploadedBy: staffId,
  uploadDate: new Date(),
};

// Mock del servicio DocumentsService
const mockDocumentsService = {
  uploadForStudentByStaff: jest.fn().mockResolvedValue(mockDocumentResult),
  getDocumentsByStudentId: jest.fn().mockResolvedValue([mockDocumentResult]),
  getDocumentById: jest.fn().mockResolvedValue(mockDocumentResult),
  getDocumentFileDetails: jest.fn().mockResolvedValue(mockDocumentResult), // Para descarga
  updateDocumentMetadata: jest.fn().mockResolvedValue(mockDocumentResult),
  deleteDocument: jest.fn().mockResolvedValue(undefined),
};

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should call service.uploadForStudentByStaff and return document metadata', async () => {
      const result = await controller.uploadDocument(
        mockMulterFile,
        createDocDto,
      );
      expect(service.uploadForStudentByStaff).toHaveBeenCalledWith(
        mockMulterFile,
        createDocDto,
        'staff-placeholder-id',
      );
      expect(result).toEqual(mockDocumentResult);
    });
    // Pruebas para ParseFilePipe (si estuviera activo) serían más de integración o e2e.
    // Aquí asumimos que el archivo pasa la validación (o no hay validación si ParseFilePipe está vacío).
  });

  describe('getDocumentsByStudent', () => {
    it('should call service.getDocumentsByStudentId and return documents', async () => {
      const result = await controller.getDocumentsByStudent(studentId);
      expect(service.getDocumentsByStudentId).toHaveBeenCalledWith(studentId);
      expect(result).toEqual([mockDocumentResult]);
    });
    it('should throw BadRequestException for invalid studentId', async () => {
      await expect(
        controller.getDocumentsByStudent('invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDocumentMetadata', () => {
    it('should call service.getDocumentById and return metadata', async () => {
      const result = await controller.getDocumentMetadata(documentId);
      expect(service.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(mockDocumentResult);
    });
    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(
        controller.getDocumentMetadata('invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('downloadDocument', () => {
    let mockResponse: Partial<Response>;
    let setHeaderSpy: jest.SpyInstance;

    beforeEach(() => {
      setHeaderSpy = jest.fn();
      mockResponse = {
        set: setHeaderSpy as any, // <--- Castear a any para el mock simple
        // No necesitamos simular sendFile o stream, StreamableFile lo maneja.
      };
    });

    it('should call service.getDocumentFileDetails and return a StreamableFile', async () => {
      // Mock fs.createReadStream para que no intente leer un archivo real
      const mockReadStream = new Readable({
        read() {
          this.push(null);
        },
      }); // Emite EOF inmediatamente
      jest
        .spyOn(require('fs'), 'createReadStream')
        .mockReturnValue(mockReadStream);
      jest.spyOn(fs.promises, 'access').mockResolvedValue(undefined); // Simula que el archivo existe

      const result = await controller.downloadDocument(
        documentId,
        mockResponse as Response,
      );

      expect(service.getDocumentFileDetails).toHaveBeenCalledWith(documentId);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': mockDocumentResult.mimeType,
        'Content-Disposition': `attachment; filename="${mockDocumentResult.fileNameOriginal}"`,
      });
      expect(result).toBeInstanceOf(StreamableFile);
      expect(result.getStream()).toBe(mockReadStream);
    });

    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(
        controller.downloadDocument('invalid-id', mockResponse as Response),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if physical file does not exist', async () => {
      jest
        .spyOn(fs.promises, 'access')
        .mockRejectedValueOnce(new Error('File not found'));
      mockDocumentsService.getDocumentFileDetails.mockResolvedValueOnce(
        mockDocumentResult,
      ); // Asegura que el servicio devuelva datos

      await expect(
        controller.downloadDocument(documentId, mockResponse as Response),
      ).rejects.toThrow(NotFoundException);
      expect(service.getDocumentFileDetails).toHaveBeenCalledWith(documentId);
    });
  });

  describe('updateMetadata', () => {
    const updateDto: UpdateDocumentMetadataDto = {
      category: DocumentCategory.CERTIFICADO_DISCAPACIDAD,
    };
    it('should call service.updateDocumentMetadata and return updated metadata', async () => {
      mockDocumentsService.updateDocumentMetadata.mockResolvedValueOnce({
        ...mockDocumentResult,
        ...updateDto,
      });
      const result = await controller.updateMetadata(documentId, updateDto);
      expect(service.updateDocumentMetadata).toHaveBeenCalledWith(
        documentId,
        updateDto,
      );
      expect(result.category).toBe(DocumentCategory.CERTIFICADO_DISCAPACIDAD);
    });
    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(
        controller.updateMetadata('invalid-id', updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteDocument', () => {
    it('should call service.deleteDocument', async () => {
      await expect(
        controller.deleteDocument(documentId),
      ).resolves.toBeUndefined();
      expect(service.deleteDocument).toHaveBeenCalledWith(documentId);
    });
    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(controller.deleteDocument('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
