import { ApiProperty } from '@nestjs/swagger';

export class HawaiiStudentDto {
  @ApiProperty({ description: 'RUT del estudiante (incluyendo dígito verificador)' })
  rut: string;

  @ApiProperty({ description: 'Apellidos del estudiante' })
  apellidos: string;

  @ApiProperty({ description: 'Nombres del estudiante' })
  nombres: string;

  @ApiProperty({ description: 'Correo electrónico institucional', nullable: true })
  email_ucn: string | null;

  /**
   * Parsea el RUT completo para obtener el número sin dígito verificador
   * @returns El número de RUT sin dígito verificador
   */
  getNumeroRut(): string {
    return this.rut.slice(0, -1);
  }

  /**
   * Obtiene el dígito verificador del RUT
   * @returns El dígito verificador
   */
  getDigitoVerificador(): string {
    return this.rut.slice(-1);
  }

  /**
   * Obtiene el nombre completo formateado
   * @returns Nombre completo en formato "nombres apellidos"
   */
  getNombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`;
  }
}
