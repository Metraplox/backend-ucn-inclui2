import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Adjustment } from '../../adjustments/schemas/adjustment.schema';
import { Course } from '../../courses/schemas/course.schema';
import { User, UserRole } from '../../users/schemas/user.schema';
import { Department } from '../../departments/schemas/department.schema';

interface ComplianceByDepartment {
  departmentId: string;
  departmentName: string;
  totalAdjustments: number;
  reviewedAdjustments: number;
  pendingAdjustments: number;
  overdueAdjustments: number;
  complianceRate: number;
  lastUpdate: Date;
}

interface ComplianceByTeacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  department: string;
  totalAdjustments: number;
  reviewedAdjustments: number;
  pendingAdjustments: number;
  overdueAdjustments: number;
  complianceRate: number;
  averageReviewTime: number;
  lastReviewDate: Date;
}

@Injectable()
export class ComplianceReportService {
  constructor(
    @InjectModel(Adjustment.name) private adjustmentModel: Model<Adjustment>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  async getComplianceByDepartment(
    semester?: string,
    departmentFilter?: string,
    user?: any,
  ): Promise<ComplianceByDepartment[]> {
    const matchStage: any = {};
    
    if (semester) {
      matchStage.semester = semester;
    }
    
    if (departmentFilter) {
      matchStage['course.department'] = departmentFilter;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'departments',
          localField: 'course.departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' },
      { $match: matchStage },
      {
        $group: {
          _id: '$department._id',
          departmentName: { $first: '$department.name' },
          totalAdjustments: { $sum: 1 },
          reviewedAdjustments: {
            $sum: { $cond: [{ $ne: ['$reviewedAt', null] }, 1, 0] },
          },
          pendingAdjustments: {
            $sum: { $cond: [{ $eq: ['$reviewedAt', null] }, 1, 0] },
          },
          overdueAdjustments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$reviewedAt', null] },
                    { $lt: ['$dueDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          lastUpdate: { $max: '$updatedAt' },
        },
      },
      {
        $addFields: {
          complianceRate: {
            $multiply: [
              { $divide: ['$reviewedAdjustments', '$totalAdjustments'] },
              100,
            ],
          },
        },
      },
      { $sort: { complianceRate: -1 } },
    ];

    const results = await this.adjustmentModel.aggregate(pipeline as any);
    
    return results.map((result) => ({
      departmentId: result._id.toString(),
      departmentName: result.departmentName,
      totalAdjustments: result.totalAdjustments,
      reviewedAdjustments: result.reviewedAdjustments,
      pendingAdjustments: result.pendingAdjustments,
      overdueAdjustments: result.overdueAdjustments,
      complianceRate: Math.round(result.complianceRate * 100) / 100,
      lastUpdate: result.lastUpdate,
    }));
  }

  async getComplianceByTeacher(
    semester?: string,
    departmentFilter?: string,
    user?: any,
  ): Promise<ComplianceByTeacher[]> {
    const matchStage: any = {};
    
    if (semester) {
      matchStage.semester = semester;
    }
    
    if (departmentFilter) {
      matchStage['course.department'] = departmentFilter;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'users',
          localField: 'course.teacherId',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      { $unwind: '$teacher' },
      {
        $lookup: {
          from: 'departments',
          localField: 'course.departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' },
      { $match: matchStage },
      {
        $group: {
          _id: '$teacher._id',
          teacherName: { $first: { $concat: ['$teacher.firstName', ' ', '$teacher.lastName'] } },
          teacherEmail: { $first: '$teacher.email' },
          department: { $first: '$department.name' },
          totalAdjustments: { $sum: 1 },
          reviewedAdjustments: {
            $sum: { $cond: [{ $ne: ['$reviewedAt', null] }, 1, 0] },
          },
          pendingAdjustments: {
            $sum: { $cond: [{ $eq: ['$reviewedAt', null] }, 1, 0] },
          },
          overdueAdjustments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$reviewedAt', null] },
                    { $lt: ['$dueDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          averageReviewTime: {
            $avg: {
              $cond: [
                { $ne: ['$reviewedAt', null] },
                { $subtract: ['$reviewedAt', '$createdAt'] },
                null,
              ],
            },
          },
          lastReviewDate: { $max: '$reviewedAt' },
        },
      },
      {
        $addFields: {
          complianceRate: {
            $multiply: [
              { $divide: ['$reviewedAdjustments', '$totalAdjustments'] },
              100,
            ],
          },
          averageReviewTime: {
            $divide: ['$averageReviewTime', 86400000],
          },
        },
      },
      { $sort: { complianceRate: -1 } },
    ];

    const results = await this.adjustmentModel.aggregate(pipeline as any);
    
    return results.map((result) => ({
      teacherId: result._id.toString(),
      teacherName: result.teacherName,
      teacherEmail: result.teacherEmail,
      department: result.department,
      totalAdjustments: result.totalAdjustments,
      reviewedAdjustments: result.reviewedAdjustments,
      pendingAdjustments: result.pendingAdjustments,
      overdueAdjustments: result.overdueAdjustments,
      complianceRate: Math.round(result.complianceRate * 100) / 100,
      averageReviewTime: Math.round((result.averageReviewTime || 0) * 100) / 100,
      lastReviewDate: result.lastReviewDate,
    }));
  }
}
