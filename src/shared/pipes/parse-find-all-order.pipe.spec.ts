import { EMensagem } from '../enums/mensagem.enum';
import { ParseFindAllOrderPipe } from './parse-find-all-order.pipe';

describe('ParseFindAllOrderPipe', () => {
  let pipe: ParseFindAllOrderPipe;

  beforeEach(() => {
    pipe = new ParseFindAllOrderPipe();
  });

  it('should transform a valid JSON string to an IFindAllOrder object', () => {
    const validJsonString = '{"field": "name", "order": "asc"}';
    const result = pipe.transform(validJsonString, {
      type: 'body',
      metatype: null,
    });

    expect(result).toEqual({ field: 'name', order: 'asc' });
  });

  it('should throw an error for an invalid JSON string', () => {
    const invalidJsonString = '{"field": "name", "order": "asc"';

    expect(() => {
      pipe.transform(invalidJsonString, { type: 'body', metatype: null });
    }).toThrowError(new Error(EMensagem.ORDER_INVALIDO));
  });

  it('should throw an error for an empty string', () => {
    const emptyString = '';

    expect(() => {
      pipe.transform(emptyString, { type: 'body', metatype: null });
    }).toThrowError(new Error(EMensagem.ORDER_INVALIDO));
  });
});
