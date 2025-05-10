import { UserRole } from '../schemas/user.schema';

export interface UserPublicData {
  _id: string; // o el tipo de ObjectId si se prefiere, pero string es común para respuestas API
  email: string;
  nombreCompleto: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
