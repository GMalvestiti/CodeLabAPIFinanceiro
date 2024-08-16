import { IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class CreateContaReceberBaixaDto {
  @IsNotEmpty({ message: `idContaReceber ${EMensagem.NAO_PODE_SER_VAZIO}` })
  idContaReceber: number;

  @IsNotEmpty({ message: `idUsuarioBaixa ${EMensagem.NAO_PODE_SER_VAZIO}` })
  idUsuarioBaixa: number;
  
  @IsNotEmpty({ message: `valorPago ${EMensagem.NAO_PODE_SER_VAZIO}` })
  valorPago: number;
}
