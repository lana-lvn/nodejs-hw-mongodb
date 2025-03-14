function parseSortBy(value) {
  if (typeof value === 'undefined') {
    return '_id';
  }
  const keys = [
    '_id',
    'name',
    'phoneNumber',
    'email',
    'isFavourite',
    'contactType',
    'createdAt',
  ];

  if (!keys.includes(value)) {
    return '_id';
  }

  return value;
}

function parseSortOrder(value) {
  if (typeof value === 'undefined') {
    return 'asc';
  }
  if (!['asc', 'desc'].includes(value)) {
    return 'asc';
  }
  return value;
}

export function parseSortParams(query) {
  const { sortBy, sortOrder } = query;
  const parsedSortBy = parseSortBy(sortBy);
  const parsedSortOrder = parseSortOrder(sortOrder);

  return {
    sortBy: parsedSortBy,
    sortOrder: parsedSortOrder,
  };
}
