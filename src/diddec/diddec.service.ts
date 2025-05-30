import { Injectable, Logger } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { AdjustmentsService } from '../adjustments/adjustments.service';
import { CoursesService } from '../courses/courses.service';
import { CareersService } from '../careers/careers.service';
import { Types } from 'mongoose';

// Interfaces exportadas para estadísticas y resultados
export interface TrendStatistics {
  semester: string;
  totalStudentsWithNEE: number;
  totalAdjustments: number;
  totalCourses: number;
  totalCareers: number;
  acknowledgedAdjustments: number;
  pendingAdjustments: number;
  acknowledgedPercentage: number;
}

export interface DepartmentCompliance {
  department: string;
  totalAdjustments: number;
  acknowledgedAdjustments: number;
  complianceRate: number;
}

@Injectable()
export class DiddecService {
  private readonly logger = new Logger(DiddecService.name);
  constructor(
    private readonly studentsService: StudentsService,
    private readonly adjustmentsService: AdjustmentsService,
    private readonly coursesService: CoursesService,
    private readonly careersService: CareersService,
  ) {}

  async getGeneralStatistics(semester: string) {
    const totalStudentsWithNEE = await this.studentsService.countStudentsWithNEE(semester);
    const totalAdjustments = await this.adjustmentsService.countAdjustments(semester);
    const totalCourses = await this.coursesService.countCourses(semester);
    const totalCareers = await this.careersService.countCareers(semester);
    
    const acknowledgedAdjustments = await this.adjustmentsService.countAcknowledgedAdjustments(semester);
    const pendingAdjustments = await this.adjustmentsService.countPendingAdjustments(semester);
    
    const acknowledgedPercentage = totalAdjustments > 0 
      ? (acknowledgedAdjustments / totalAdjustments) * 100 
      : 0;
    
    return {
      semester,
      totalStudentsWithNEE,
      totalAdjustments,
      totalCourses,
      totalCareers,
      acknowledgedAdjustments,
      pendingAdjustments,
      acknowledgedPercentage: parseFloat(acknowledgedPercentage.toFixed(2)),
    };
  }

  async getSemesterReport(semester: string) {
    const statistics = await this.getGeneralStatistics(semester);
    
    // Get adjustments by type for the semester
    const adjustmentsByType = await this.adjustmentsService.getAdjustmentCountByType(semester);
    
    // Get students by career for the semester
    const studentsByCareer = await this.studentsService.getStudentCountByCareer(semester);
    
    // Get top courses with most students with NEE
    const topCoursesWithNEE = await this.coursesService.getTopCoursesWithNEE(semester, 10);
    
    return {
      statistics,
      adjustmentsByType,
      studentsByCareer,
      topCoursesWithNEE,
    };
  }

  async getAllStudentsWithNEE(semester: string) {
    return this.studentsService.findAllWithNEE(semester);
  }

  async getAdjustmentTrends(years: number = 3): Promise<{ years: number; startYear: number; endYear: number; trends: TrendStatistics[] }> {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years;
    
    const trends: TrendStatistics[] = [];
    
    for (let year = startYear; year <= currentYear; year++) {
      for (let period = 1; period <= 2; period++) {
        try {
          const semester = `${year}-${period}`;
          const statistics = await this.getGeneralStatistics(semester);
          trends.push(statistics);
        } catch (error) {
          this.logger.error(`Error al obtener estadísticas para ${year}-${period}: ${error.message}`);
          // Añadir un objeto con valores predeterminados para mantener la consistencia
          trends.push({
            semester: `${year}-${period}`,
            totalStudentsWithNEE: 0,
            totalAdjustments: 0,
            totalCourses: 0,
            totalCareers: 0,
            acknowledgedAdjustments: 0,
            pendingAdjustments: 0,
            acknowledgedPercentage: 0
          });
        }
      }
    }
    
    return {
      years,
      startYear,
      endYear: currentYear,
      trends,
    };
  }
  
  async getAdjustmentComplianceByDepartment(semester: string): Promise<DepartmentCompliance[]> {
    // Este método calculará la tasa de cumplimiento de ajustes por departamento
    const departments = await this.coursesService.getDepartments(semester);
    
    const result: DepartmentCompliance[] = [];
    
    for (const department of departments) {
      try {
        // Como el resultado de getDepartments son objetos con name y count, no necesitamos _id
        const departmentName = department.name;
        
        const totalAdjustments = await this.adjustmentsService.countAdjustmentsByDepartment(
          departmentName,
          semester
        );
        
        const acknowledgedAdjustments = await this.adjustmentsService.countAcknowledgedAdjustmentsByDepartment(
          departmentName,
          semester
        );
        
        const complianceRate = totalAdjustments > 0 
          ? (acknowledgedAdjustments / totalAdjustments) * 100 
          : 0;
        
        result.push({
          department: departmentName,
          totalAdjustments,
          acknowledgedAdjustments,
          complianceRate: parseFloat(complianceRate.toFixed(2)),
        });
      } catch (error) {
        this.logger.error(`Error al procesar departamento: ${error.message}`);
      }
    }
    
    return result.sort((a, b) => b.complianceRate - a.complianceRate);
  }
}
