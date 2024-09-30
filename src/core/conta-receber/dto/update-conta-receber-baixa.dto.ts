import { PartialType } from '@nestjs/swagger';
import { CreateContaReceberBaixaDto } from './create-conta-receber-baixa.dto';
import { IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class UpdateContaReceberBaixaDto extends PartialType(
  CreateContaReceberBaixaDto,
) {
  @IsNotEmpty({ message: `ID ${EMensagem.DEVE_SER_INFORMADO}` })
  id: number;
}
