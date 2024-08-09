import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';
import { CreateContaReceberBaixaDto } from './create-conta-receber-baixa.dto';
import { UpdateContaReceberBaixaDto } from './update-conta-receber-baixa.dto';

export class CreateContaReceberDto {
  @IsNotEmpty({ message: `idPessoa ${EMensagem.NAO_PODE_SER_VAZIO}` })
  idPessoa: number;

  @IsNotEmpty({ message: `pessoa ${EMensagem.NAO_PODE_SER_VAZIO}` })
  pessoa: string;

  @IsNotEmpty({ message: `idUsuarioLancamento ${EMensagem.NAO_PODE_SER_VAZIO}` })
  idUsuarioLancamento: number;

  @IsNotEmpty({ message: `valorTotal ${EMensagem.NAO_PODE_SER_VAZIO}` })
  valorTotal: number;

  @IsNotEmpty({ message: `pago ${EMensagem.NAO_PODE_SER_VAZIO}` })
  pago: boolean;

  @IsArray({ message: `baixa ${EMensagem.TIPO_INVALIDO}` })
  @Type(() => CreateContaReceberBaixaDto)
  baixa: CreateContaReceberBaixaDto[] | UpdateContaReceberBaixaDto[];
}
