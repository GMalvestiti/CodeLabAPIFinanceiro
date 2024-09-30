import { ILike } from 'typeorm';
import { IFindAllFilter } from '../interfaces/find-all-filter.interface';
import { handleFilter } from './sql.helper';

describe('handleFilter', () => {
  it('should return an empty object if no filter is provided', () => {
    const result = handleFilter(null);
    expect(result).toEqual({});
  });

  it('should handle a single filter with boolean string value', () => {
    const filter: IFindAllFilter = { column: 'isActive', value: 'true' };
    const result = handleFilter(filter);
    expect(result).toEqual({ isActive: true });
  });

  it('should handle a single filter with numeric string value', () => {
    const filter: IFindAllFilter = { column: 'age', value: '25' };
    const result = handleFilter(filter);
    expect(result).toEqual({ age: 25 });
  });

  it('should handle a single filter with non-numeric string value', () => {
    const filter: IFindAllFilter = { column: 'name', value: 'John' };
    const result = handleFilter(filter);
    expect(result).toEqual({ name: ILike('%John%') });
  });

  it('should handle multiple filters', () => {
    const filters: IFindAllFilter[] = [
      { column: 'isActive', value: 'true' },
      { column: 'age', value: '30' },
      { column: 'name', value: 'Doe' },
    ];
    const result = handleFilter(filters);
    expect(result).toEqual({
      isActive: true,
      age: 30,
      name: ILike('%Doe%'),
    });
  });

  it('should handle multiple filters with mixed types', () => {
    const filters: IFindAllFilter[] = [
      { column: 'id', value: '42' },
      { column: 'nome', value: 'New York' },
    ];
    const result = handleFilter(filters);
    expect(result).toEqual({
      id: 42,
      nome: ILike('%New York%'),
    });
  });
});
