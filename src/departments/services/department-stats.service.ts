import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from '../schemas/department.schema';
import { DepartmentStatsResponseDto } from '../dto/department-stats-response.dto';
import {
  DepartmentStudentsNeeResponseDto,
  StudentNeeResponseDto,
} from '../dto/department-student-nee-response.dto';
import {
  DepartmentTeachersResponseDto,
  TeacherStatsDto,
} from '../dto/department-teachers-response.dto';
import {
  Adjustment,
  AdjustmentDocument,
  AdjustmentStatus,
} from '../../adjustments/schemas/adjustment.schema';
import { StudentsService } from '../../students/students.service';
import { CoursesService } from '../../courses/courses.service';
import { AdjustmentsService } from '../../adjustments/adjustments.service';
import {
  Student,
  StudentDocument,
} from '../../students/schemas/student.schema';
import { Course, CourseDocument } from '../../courses/schemas/course.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';

interface StudentWithNEE
  extends Omit<Student, 'rut' | '_id' | 'carreraId' | 'semestre'> {
  rut: string;
  _id: Types.ObjectId;
  carreraId?: Types.ObjectId | string;
  semestre: string;
  nombres: string;
  apellidos: string;
  email: string;
  hasSpecialNeeds?: boolean;
  disabilityType?: string;
}

interface AdjustmentWithStatus
  extends Omit<Adjustment, 'currentAdjustments' | '_id' | 'studentId'> {
  _id: Types.ObjectId | string;
  currentAdjustments: Array<{
    type: string;
    courseNrc: string;
    estado: AdjustmentStatus;
    [key: string]: any;
  }>;
  studentId: Types.ObjectId | string;
}

@Injectable()
export class DepartmentStatsService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
    private readonly adjustmentsService: AdjustmentsService,
  ) {}

  async getDepartmentByHead(
    headId: string,
  ): Promise<DepartmentDocument | null> {
    const department = await this.departmentModel
      .findOne({ headId: new Types.ObjectId(headId) })
      .populate<{ teacherIds: UserDocument[] }>(
        'teacherIds',
        'nombres apellidos email',
      )
      .lean()
      .exec();

    if (!department) {
      throw new NotFoundException(
        `Department head with ID ${headId} not found`,
      );
    }

    return department as unknown as DepartmentDocument;
  }

  async getDepartmentStats(
    departmentId: string,
    semester: string,
  ): Promise<DepartmentStatsResponseDto> {
    // Get department with populated teachers
    const department = await this.departmentModel
      .findById(departmentId)
      .populate<{
        teacherIds: UserDocument[];
      }>('teacherIds', 'nombres apellidos email')
      .lean()
      .exec();

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    // Get department courses for the semester
    const courses = await this.coursesService.findBySemester(semester);

    // Get students with special educational needs in the department
    const students = await this.studentsService.findAllWithNEE(semester);

    // Filter students by department if needed
    const departmentStudents = students.filter(
      (student) =>
        student.carreraId && student.carreraId.toString() === departmentId,
    ) as unknown as StudentWithNEE[];

    // Get adjustments for these students
    const studentIds = departmentStudents.map((s) => s._id);
    const adjustments = (await this.adjustmentsService.findAll({
      studentId: { $in: studentIds },
      semester,
    })) as unknown as AdjustmentWithStatus[];

    // Calculate adjustment statistics
    const implementedCount = adjustments.reduce((count, adj) => {
      return (
        count +
        (adj.currentAdjustments?.some(
          (a) => a.estado === AdjustmentStatus.IMPLEMENTED,
        )
          ? 1
          : 0)
      );
    }, 0);

    const pendingCount = adjustments.reduce((count, adj) => {
      return (
        count +
        (adj.currentAdjustments?.some(
          (a) => a.estado === AdjustmentStatus.PENDING,
        )
          ? 1
          : 0)
      );
    }, 0);

    // Calculate implementation rate
    const implementationRate =
      adjustments.length > 0
        ? Math.round((implementedCount / adjustments.length) * 100)
        : 0;

    return {
      totalTeachers: department.teacherIds.length,
      totalStudentsWithNEE: departmentStudents.length,
      totalAdjustments: adjustments.length,
      implementedAdjustments: implementedCount,
      pendingAdjustments: pendingCount,
      totalCourses: courses.length,
      implementationRate,
      generatedAt: new Date(),
      semester,
    };
  }

  async getDepartmentStudentsWithNEE(
    departmentId: string,
    semester: string,
  ): Promise<DepartmentStudentsNeeResponseDto> {
    // Get department to verify it exists
    const department = await this.departmentModel
      .findById(departmentId)
      .lean()
      .exec();

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    // Get students with special educational needs
    const allStudents = await this.studentsService.findAllWithNEE(semester);

    // Filter students by department
    const students = allStudents.filter(
      (student) =>
        student.carreraId && student.carreraId.toString() === departmentId,
    ) as unknown as StudentWithNEE[];

    // Get adjustments for students
    const studentIds = students.map((s) => s._id);
    const adjustments = await this.adjustmentsService.findAll({
      studentId: { $in: studentIds },
      semester,
    } as any);

    // Group adjustments by student
    const adjustmentsByStudent = new Map<string, AdjustmentDocument[]>();
    adjustments.forEach((adj: AdjustmentDocument) => {
      const studentId = adj.studentId.toString();
      if (!adjustmentsByStudent.has(studentId)) {
        adjustmentsByStudent.set(studentId, []);
      }
      adjustmentsByStudent.get(studentId)?.push(adj);
    });

    // Map students with their statistics
    const studentsWithNEE = students.map((student: StudentWithNEE) => {
      const studentId = student._id.toString();
      const studentAdjustments = adjustmentsByStudent.get(studentId) || [];
      const implementedAdjustments = studentAdjustments.filter(
        (adj: AdjustmentDocument) =>
          (adj as any).status === AdjustmentStatus.IMPLEMENTED,
      ).length;

      const totalAdjustments = studentAdjustments.length;
      const implementationRate =
        totalAdjustments > 0
          ? Math.round((implementedAdjustments / totalAdjustments) * 100)
          : 0;

      return {
        _id: new Types.ObjectId(studentId),
        fullName: `${student.nombres} ${student.apellidos}`,
        rut: student.rut,
        email: student.email,
        career: student.carreraId?.toString() || '',
        adjustmentsCount: studentAdjustments.length,
        implementedAdjustments,
        implementationRate,
        semester: student.semestre,
      } as unknown as StudentNeeResponseDto;
    });

    return {
      departmentId: department._id.toString(),
      departmentName: department.name,
      totalStudents: students.length,
      students: studentsWithNEE,
      generatedAt: new Date(),
      semester,
    };
  }

  async getTeachersByDepartment(
    departmentId: string,
    semester: string,
  ): Promise<DepartmentTeachersResponseDto> {
    // Get department with populated teachers
    const department = await this.departmentModel
      .findById(departmentId)
      .populate<{ teacherIds: UserDocument[] }>({
        path: 'teacherIds',
        select: 'nombres apellidos email roles',
        match: { isActive: true },
      })
      .lean()
      .exec();

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    // Get all department courses for the semester
    const courses = await this.coursesService.findBySemester(semester);

    // Group courses by teacher
    const coursesByTeacher = new Map<string, CourseDocument[]>();
    courses.forEach((course: CourseDocument) => {
      const courseWithTeacher = course as any; // Temporary type assertion
      const teacherId =
        courseWithTeacher.teacherId || courseWithTeacher.teacher?._id;
      if (teacherId) {
        const teacherIdStr = teacherId.toString();
        if (!coursesByTeacher.has(teacherIdStr)) {
          coursesByTeacher.set(teacherIdStr, []);
        }
        coursesByTeacher.get(teacherIdStr)?.push(course);
      }
    });

    // Get all students with NEE in the department
    const students = await this.studentsService.findAllWithNEE(semester);

    // Get all adjustments for these students
    const studentIds = students.map((s) => s._id);
    const adjustments = await this.adjustmentsService.findAll({
      studentId: { $in: studentIds },
      semester,
    } as any);

    // Process each teacher's statistics
    const teacherStats = await Promise.all(
      department.teacherIds.map(async (teacher) => {
        const teacherId = teacher._id.toString();
        const teacherCourses = coursesByTeacher.get(teacherId) || [];

        // Get teacher's adjustments and ensure they match the AdjustmentWithStatus type
        const teacherAdjustments = adjustments
          .filter((adj: any) => {
            const adjTeacherId =
              adj.teacherId?.toString() || adj.teacher?._id?.toString();
            return (
              adjTeacherId === teacherId &&
              adj.currentAdjustments &&
              adj.currentAdjustments.length > 0
            );
          })
          .map((adj) => ({
            ...adj,
            _id: new Types.ObjectId(adj._id),
            studentId: new Types.ObjectId(adj.studentId),
            currentAdjustments: adj.currentAdjustments.map((ca: any) => ({
              ...ca,
              estado: ca.estado || AdjustmentStatus.ACTIVE,
            })),
          })) as unknown as AdjustmentWithStatus[];

        // Count unique students with NEE in teacher's courses
        const studentSet = new Set<string>();
        for (const course of teacherCourses) {
          const courseWithStudents = course as any;
          if (courseWithStudents.students) {
            courseWithStudents.students.forEach((studentId: Types.ObjectId) => {
              studentSet.add(studentId.toString());
            });
          }
        }

        const studentsWithNEECount = Array.from(studentSet).filter((id) =>
          students.some((s) => s._id.toString() === id),
        ).length;

        const teacherAdjustmentsCount = teacherAdjustments.length;
        const implementedTeacherAdjustments = teacherAdjustments.reduce(
          (count, adj) => {
            return (
              count +
              adj.currentAdjustments.filter(
                (ca) => ca.estado === AdjustmentStatus.IMPLEMENTED,
              ).length
            );
          },
          0,
        );

        const implementationRate =
          teacherAdjustmentsCount > 0
            ? Math.round(
                (implementedTeacherAdjustments / teacherAdjustmentsCount) * 100,
              )
            : 0;

        return {
          _id: new Types.ObjectId(teacher._id.toString()),
          fullName: `${(teacher as any).nombres} ${(teacher as any).apellidos}`,
          email: (teacher as any).email,
          coursesCount: teacherCourses.length,
          studentsWithNeeCount: studentsWithNEECount,
          adjustmentsCount: teacherAdjustmentsCount,
          implementedAdjustments: implementedTeacherAdjustments,
          implementationRate,
        } as unknown as TeacherStatsDto;
      }),
    );

    return {
      departmentId: department._id.toString(),
      departmentName: department.name,
      totalTeachers: department.teacherIds.length,
      teachers: teacherStats,
      generatedAt: new Date(),
      semester,
    };
  }
}
