import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
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

  async getTeachersByDepartment(departmentId: string): Promise<any[]> {
    const department = await this.departmentModel
      .findById(departmentId)
      .populate('teacherIds')
      .exec();

    if (!department) {
      throw new NotFoundException(
        `Departamento con ID ${departmentId} no encontrado`,
      );
    }

    return department.teacherIds;
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
