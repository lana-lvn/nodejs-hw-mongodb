import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
}) => {
  const skip = page > 0 ? (page - 1) * perPage : 0;

  const contactQuery = ContactsCollection.find();
  if (typeof filter.isFavourite !== 'undefined') {
    contactQuery.where('isFavourite').in(filter.isFavourite);
  }

  if (filter.type) {
    contactQuery.where('contactType').equals(filter.type);
  }

  const [total, data] = await Promise.all([
    ContactsCollection.countDocuments(contactQuery),
    contactQuery
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(perPage),
  ]);
  const totalPages = Math.ceil(total / perPage);

  return {
    data,
    total,
    page,
    perPage,
    totalPages,
    hasNextPage: totalPages - page > 0,
    hasPreviousPage: page > 1,
  };
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const patchContact = async (contactId, payload, options = {}) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

export const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
  });

  return contact;
};
