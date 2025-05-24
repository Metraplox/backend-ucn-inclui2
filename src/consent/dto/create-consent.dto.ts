import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateConsentDto {
  @ApiProperty({
    description:
      'ID del documento para el cual se otorga/modifica el consentimiento.',
    example: '60c72b2f9b1d8c001f8e4a3c',
  })
  @IsMongoId({ message: 'El ID del documento debe ser un MongoID válido.' })
  @IsNotEmpty({ message: 'El ID del documento no puede estar vacío.' })
  documentId: string;

  @ApiProperty({
    description:
      'Estado del consentimiento (true para otorgado, false para no otorgado/revocado).',
    example: true,
  })
  @IsBoolean({
    message: 'El estado del consentimiento debe ser un valor booleano.',
  })
  @IsNotEmpty({ message: 'El estado del consentimiento no puede estar vacío.' })
  isConsentGiven: boolean;

  // studentId se tomará del usuario autenticado.
  // ipAddress y userAgent se pueden capturar en el servicio/controlador desde el objeto Request.
}
