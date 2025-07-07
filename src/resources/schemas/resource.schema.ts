import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ResourceDocument = Resource & Document;

export enum ResourceType {
  GUIDE = 'guide',
  MATERIAL = 'material',
  TEMPLATE = 'template',
  SUPPORT = 'support',
}

@Schema({ timestamps: true })
export class Resource {
  @ApiProperty({
    description: 'Resource unique ID',
    example: '605c72ef9167f86c2cabc789',
  })
  declare _id: string;

  @ApiProperty({
    description: 'Resource title',
    example: 'Guide for visual impairment adjustments',
  })
  @Prop({ required: true, type: String })
  title: string;

  @ApiProperty({
    description: 'Resource description',
    example:
      'This guide provides recommendations for students with visual impairment',
  })
  @Prop({ required: true, type: String })
  description: string;

  @ApiProperty({
    description: 'Resource type',
    enum: ResourceType,
    example: ResourceType.GUIDE,
  })
  @Prop({ required: true, type: String, enum: ResourceType })
  resourceType: ResourceType;

  @ApiProperty({
    description: 'File path in the server',
    example: '/uploads/resources/guide-visual-impairment.pdf',
  })
  @Prop({ required: true, type: String })
  filePath: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'guide-visual-impairment.pdf',
  })
  @Prop({ required: true, type: String })
  originalFilename: string;

  @ApiProperty({
    description: 'Academic semester (format YYYY-P)',
    example: '2025-1',
  })
  @Prop({ required: true, type: String })
  semester: string;

  @ApiProperty({
    description: 'Tags for resource categorization',
    example: ['visual', 'impairment', 'guide'],
  })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({
    description: 'Associated adjustment type IDs',
    type: [String],
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'AdjustmentType' }],
    default: [],
  })
  adjustmentTypeIds: Types.ObjectId[];

  @ApiProperty({
    description: 'Created by user ID',
    example: '605c72ef9167f86c2cabc123',
  })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-05-27T12:00:00Z',
  })
  declare createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-05-27T14:30:00Z',
  })
  declare updatedAt: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

// Create indexes for optimized queries
ResourceSchema.index({ semester: 1 });
ResourceSchema.index({ resourceType: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ adjustmentTypeIds: 1 });
