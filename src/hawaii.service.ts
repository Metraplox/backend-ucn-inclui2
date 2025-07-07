import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class HawaiiService {
  private readonly logger = new Logger(HawaiiService.name);

  constructor(private readonly httpService: HttpService) {}

  async getOferta(semester: string): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.httpService
        .get(`https://losvilos.ucn.cl/hawaii/api/oferta?${semester}`, {
          headers: { 'X-HAWAII-AUTH': 'qnbdg8k20jio90' },
        })
        .toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta de la API de Hawaii');
      }

      return response;
    } catch (error) {
      this.logger.error('Error fetching oferta', error);
      throw error;
    }
  }

  async getEstudiantes(): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.httpService
        .get('https://losvilos.ucn.cl/hawaii/api/estudiantes', {
          headers: { 'X-HAWAII-AUTH': 'mnqpkUk00jioab' },
        })
        .toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta de la API de Hawaii');
      }

      return response;
    } catch (error) {
      this.logger.error('Error fetching estudiantes', error);
      throw error;
    }
  }

  async getInscripcion(semester: string): Promise<AxiosResponse<any, any>> {
    try {
      const response = await this.httpService
        .get(`https://losvilos.ucn.cl/hawaii/api/inscripcion?${semester}`, {
          headers: { 'X-HAWAII-AUTH': 'knf3g8k29pjht8' },
        })
        .toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta de la API de Hawaii');
      }

      return response;
    } catch (error) {
      this.logger.error('Error fetching inscripcion', error);
      throw error;
    }
  }
}
