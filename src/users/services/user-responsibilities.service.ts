import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserResponsibilitiesService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async assignDepartmentHead(
    userId: string,
    departmentIds: string[],
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const objectIds = departmentIds.map((id) => new Types.ObjectId(id));

    user.additionalResponsibilities = {
      ...user.additionalResponsibilities,
      isDepartmentHead: true,
      departmentIds: objectIds,
    };

    return user.save();
  }

  async assignCareerHead(userId: string, careerIds: string[]): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const objectIds = careerIds.map((id) => new Types.ObjectId(id));

    user.additionalResponsibilities = {
      ...user.additionalResponsibilities,
      isCareerHead: true,
      careerIds: objectIds,
    };

    return user.save();
  }

  async assignDIDDECStaff(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    user.additionalResponsibilities = {
      ...user.additionalResponsibilities,
      isDIDDECStaff: true,
    };

    return user.save();
  }

  async removeResponsibility(
    userId: string,
    responsibilityType: 'department' | 'career' | 'diddec',
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    switch (responsibilityType) {
      case 'department':
        user.additionalResponsibilities.isDepartmentHead = false;
        user.additionalResponsibilities.departmentIds = [];
        break;
      case 'career':
        user.additionalResponsibilities.isCareerHead = false;
        user.additionalResponsibilities.careerIds = [];
        break;
      case 'diddec':
        user.additionalResponsibilities.isDIDDECStaff = false;
        break;
      default:
        throw new BadRequestException('Tipo de responsabilidad inválido');
    }

    return user.save();
  }

  async addDepartmentToHead(
    userId: string,
    departmentId: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (!user.additionalResponsibilities?.isDepartmentHead) {
      throw new BadRequestException('El usuario no es jefe de departamento');
    }

    const deptId = new Types.ObjectId(departmentId);
    if (!user.additionalResponsibilities.departmentIds) {
      user.additionalResponsibilities.departmentIds = [];
    }

    if (
      !user.additionalResponsibilities.departmentIds.some((id) =>
        id.equals(deptId),
      )
    ) {
      user.additionalResponsibilities.departmentIds.push(deptId);
      return user.save();
    }

    return user;
  }

  async removeDepartmentFromHead(
    userId: string,
    departmentId: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (!user.additionalResponsibilities?.isDepartmentHead) {
      throw new BadRequestException('El usuario no es jefe de departamento');
    }

    user.additionalResponsibilities.departmentIds =
      user.additionalResponsibilities.departmentIds?.filter(
        (id) => !id.equals(new Types.ObjectId(departmentId)),
      ) || [];

    // Si no tiene más departamentos, quitar el rol de jefe
    if (user.additionalResponsibilities.departmentIds.length === 0) {
      user.additionalResponsibilities.isDepartmentHead = false;
    }

    return user.save();
  }

  async addCareerToHead(userId: string, careerId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (!user.additionalResponsibilities?.isCareerHead) {
      throw new BadRequestException('El usuario no es jefe de carrera');
    }

    const carId = new Types.ObjectId(careerId);
    if (!user.additionalResponsibilities.careerIds) {
      user.additionalResponsibilities.careerIds = [];
    }

    if (
      !user.additionalResponsibilities.careerIds.some((id) => id.equals(carId))
    ) {
      user.additionalResponsibilities.careerIds.push(carId);
      return user.save();
    }

    return user;
  }

  async removeCareerFromHead(userId: string, careerId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (!user.additionalResponsibilities?.isCareerHead) {
      throw new BadRequestException('El usuario no es jefe de carrera');
    }

    user.additionalResponsibilities.careerIds =
      user.additionalResponsibilities.careerIds?.filter(
        (id) => !id.equals(new Types.ObjectId(careerId)),
      ) || [];

    // Si no tiene más carreras, quitar el rol de jefe
    if (user.additionalResponsibilities.careerIds.length === 0) {
      user.additionalResponsibilities.isCareerHead = false;
    }

    return user.save();
  }

  async getDepartmentHeads(): Promise<User[]> {
    return this.userModel
      .find({
        'additionalResponsibilities.isDepartmentHead': true,
        isActive: true,
      })
      .exec();
  }

  async getCareerHeads(): Promise<User[]> {
    return this.userModel
      .find({
        'additionalResponsibilities.isCareerHead': true,
        isActive: true,
      })
      .exec();
  }

  async getDIDDECStaff(): Promise<User[]> {
    return this.userModel
      .find({
        'additionalResponsibilities.isDIDDECStaff': true,
        isActive: true,
      })
      .exec();
  }

  async getUserResponsibilities(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate('additionalResponsibilities.departmentIds')
      .populate('additionalResponsibilities.careerIds')
      .exec();

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return {
      userId: user._id,
      email: user.email,
      nombreCompleto: user.nombreCompleto,
      roles: user.roles,
      additionalResponsibilities: user.additionalResponsibilities,
    };
  }
}
