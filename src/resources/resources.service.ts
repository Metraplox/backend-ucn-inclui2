import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name)
    private resourceModel: Model<ResourceDocument>,
  ) {
    this.ensureUploadDirectories();
  }

  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'resources');

  private ensureUploadDirectories() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(
    createResourceDto: CreateResourceDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Resource> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Generate unique filename to prevent collisions
    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExt}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Create resource document
    const relativePath = path
      .join('uploads', 'resources', uniqueFilename)
      .replace(/\\/g, '/');

    const resource = new this.resourceModel({
      ...createResourceDto,
      filePath: relativePath,
      originalFilename: file.originalname,
      createdBy: new Types.ObjectId(userId),
    });

    return resource.save();
  }

  async findAll(
    semester?: string,
    resourceType?: string,
    tags?: string[],
  ): Promise<Resource[]> {
    const query: any = {};

    if (semester) {
      query.semester = semester;
    }

    if (resourceType) {
      query.resourceType = resourceType;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    return this.resourceModel.find(query).exec();
  }

  async findOne(id: string): Promise<Resource> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid resource ID: ${id}`);
    }

    const resource = await this.resourceModel.findById(id).exec();

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return resource;
  }

  async update(
    id: string,
    updateResourceDto: UpdateResourceDto,
  ): Promise<Resource> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid resource ID: ${id}`);
    }

    const updatedResource = await this.resourceModel
      .findByIdAndUpdate(id, updateResourceDto, { new: true })
      .exec();

    if (!updatedResource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return updatedResource;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid resource ID: ${id}`);
    }

    const resource = await this.resourceModel.findById(id).exec();

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // Delete file from disk if it exists
    const fullPath = path.join(process.cwd(), resource.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await this.resourceModel.findByIdAndDelete(id).exec();
  }

  async findByAdjustmentType(adjustmentTypeId: string): Promise<Resource[]> {
    if (!Types.ObjectId.isValid(adjustmentTypeId)) {
      throw new BadRequestException(
        `Invalid adjustment type ID: ${adjustmentTypeId}`,
      );
    }

    return this.resourceModel
      .find({ adjustmentTypeIds: new Types.ObjectId(adjustmentTypeId) })
      .exec();
  }

  async findBySearchTerm(
    searchTerm: string,
    semester?: string,
  ): Promise<Resource[]> {
    const query: any = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    if (semester) {
      query.semester = semester;
    }

    return this.resourceModel.find(query).exec();
  }
}
