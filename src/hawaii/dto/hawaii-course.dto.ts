import { ApiProperty } from '@nestjs/swagger';

export class HawaiiCourseDto {
  @ApiProperty({ description: 'Período académico (formato YYYYPP)' })
  periodo: string;

  @ApiProperty({ description: 'NRC del curso (identificador único)' })
  nrc: string;

  @ApiProperty({ description: 'Nombre de la asignatura' })
  asignatura: string;

  @ApiProperty({ description: 'Paralelo del curso' })
  paralelo: string;

  @ApiProperty({ description: 'Código de la asignatura' })
  codigo: string;

  @ApiProperty({ description: 'Sede donde se imparte el curso' })
  sede: string;

  @ApiProperty({ description: 'Nombre del departamento responsable' })
  departamento: string;

  @ApiProperty({ description: 'Información de profesores (puede ser null)', nullable: true })
  profesores: string | null;

  /**
   * Obtiene el RUT del profesor principal si está disponible
   * @returns RUT del profesor o null
   */
  getProfesorRut(): string | null {
    if (!this.profesores) return null;
    const parts = this.profesores.split(',');
    return parts.length > 0 ? parts[0] : null;
  }

  /**
   * Obtiene el nombre completo del profesor principal si está disponible
   * @returns Nombre del profesor o null
   */
  getProfesorNombre(): string | null {
    if (!this.profesores) return null;
    const parts = this.profesores.split(',');
    return parts.length > 1 ? parts[1] : null;
  }

  /**
   * Determina si el profesor es titular o no
   * @returns 'TITULAR', 'NO TITULAR' o null si no hay información
   */
  getProfesorTipo(): string | null {
    if (!this.profesores) return null;
    const parts = this.profesores.split(',');
    return parts.length > 2 ? parts[2] : null;
  }
}
