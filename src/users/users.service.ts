import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPublicData } from './interfaces/user-public-data.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private toPublicUserData(
    userDocOrObject:
      | (Document<unknown, {}, User> & User)
      | (User & { _id: import('mongoose').Types.ObjectId }),
  ): UserPublicData {
    // Si es un documento Mongoose, convertirlo a objeto. Si ya es un objeto (de .lean()), usarlo directamente.
    const userObject =
      'toObject' in userDocOrObject
        ? userDocOrObject.toObject()
        : userDocOrObject;

    // Extraer explícitamente los campos para UserPublicData
    // Esto evita problemas con __v o campos inesperados de la desestructuración.
    return {
      _id: userObject._id.toString(),
      email: userObject.email,
      nombreCompleto: userObject.nombreCompleto,
      roles: userObject.roles,
      isActive: userObject.isActive,
      createdAt: userObject.createdAt,
      updatedAt: userObject.updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserPublicData> {
    const { email, password, nombreCompleto, roles, isActive } = createUserDto;

    const existingUserByEmail = await this.userModel.findOne({ email }).exec();
    if (existingUserByEmail) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserDoc = new this.userModel({
      email,
      password_hash: hashedPassword,
      nombreCompleto,
      roles: roles || [UserRole.STUDENT],
      isActive: isActive === undefined ? true : isActive,
    });

    try {
      const savedUser = await newUserDoc.save();
      return this.toPublicUserData(savedUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocurrió un error al crear el usuario.',
      );
    }
  }

  async findAll(): Promise<UserPublicData[]> {
    const users = await this.userModel
      .find()
      .select('-password_hash')
      .lean()
      .exec();
    return users.map(
      (user) =>
        ({
          ...user,
          _id: user._id.toString(),
        }) as UserPublicData,
    );
  }

  async findOneById(id: string): Promise<UserPublicData> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('El ID proporcionado no es válido.');
    }
    // Usar .lean() para obtener un objeto plano y facilitar la transformación.
    const userFromDb = await this.userModel
      .findById(id)
      .select('-password_hash')
      .lean()
      .exec();
    if (!userFromDb) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    // userFromDb ya es un objeto plano aquí debido a .lean() y no tiene password_hash.
    // _id es Types.ObjectId.
    return {
      _id: userFromDb._id.toString(),
      email: userFromDb.email,
      nombreCompleto: userFromDb.nombreCompleto,
      roles: userFromDb.roles,
      isActive: userFromDb.isActive,
      createdAt: userFromDb.createdAt,
      updatedAt: userFromDb.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    // Este método sí debe devolver el password_hash (documento completo) para la validación en AuthService
    return this.userModel.findOne({ email }).exec();
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userModel.find({ roles: role }).exec();
  }

  async findByRoles(roles: UserRole[]): Promise<User[]> {
    return this.userModel.find({ roles: { $in: roles } }).exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserPublicData> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('El ID proporcionado no es válido.');
    }
    const existingUserDoc = await this.userModel.findById(id).exec();
    if (!existingUserDoc) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    const {
      email: newEmail,
      password,
      nombreCompleto,
      roles,
      isActive,
    } = updateUserDto;

    if (newEmail && newEmail !== existingUserDoc.email) {
      const userWithNewEmail = await this.userModel
        .findOne({ email: newEmail })
        .exec();
      if (userWithNewEmail) {
        throw new ConflictException(
          'El nuevo correo electrónico ya está registrado por otro usuario.',
        );
      }
      existingUserDoc.email = newEmail;
    }

    if (nombreCompleto !== undefined) {
      existingUserDoc.nombreCompleto = nombreCompleto;
    }
    if (roles !== undefined) {
      existingUserDoc.roles = roles;
    }
    if (isActive !== undefined) {
      existingUserDoc.isActive = isActive;
    }

    if (password) {
      existingUserDoc.password_hash = await bcrypt.hash(password, 10);
    }

    try {
      const updatedUser = await existingUserDoc.save();
      return this.toPublicUserData(updatedUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocurrió un error al actualizar el usuario.',
      );
    }
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('El ID proporcionado no es válido.');
    }
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return { deleted: true };
  }
}
