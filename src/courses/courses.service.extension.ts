import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CoursesServiceExtension {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
  ) {}

  /**
   * Cuenta el número total de cursos para un semestre específico
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Cantidad de cursos en el semestre
   */
  async countCourses(semester: string): Promise<number> {
    const query: any = {};

    if (semester) {
      query.semester = semester;
    }

    return this.courseModel.countDocuments(query).exec();
  }

  /**
   * Obtiene los cursos con mayor cantidad de estudiantes con NEE
   * @param semester Semestre académico (formato YYYY-P)
   * @param limit Límite de resultados a retornar
   * @returns Lista de cursos con más estudiantes con NEE
   */
  async getTopCoursesWithNEE(
    semester: string,
    limit: number = 10,
  ): Promise<any[]> {
    const pipeline: PipelineStage[] = [];

    // Filtrar por semestre si se proporciona
    if (semester) {
      pipeline.push({ $match: { semester } });
    }

    // Lookup para obtener información de los estudiantes
    pipeline.push({
      $lookup: {
        from: 'students',
        localField: 'studentIds',
        foreignField: '_id',
        as: 'students',
      },
    });

    // Añadir campo calculado con la cantidad de estudiantes con NEE
    pipeline.push({
      $addFields: {
        studentsWithNEECount: {
          $size: {
            $filter: {
              input: '$students',
              as: 'student',
              cond: { $eq: ['$$student.hasSpecialNeeds', true] },
            },
          },
        },
      },
    });

    // Ordenar por cantidad de estudiantes con NEE en orden descendente
    pipeline.push({ $sort: { studentsWithNEECount: -1 } });

    // Limitar los resultados
    pipeline.push({ $limit: limit });

    // Proyectar los campos necesarios
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        nrc: 1,
        semester: 1,
        studentsWithNEECount: 1,
        totalStudents: { $size: '$students' },
      },
    });

    return this.courseModel.aggregate(pipeline).exec();
  }

  /**
   * Obtiene todos los departamentos que tienen cursos en un semestre específico
   * @param semester Semestre académico (formato YYYY-P)
   * @returns Lista de departamentos
   */
  async getDepartments(semester: string): Promise<any[]> {
    const pipeline: PipelineStage[] = [];

    // Filtrar por semestre si se proporciona
    if (semester) {
      pipeline.push({ $match: { semester } });
    }

    // Agrupar por departamento
    pipeline.push({
      $group: {
        _id: '$departmentId',
        courseCount: { $sum: 1 },
      },
    });

    // Lookup para obtener información del departamento
    pipeline.push({
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'departmentInfo',
      },
    });

    // Desenrollar la información del departamento
    pipeline.push({
      $unwind: {
        path: '$departmentInfo',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Proyectar los campos necesarios
    pipeline.push({
      $project: {
        _id: 1,
        name: '$departmentInfo.name',
        code: '$departmentInfo.code',
        courseCount: 1,
      },
    });

    // Ordenar por nombre de departamento
    pipeline.push({ $sort: { name: 1 } });

    return this.courseModel.aggregate(pipeline).exec();
  }
}
