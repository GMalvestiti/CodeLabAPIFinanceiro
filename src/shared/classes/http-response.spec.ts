import { EMensagem } from '../enums/mensagem.enum';
import { HttpResponse } from './http-response';

describe('HttpResponse', () => {
  it('should set the message on success', () => {
    const response = new HttpResponse(null);
    response.onSuccess('Operation successful');
    expect(response.message).toBe('Operation successful');
  });

  it('should set the message for created response', () => {
    const response = new HttpResponse(null);
    response.onCreated();
    expect(response.message).toBe(EMensagem.SALVO_SUCESSO);
  });

  it('should set the message for updated response', () => {
    const response = new HttpResponse(null);
    response.onUpdate();
    expect(response.message).toBe(EMensagem.ATUALIZADO_SUCESSO);
  });

  it('should set the message for unactivated response', () => {
    const response = new HttpResponse(null);
    response.onUnactivated();
    expect(response.message).toBe(EMensagem.DESATIVADO_SUCESSO);
  });
});
