import { buildQuery, FilterConfig } from './query';

export const handleFilter = (filter: any) => {
  const filterConfig: FilterConfig = {
    search: {
      type: 'regex',
      fields: ['name', 'sku'],
    },
    active: {
      type: 'exact',
    },
    sort: {
      type: 'sort',
    },
    quantity: {
      type: 'match',
    },
    category: {
      type: 'exact',
    },
    supplier: {
      type: 'exact',
    },
  };

  const query = buildQuery(JSON.parse(filter), filterConfig);

  const { sort, ...rest } = query;

  const baseQuery = { isDeleted: false, ...rest };

  return {
    baseQuery,
    sort,
  };
};