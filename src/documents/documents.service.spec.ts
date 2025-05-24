import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

import { DocumentsService } from './documents.service';
import {
  DocumentEntity,
  DocumentDocument,
  DocumentCategory,
} from './schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentMetadataDto } from './dto/update-document-metadata.dto';

// Mock de fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
  access: jest.fn().mockResolvedValue(undefined), // Simula que el archivo existe por defecto
}));

// Mock del modelo DocumentEntity
const mockDocumentModel = {
  new: jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue(dto),
  })),
  constructor: jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue(dto),
  })),
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  deleteOne: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const studentId = new Types.ObjectId().toHexString();
const documentId = new Types.ObjectId().toHexString();
const staffId = 'staff-user-id';

const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test-document.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 1024,
  destination: '/tmp/uploads',
  filename: 'test-document-uuid.pdf',
  path: '/tmp/uploads/test-document-uuid.pdf',
  stream: new (require('stream').Readable)({ read() {} }), // Mock simple de Readable stream
  buffer: Buffer.from('testbuffer'), // Mock simple de Buffer
};

const createDocDto: CreateDocumentDto = {
  studentId: studentId,
  category: DocumentCategory.INFORME_MEDICO,
  description: 'Test document description',
};

const mockDocument: Partial<DocumentDocument> = {
  _id: documentId as any,
  studentId: new Types.ObjectId(studentId),
  fileNameOriginal: mockFile.originalname,
  storageFileName: mockFile.filename,
  filePath: mockFile.path,
  mimeType: mockFile.mimetype,
  sizeBytes: mockFile.size,
  category: createDocDto.category,
  description: createDocDto.description,
  uploadedBy: staffId,
  uploadDate: new Date(),
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  let model: Model<DocumentDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getModelToken(DocumentEntity.name),
          useValue: mockDocumentModel,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    model = module.get<Model<DocumentDocument>>(
      getModelToken(DocumentEntity.name),
    );
    jest.clearAllMocks();
    // Asegurar que fs.mkdir en el constructor del servicio no cause problemas en las pruebas
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadForStudentByStaff', () => {
    it('should upload a document and save metadata', async () => {
      mockDocumentModel.new.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValueOnce({ ...dto, _id: documentId }),
      }));
      const result = await service.uploadForStudentByStaff(
        mockFile,
        createDocDto,
        staffId,
      );
      // Se verifica el mock directamente, ya que 'model' es una instancia de Model<T> tipada por Mongoose.
      expect(mockDocumentModel.new).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: new Types.ObjectId(createDocDto.studentId),
          fileNameOriginal: mockFile.originalname,
        }),
      );
      expect(result.fileNameOriginal).toBe(mockFile.originalname);
    });

    it('should throw BadRequestException if no file is provided', async () => {
      // Usar undefined en lugar de null para el parámetro 'file'
      await expect(
        service.uploadForStudentByStaff(
          undefined as any,
          createDocDto,
          staffId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on DB save error', async () => {
      mockDocumentModel.new.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      }));
      await expect(
        service.uploadForStudentByStaff(mockFile, createDocDto, staffId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getDocumentsByStudentId', () => {
    it('should return documents for a student', async () => {
      mockDocumentModel.exec.mockResolvedValueOnce([mockDocument]);
      const result = await service.getDocumentsByStudentId(studentId);
      expect(model.find).toHaveBeenCalledWith({
        studentId: new Types.ObjectId(studentId),
      });
      expect(result).toEqual([mockDocument]);
    });
    it('should throw BadRequestException for invalid studentId', async () => {
      await expect(
        service.getDocumentsByStudentId('invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDocumentById', () => {
    it('should return a document by its ID', async () => {
      mockDocumentModel.exec.mockResolvedValueOnce(mockDocument);
      const result = await service.getDocumentById(documentId);
      expect(model.findById).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException if document not found', async () => {
      mockDocumentModel.exec.mockResolvedValueOnce(null);
      await expect(service.getDocumentById(documentId)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(service.getDocumentById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getDocumentFileDetails', () => {
    it('should return document details (reusing getDocumentById)', async () => {
      jest
        .spyOn(service, 'getDocumentById')
        .mockResolvedValueOnce(mockDocument as DocumentDocument);
      const result = await service.getDocumentFileDetails(documentId);
      expect(service.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('updateDocumentMetadata', () => {
    const updateDto: UpdateDocumentMetadataDto = {
      category: DocumentCategory.OTRO,
    };
    it('should update document metadata', async () => {
      const updatedDoc = { ...mockDocument, ...updateDto };
      mockDocumentModel.exec.mockResolvedValueOnce(updatedDoc);
      const result = await service.updateDocumentMetadata(
        documentId,
        updateDto,
      );
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        documentId,
        { $set: updateDto },
        { new: true },
      );
      expect(result).toEqual(updatedDoc);
    });

    it('should throw NotFoundException if document to update not found', async () => {
      mockDocumentModel.exec.mockResolvedValueOnce(null);
      await expect(
        service.updateDocumentMetadata(documentId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(
        service.updateDocumentMetadata('invalid-id', updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteDocument', () => {
    beforeEach(() => {
      // Simula que getDocumentById encuentra el documento para la prueba de eliminación
      jest
        .spyOn(service, 'getDocumentById')
        .mockResolvedValueOnce(mockDocument as DocumentDocument);
    });

    it('should delete document metadata and physical file', async () => {
      (fs.unlink as jest.Mock).mockResolvedValueOnce(undefined); // Simula eliminación exitosa del archivo
      mockDocumentModel.exec.mockResolvedValueOnce({ deletedCount: 1 }); // Simula eliminación exitosa de DB

      await expect(service.deleteDocument(documentId)).resolves.toBeUndefined();
      expect(service.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(fs.unlink).toHaveBeenCalledWith(mockDocument.filePath);
      expect(model.deleteOne).toHaveBeenCalledWith({ _id: documentId });
    });

    it('should throw NotFoundException if document not found by getDocumentById', async () => {
      // Anula el mock anterior para esta prueba específica
      (service.getDocumentById as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(service.deleteDocument(documentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(model.deleteOne).not.toHaveBeenCalled();
    });

    it('should log error if physical file deletion fails but still attempt DB deletion', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      (fs.unlink as jest.Mock).mockRejectedValueOnce(
        new Error('File system error'),
      );
      mockDocumentModel.exec.mockResolvedValueOnce({ deletedCount: 1 });

      await expect(service.deleteDocument(documentId)).resolves.toBeUndefined();
      expect(fs.unlink).toHaveBeenCalledWith(mockDocument.filePath);
      expect(console.error).toHaveBeenCalled();
      expect(model.deleteOne).toHaveBeenCalledWith({ _id: documentId });
      consoleErrorSpy.mockRestore();
    });

    it('should throw BadRequestException for invalid documentId', async () => {
      await expect(service.deleteDocument('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
