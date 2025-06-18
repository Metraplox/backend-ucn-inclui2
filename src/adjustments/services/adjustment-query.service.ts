import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Adjustment,
  AdjustmentDocument,
  AdjustmentStatus,
} from '../schemas/adjustment.schema';

@Injectable()
export class AdjustmentQueryService {
  private readonly logger = new Logger(AdjustmentQueryService.name);

  constructor(
    @InjectModel(Adjustment.name)
    private adjustmentModel: Model<AdjustmentDocument>,
  ) {}

  /**
   * Buscar ajustes por ID de estudiante
   */
  async findByStudentId(
    studentId: string,
    status?: AdjustmentStatus,
  ): Promise<Adjustment[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('ID de estudiante inválido');
    }

    const query: any = { studentId: new Types.ObjectId(studentId) };

    if (status) {
      query.status = status;
    }

    return this.adjustmentModel.find(query).exec();
  }

  /**
   * Buscar ajustes por ID de curso
   */
  async findByCourseId(courseId: string): Promise<Adjustment[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('ID de curso inválido');
    }

    return this.adjustmentModel
      .find({
        'currentAdjustments.courseId': new Types.ObjectId(courseId),
      })
      .exec();
  }

  /**
   * Buscar ajustes por NRC de curso
   */
  async findByCourseNrc(courseNrc: string, semester?: string): Promise<Adjustment[]> {
    const query: any = {};
    if (semester) {
      query.currentAdjustments = {
        $elemMatch: {
          courseNrc,
          semester
        }
      };
    } else {
      query.currentAdjustments = {
        $elemMatch: {
          courseNrc
        }
      };
    }
    return this.adjustmentModel.find(query).exec();
  }

  /**
   * Buscar ajustes por departamento y semestre
   */
  async findByDepartment(departmentId: string, semester: string): Promise<Adjustment[]> {
    return this.adjustmentModel.find({
      'student.department': departmentId,
      semester: semester,
      status: { $ne: 'archived' }
    }).populate('student').exec();
  }

  /**
   * Obtener estado de lectura de ajustes
   */
  async getAdjustmentReadStatus(
    courseId?: string,
    courseNrc?: string,
    semester?: string,
  ): Promise<any[]> {
    const matchStage: any = {};

    if (courseId) {
      matchStage['currentAdjustments.courseId'] = new Types.ObjectId(courseId);
    }

    if (courseNrc) {
      matchStage['currentAdjustments.courseNrc'] = courseNrc;
    }

    if (semester) {
      matchStage['currentAdjustments.semester'] = semester;
    }

    return this.adjustmentModel
      .aggregate([
        { $match: matchStage },
        { $unwind: '$currentAdjustments' },
        {
          $project: {
            _id: 1,
            studentId: 1,
            adjustment: '$currentAdjustments',
            hasRead: {
              $cond: {
                if: { $isArray: '$currentAdjustments.readBy' },
                then: { $gt: [{ $size: '$currentAdjustments.readBy' }, 0] },
                else: false,
              },
            },
          },
        },
      ])
      .exec();
  }

  /**
   * Obtener estado de lectura por NRC
   */
  async getAdjustmentReadStatusByNrc(
    courseNrc: string,
    semester?: string,
  ): Promise<any[]> {
    return this.getAdjustmentReadStatus(undefined, courseNrc, semester);
  }
} 