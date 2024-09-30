import { monetaryFormat } from './formatter.helper';

describe('monetaryFormat', () => {
  it('should format a number with two decimal places', () => {
    const result = monetaryFormat(1234.5678, 2);
    expect(result).toEqual('1234,57');
  });

  it('should format a number with no decimal places', () => {
    const result = monetaryFormat(1234.5678, 0);
    expect(result).toEqual('1235');
  });

  it('should format a number with one decimal place', () => {
    const result = monetaryFormat(1234.5678, 1);
    expect(result).toEqual('1234,6');
  });

  it('should format a negative number correctly', () => {
    const result = monetaryFormat(-1234.5678, 2);
    expect(result).toEqual('-1234,57');
  });

  it('should format zero correctly', () => {
    const result = monetaryFormat(0, 2);
    expect(result).toEqual('0,00');
  });

  it('should handle rounding correctly', () => {
    const result = monetaryFormat(1234.5555, 2);
    expect(result).toEqual('1234,56');
  });

  it('should format a large number correctly', () => {
    const result = monetaryFormat(123456789.1234, 2);
    expect(result).toEqual('123456789,12');
  });
});
