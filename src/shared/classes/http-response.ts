import { EMensagem } from '../enums/mensagem.enum';
import { IResponse } from '../interfaces/response.interface';

export class HttpResponse<T> implements IResponse<T> {
  message = '';
  data: T | null | undefined;
  count!: number;

  constructor(data: T | null | undefined, message?: '', count?: number) {
    this.message = message;
    this.data = data;
    this.count = count;
  }

  onSuccess(message: string): IResponse<T> {
    this.message = message;
    return this;
  }

  onCreated(): IResponse<T> {
    this.message = EMensagem.SALVO_SUCESSO;
    return this;
  }

  onUpdate(): IResponse<T> {
    this.message = EMensagem.ATUALIZADO_SUCESSO;
    return this;
  }

  onUnactivated(): IResponse<T> {
    this.message = EMensagem.DESATIVADO_SUCESSO;
    return this;
  }
}
