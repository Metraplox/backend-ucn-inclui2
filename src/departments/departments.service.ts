import { Injectable, NotFoundException } from '@nestjs/common';
import { AdjustmentStatus } from '../adjustments/schemas/adjustment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CoursesService } from '../courses/courses.service';
import { StudentsService } from '../students/students.service';
import { AdjustmentsService } from '../adjustments/adjustments.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly adjustmentsService: AdjustmentsService,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = new this.departmentModel(createDepartmentDto);
    return department.save();
  }

  async findAll(semester?: string): Promise<Department[]> {
    const query: any = { isActive: true };
    if (semester) {
      query.currentSemester = semester;
    }
    return this.departmentModel
      .find(query)
      .populate('headId', 'nombreCompleto email')
      .exec();
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentModel
      .findById(id)
      .populate('headId', 'nombreCompleto email')
      .populate('teacherIds', 'nombreCompleto email')
      .exec();

    if (!department) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    return department;
  }

  async findByCode(code: string): Promise<Department> {
    const department = await this.departmentModel
      .findOne({ code })
      .populate('headId', 'nombreCompleto email')
      .exec();

    if (!department) {
      throw new NotFoundException(
        `Departamento con código ${code} no encontrado`,
      );
    }

    return department;
  }

  async findByHeadId(headId: string): Promise<Department[]> {
    return this.departmentModel
      .find({ headId: new Types.ObjectId(headId), isActive: true })
      .exec();
  }

  async addTeacher(
    departmentId: string,
    teacherId: string,
  ): Promise<Department> {
    const department = await this.findOne(departmentId);

    if (!department.teacherIds.some((id) => id.toString() === teacherId)) {
      department.teacherIds.push(new Types.ObjectId(teacherId));
      await department.save();
    }

    return department;
  }

  async removeTeacher(
    departmentId: string,
    teacherId: string,
  ): Promise<Department> {
    const department = await this.findOne(departmentId);

    department.teacherIds = department.teacherIds.filter(
      (id) => id.toString() !== teacherId,
    );

    return department.save();
  }

  async getDepartmentStats(departmentId: string, semester: string): Promise<any> {
    const department = await this.departmentModel
      .findById(departmentId)
      .populate('teacherIds', 'nombreCompleto email')
      .exec();

    if (!department) {
      throw new NotFoundException(`Departamento con ID ${departmentId} no encontrado`);
    }

    // Obtener cursos del departamento
    const courses = await this.coursesService.findByDepartment(departmentId, semester);
    
    // Obtener estudiantes con NEE
    const studentsWithNEE = await this.studentsService.findByDepartmentWithNEE(departmentId, semester);
    
    // Obtener ajustes del departamento
    const adjustments = await this.adjustmentsService.findByDepartment(departmentId ?? '', semester);

    return {
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
        totalTeachers: department.teacherIds.length,
      },
      stats: {
        totalCourses: courses.length,
        totalStudentsWithNEE: studentsWithNEE.length,
        totalAdjustments: adjustments.length,
        adjustmentsByStatus: adjustments.reduce((acc, curr) => {
          acc[curr.estado] = (acc[curr.estado] || 0) + 1;
          return acc;
        }, {}),
      },
      lastUpdated: new Date(),
    };
  }

  async getDepartmentStudentsWithNEE(departmentId: string, semester: string): Promise<any[]> {
    const students = await this.studentsService.findByDepartmentWithNEE(departmentId, semester);
    
    return students.map(student => ({
      id: student._id,
      nombreCompleto: student.nombreCompleto,
      rut: student.rut,
      email: student.email,
      career: student.career,
      semester: student.semester,
      adjustments: student.adjustments?.map(adj => ({
        id: adj._id,
        type: adj.type,
        estado: adj.estado,
        createdAt: adj.createdAt,
      })) || [],
    }));
  }

  async getTeachersByDepartment(departmentId: string, semester?: string): Promise<any[]> {
    const department = await this.departmentModel
      .findById(departmentId)
      .populate({
        path: 'teacherIds',
        select: 'nombreCompleto email roles',
        match: { isActive: true },
      })
      .exec();

    if (!department) {
      throw new NotFoundException(
        `Departamento con ID ${departmentId} no encontrado`,
      );
    }

    // Obtener estadísticas de cada docente
    const teachersWithStats = await Promise.all(
      department.teacherIds.map(async (teacher: any) => {
        const courses = await this.coursesService.findByTeacher(teacher._id.toString(), semester || '2025-1');
        let studentsWithNEE = 0;
        let totalAdjustments = 0;
        let pendingAdjustments = 0;

        for (const course of courses) {
          const adjustments = await this.adjustmentsService.findByCourseNrc(
            course.nrc,
            semester,
          );
          
          const courseAdjustments = adjustments.filter(adj => 
            adj.currentAdjustments.some(ca => ca.courseNrc === course.nrc)
          );
          
          studentsWithNEE += new Set(
            courseAdjustments.flatMap(adj => adj.studentId.toString())
          ).size;
          
          totalAdjustments += courseAdjustments.length;
          pendingAdjustments += courseAdjustments.filter(adj => 
            adj.currentAdjustments && adj.currentAdjustments.some(ca => ca.estado === AdjustmentStatus.PENDING && ca.courseNrc === course.nrc)
          ).length;
        }

        return {
          id: teacher._id,
          nombreCompleto: teacher.nombreCompleto,
          email: teacher.email,
          courses: courses.length,
          studentsWithNEE,
          totalAdjustments,
          pendingAdjustments,
        };
      })
    );

    return teachersWithStats;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.departmentModel
      .findByIdAndUpdate(id, updateDepartmentDto, { new: true })
      .exec();

    if (!department) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    return department;
  }

  async remove(id: string): Promise<void> {
    const result = await this.departmentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
  }
}
