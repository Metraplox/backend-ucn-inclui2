import { UserRole } from '../schemas/user.schema';
import { AdditionalResponsibilitiesDto } from '../dto/additional-responsibilities.dto';
export interface UserPublicData {
  _id: string; // o el tipo de ObjectId si se prefiere, pero string es común para respuestas API
  email: string;
  nombreCompleto: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  studentId?: string; // ID del perfil de estudiante, si el usuario es un estudiante
  additionalResponsibilities?: AdditionalResponsibilitiesDto;

}
