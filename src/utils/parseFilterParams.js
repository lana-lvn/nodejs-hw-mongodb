function parseIsFavourite(value) {
  if (typeof value === 'undefined') {
    return undefined;
  }

  if (['true', 'false'].includes(value)) {
    return value;
  }
}

function parseContactType(contactType) {
  const isString = typeof contactType === 'string';
  if (!isString) return;
  const isContactType = (contactType) =>
    ['work', 'home', 'personal'].includes(contactType);

  if (isContactType(contactType)) return contactType;
}

export function parseFilterParams(query) {
  const { contactType, isFavourite } = query;
  const parsedIsFavourite = parseIsFavourite(isFavourite);
  const parsedContactType = parseContactType(contactType);
  return {
    contactType: parsedContactType,
    isFavourite: parsedIsFavourite,
  };
}
