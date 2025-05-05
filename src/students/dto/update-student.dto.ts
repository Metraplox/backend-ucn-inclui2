import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

// UpdateStudentDto hereda todas las propiedades de CreateStudentDto,
// pero PartialType las hace todas opcionales.
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
