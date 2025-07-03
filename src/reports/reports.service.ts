import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from './schemas/report.schema';
import { StudentsService } from '../students/students.service';
import { AdjustmentsService } from '../adjustments/adjustments.service';
import { DocumentsService } from '../documents/documents.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    private studentsService: StudentsService,
    private adjustmentsService: AdjustmentsService,
    private documentsService: DocumentsService,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const createdReport = new this.reportModel(createReportDto);
    return createdReport.save();
  }

  async findAll(userId: string, role: string): Promise<Report[]> {
    return this.reportModel.find({ userId, role }).exec();
  }

  async generateStudentReport(studentId: string, semester: string): Promise<Report> {
    const student = await this.studentsService.findOne(studentId);
    const adjustments = await this.adjustmentsService.findByStudentId(studentId);
    const documents = await this.documentsService.findByUserId(studentId);

    const reportData = {
      userId: studentId,
      role: 'ESTUDIANTE',
      type: 'StudentProgress',
      data: {
        studentInfo: student,
        adjustments,
        documents,
        semester,
      },
      createdAt: new Date(),
    };

    return this.create(reportData);
  }

  async generateTeacherReport(teacherId: string, semester: string): Promise<Report> {
    const students = await this.studentsService.findByUserId(teacherId);
    const adjustments = await this.adjustmentsService.findByTutorId(teacherId);

    const reportData = {
      userId: teacherId,
      role: 'DOCENTE',
      type: 'TeacherOverview',
      data: {
        students,
        adjustments,
        semester,
      },
      createdAt: new Date(),
    };

    return this.create(reportData);
  }

  async generateHeadReport(headId: string, semester: string): Promise<Report> {
    const students = await this.studentsService.findByUserId(headId);
    const adjustments = await this.adjustmentsService.findByCoordinatorId(headId);

    const reportData = {
      userId: headId,
      role: 'JEFE_CARRERA',
      type: 'HeadOverview',
      data: {
        students,
        adjustments,
        semester,
      },
      createdAt: new Date(),
    };

    return this.create(reportData);
  }

  async generateDiddecReport(diddecId: string, semester: string): Promise<Report> {
    const students = await this.studentsService.findAll(semester);
    const adjustments = await this.adjustmentsService.findAll(semester);
    const documents = await this.documentsService.getAllDocuments();

    const reportData = {
      userId: diddecId,
      role: 'DIDDEC',
      type: 'DiddecSummary',
      data: {
        students,
        adjustments,
        documents,
        semester,
      },
      createdAt: new Date(),
    };

    return this.create(reportData);
  }

  async generateIncluyeReport(incluyeId: string, semester: string): Promise<Report> {
    const students = await this.studentsService.findAll(semester);
    const adjustments = await this.adjustmentsService.findAll(semester);
    const documents = await this.documentsService.findAll();

    const reportData = {
      userId: incluyeId,
      role: 'INCLUYE',
      type: 'IncluyeSummary',
      data: {
        students,
        adjustments,
        documents,
        semester,
      },
      createdAt: new Date(),
    };

    return this.create(reportData);
  }

  async getStudentsWithNEE(
    semester?: string,
    career?: string,
    active?: boolean,
    user?: any,
  ): Promise<any[]> {
    const filter: any = {};
    
    if (semester) {
      filter.semester = semester;
    }
    
    if (career) {
      filter.career = career;
    }
    
    if (active !== undefined) {
      filter.isActive = active;
    }

    return await this.studentsService.findWithNEE(filter, user);
  }

  async getStudentAcademicHistory(
    studentId: string,
    semester?: string,
    user?: any,
  ): Promise<any> {
    const student = await this.studentsService.findOne(studentId);
    const enrollments = await this.studentsService.getEnrollmentHistory(studentId, semester);
    const adjustments = await this.adjustmentsService.findByStudentId(studentId);

    const historyBySemester = enrollments.reduce((acc: any, enrollment: any) => {
      if (!acc[enrollment.semester]) {
        acc[enrollment.semester] = {
          semester: enrollment.semester,
          courses: [],
          adjustments: [],
        };
      }
      
      acc[enrollment.semester].courses.push({
        courseId: enrollment.courseId,
        courseName: enrollment.courseName,
        teacherName: enrollment.teacherName,
        grade: enrollment.grade,
        status: enrollment.status,
      });

      return acc;
    }, {});

    adjustments.forEach((adjustment: any) => {
      if (historyBySemester[adjustment.semester]) {
        historyBySemester[adjustment.semester].adjustments.push({
          adjustmentId: adjustment._id,
          categoryName: adjustment.categoryName,
          description: adjustment.description,
          isActive: adjustment.isActive,
          createdAt: adjustment.createdAt,
        });
      }
    });

    return {
      student: {
        id: student._id,
        rut: student.rut,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        career: student.career,
      },
      history: Object.values(historyBySemester),
    };
  }
}
