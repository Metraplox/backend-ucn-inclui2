import { Injectable } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { AdjustmentsService } from '../adjustments/adjustments.service';
import { CoursesService } from '../courses/courses.service';
import { CareersService } from '../careers/careers.service';
import { Types } from 'mongoose';

@Injectable()
export class DiddecService {
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

  async getAdjustmentTrends(years: number = 3) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years;
    
    const trends = [];
    
    for (let year = startYear; year <= currentYear; year++) {
      for (let period = 1; period <= 2; period++) {
        const semester = `${year}-${period}`;
        const statistics = await this.getGeneralStatistics(semester);
        trends.push(statistics);
      }
    }
    
    return {
      years,
      startYear,
      endYear: currentYear,
      trends,
    };
  }
  
  async getAdjustmentComplianceByDepartment(semester: string) {
    // This method will calculate the compliance rate of adjustments by department
    const departments = await this.coursesService.getDepartments(semester);
    const result = [];
    
    for (const department of departments) {
      const totalAdjustments = await this.adjustmentsService.countAdjustmentsByDepartment(
        department._id.toString(),
        semester
      );
      
      const acknowledgedAdjustments = await this.adjustmentsService.countAcknowledgedAdjustmentsByDepartment(
        department._id.toString(),
        semester
      );
      
      const complianceRate = totalAdjustments > 0 
        ? (acknowledgedAdjustments / totalAdjustments) * 100 
        : 0;
      
      result.push({
        department: department.name,
        totalAdjustments,
        acknowledgedAdjustments,
        complianceRate: parseFloat(complianceRate.toFixed(2)),
      });
    }
    
    return result.sort((a, b) => b.complianceRate - a.complianceRate);
  }
}
