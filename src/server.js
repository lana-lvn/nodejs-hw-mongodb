import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { getEnvVar } from './utils/getEnvVar.js';
import { getAllContacts, getContactById } from './services/contacts.js';

const PORT = Number(getEnvVar('PORT', '3000'));

export function setupServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();
    res.status(200).send({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  });
  app.get('/contacts/:contactId', async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    if (!contact) {
      res.status(404).send({ message: 'Contact not found' });
      return;
    }
    res
      .status(200)
      .send({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
      });
  });
  app.use('*', (req, res, next) => {
    res.status(404).send({
      message: 'Not found',
    });
  });
  app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });
}
