export class CreateReportDto {
  userId: string;
  role: string;
  type: string;
  data: any;
  createdAt?: Date;
}
