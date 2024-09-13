import { PartialType } from '@nestjs/swagger';
import { CreateContaReceberBaixaDto } from './create-conta-receber-baixa.dto';

export class UpdateContaReceberBaixaDto extends PartialType(
  CreateContaReceberBaixaDto,
) {}
