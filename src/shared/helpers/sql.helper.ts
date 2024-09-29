import { ILike } from 'typeorm';
import { IFindAllFilter } from '../interfaces/find-all-filter.interface';

export const handleFilter = (filter: IFindAllFilter | IFindAllFilter[]) => {
  if (!filter) {
    return {};
  }

  const filters = Array.isArray(filter) ? filter : [filter];

  const whereClause = {};

  for (const f of filters) {
    if (f.value === 'true' || f.value === 'false') {
      Object.assign(whereClause, { [f.column]: Boolean(f.value) });
      continue;
    }

    if (isNaN(Number(f.value))) {
      Object.assign(whereClause, { [f.column]: ILike(`%${f.value}%`) });
      continue;
    }

    Object.assign(whereClause, { [f.column]: Number(f.value) });
  }

  return whereClause;
};
