import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AdjustmentsService } from './adjustments.service';
import { Adjustment, AdjustmentStatus } from './schemas/adjustment.schema';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockAdjustmentId = new Types.ObjectId().toHexString();
const mockUserId = new Types.ObjectId().toHexString();

const mockAdjustment = {
  _id: mockAdjustmentId,
  studentRut: '12345678-9',
  currentAdjustments: [
    {
      type: new Types.ObjectId(),
      courseNrc: 'CS101',
      estado: AdjustmentStatus.PENDING,
      // ... otros campos
    },
    {
      type: new Types.ObjectId(),
      courseNrc: 'MA101',
      estado: AdjustmentStatus.ACTIVE,
      // ... otros campos
    },
  ],
  history: [],
  save: jest.fn().mockResolvedValue(this),
};

describe('AdjustmentsService', () => {
  let service: AdjustmentsService;
  let model: Model<Adjustment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustmentsService,
        {
          provide: getModelToken(Adjustment.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockAdjustment),
            constructor: jest.fn().mockResolvedValue(mockAdjustment),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
            exec: jest.fn(),
          },
        },
        // Mock de dependencias no utilizadas en estas pruebas
        { provide: 'AdjustmentNotificationsService', useValue: { sendAdjustmentNotification: jest.fn() } },
        { provide: getModelToken('DocumentEntity'), useValue: {} },
      ],
    }).compile();

    service = module.get<AdjustmentsService>(AdjustmentsService);
    model = module.get<Model<Adjustment>>(getModelToken(Adjustment.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateStatus', () => {
    it('debería actualizar el estado y agregar una entrada al historial para una transición válida', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAdjustment),
      } as any);
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockAdjustment, currentAdjustments: [{ ...mockAdjustment.currentAdjustments[0], estado: AdjustmentStatus.APPROVED }] }),
      } as any);

      const result = await service.updateStatus(
        mockAdjustmentId,
        0, // index
        AdjustmentStatus.APPROVED,
        mockUserId,
        'Aprobado por el comité',
      );

      expect(model.findById).toHaveBeenCalledWith(mockAdjustmentId);
      expect(model.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.currentAdjustments[0].estado).toBe(AdjustmentStatus.APPROVED);
    });

    it('debería lanzar BadRequestException para una transición de estado inválida', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAdjustment),
      } as any);

      await expect(
        service.updateStatus(
          mockAdjustmentId,
          0, // De PENDING
          AdjustmentStatus.EXPIRED, // a EXPIRED (inválido)
          mockUserId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si el ajuste no se encuentra', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // Simula que no se encontró
      } as any);

      await expect(
        service.updateStatus(
          mockAdjustmentId,
          0,
          AdjustmentStatus.APPROVED,
          mockUserId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException para un índice de ajuste fuera de rango', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAdjustment),
      } as any);

      await expect(
        service.updateStatus(
          mockAdjustmentId,
          99, // Índice inválido
          AdjustmentStatus.APPROVED,
          mockUserId,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
