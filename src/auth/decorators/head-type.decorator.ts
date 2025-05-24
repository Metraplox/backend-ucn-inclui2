import { SetMetadata } from '@nestjs/common';

export const HeadType = (...types: ('department' | 'career')[]) =>
  SetMetadata('headTypes', types);
