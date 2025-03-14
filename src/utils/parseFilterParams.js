function parseIsFavourite(value) {
  if (typeof value === 'undefined') {
    return undefined;
  }
  if (['true', 'false'].includes(value)) {
    return value;
  }
}
export function parseFilterParams(query) {
  const { isFavourite } = query;
  const parsedIsFavourite = parseIsFavourite(isFavourite);
  return {
    isFavourite: parsedIsFavourite,
  };
}
