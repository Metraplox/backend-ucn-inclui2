import { ApiProperty } from '@nestjs/swagger';

export class HawaiiEnrollmentDto {
  @ApiProperty({ description: 'NRC del curso inscrito' })
  nrc: string;

  @ApiProperty({
    description: 'RUT del estudiante (incluye dígito verificador)',
  })
  rut: string;

  /**
   * Obtiene el número de RUT sin dígito verificador
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
}
