export interface FilterConfig {
  [key: string]: {
    type: 'regex' | 'exact' | 'sort' | 'multiple' | 'match';
    fields?: string[];
    sortField?: string;
  };
}

export const buildQuery = (filter: any, config: FilterConfig) => {
  const query: any = {};

  Object.keys(filter).forEach((key) => {
    if (filter[key] === undefined || filter[key] === null || !config[key])
      return;

    switch (config[key].type) {
      case 'regex':
        if (filter[key]) {
          if (config[key].fields) {
            const regexConditions = config[key].fields.map((field) => ({
              [field]: { $regex: new RegExp(filter[key], 'i') },
            }));
            query.$or = regexConditions;
          }
        } else {
          query.$or = [];
        }
        break;

      case 'exact':
        if (filter[key] === '') {
          query[key] = { $exists: true };
        } else {
          query[key] = filter[key];
        }
        break;

      case 'sort':
        const sort = filter[key].split('_');
        query.sort = {
          [sort[0]]: sort[1] === 'desc' ? -1 : 1,
        };
        break;

      case 'multiple':
        query[key] = filter[key];
        break;

      case 'match':
        const match = filter[key].split('_');
        const [field, operator, value] = match;

        console.log(field, operator, value);

        // Xử lý các toán tử so sánh
        const compareOperators: { [key: string]: string } = {
          eq: '$eq',
          gt: '$gt',
          gte: '$gte',
          lt: '$lt',
          lte: '$lte',
          ne: '$ne',
        };

        if (operator && value && compareOperators[operator]) {
          query[field] = {
            [compareOperators[operator]]: Number(value),
          };
        }
        break;
    }
  });

  return query;
};
