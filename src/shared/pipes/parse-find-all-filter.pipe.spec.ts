import { EMensagem } from '../enums/mensagem.enum';
import { ParseFindAllFilterPipe } from './parse-find-all-filter.pipe';

describe('ParseFindAllFilterPipe', () => {
  let pipe: ParseFindAllFilterPipe;

  beforeEach(() => {
    pipe = new ParseFindAllFilterPipe();
  });

  it('should transform a valid JSON string to an object', () => {
    const validJsonString = '{"key": "value"}';
    const result = pipe.transform(validJsonString, {
      type: 'body',
      metatype: null,
    });

    expect(result).toEqual({ key: 'value' });
  });

  it('should transform a valid JSON string to an array of objects', () => {
    const validJsonString = '[{"key1": "value1"}, {"key2": "value2"}]';
    const result = pipe.transform(validJsonString, {
      type: 'body',
      metatype: null,
    });

    expect(result).toEqual([{ key1: 'value1' }, { key2: 'value2' }]);
  });

  it('should throw an error for an invalid JSON string', () => {
    const invalidJsonString = '{"key": "value"';

    expect(() => {
      pipe.transform(invalidJsonString, { type: 'body', metatype: null });
    }).toThrowError(new Error(EMensagem.FILTER_INVALIDO));
  });

  it('should return undefined for null or undefined input', () => {
    expect(
      pipe.transform(null, { type: 'body', metatype: null }),
    ).toBeUndefined();
    expect(
      pipe.transform(undefined, { type: 'body', metatype: null }),
    ).toBeUndefined();
  });
});
