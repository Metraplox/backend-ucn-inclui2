import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HawaiiStudentDto } from './dto/hawaii-student.dto';
import { HawaiiCourseDto } from './dto/hawaii-course.dto';
import { HawaiiEnrollmentDto } from './dto/hawaii-enrollment.dto';

@Injectable()
export class HawaiiService {
  private readonly baseUrl = 'https://api.hawaii.ucn.cl';
  private readonly apiKey = process.env.HAWAII_API_KEY;
  private readonly token = process.env.HAWAII_API_TOKEN;

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      'x-api-key': this.apiKey,
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async getEstudiantes(): Promise<HawaiiStudentDto[]> {
    try {
      const response: AxiosResponse<HawaiiStudentDto[]> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/estudiantes`, {
          headers: this.getHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error al obtener estudiantes desde Hawaii API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOferta(semester: string): Promise<HawaiiCourseDto[]> {
    try {
      const response: AxiosResponse<HawaiiCourseDto[]> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/oferta?semestre=${semester}`, {
          headers: this.getHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error al obtener oferta académica desde Hawaii API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getInscripcion(
    semester: string,
  ): Promise<HawaiiEnrollmentDto[]> {
    try {
      const response: AxiosResponse<HawaiiEnrollmentDto[]> =
        await firstValueFrom(
          this.httpService.get(
            `${this.baseUrl}/inscripcion?semestre=${semester}`,
            {
              headers: this.getHeaders(),
            },
          ),
        );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error al obtener inscripciones desde Hawaii API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
