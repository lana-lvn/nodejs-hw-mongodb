function parseIsFavourite(value) {
  if (typeof value === 'undefined') {
    return undefined;
  }

  if (['true', 'false'].includes(value)) {
    return value;
  }
}

function parseType(type) {
  const isString = typeof type === 'string';
  if (!isString) return;
  const isContactType = (type) => ['work', 'home', 'personal'].includes(type);

  if (isContactType(type)) return type;
}

export function parseFilterParams(query) {
  const { type, isFavourite } = query;
  const parsedIsFavourite = parseIsFavourite(isFavourite);
  const parsedType = parseType(type);
  return {
    type: parsedType,
    isFavourite: parsedIsFavourite,
  };
}
