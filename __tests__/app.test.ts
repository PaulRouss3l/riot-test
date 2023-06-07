import request from 'supertest';
import 'jest-extended';
import app from '../src/app';
import { client } from '../src/lib/database';

describe('App Test', () => {
  describe('GET /random-url', () => {
    it('returns 404', async () => {
      const res = await request(app).get('/random-url');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/employees', () => {
    beforeEach(async () => {
      await client.query(`TRUNCATE employees CASCADE;`);
    });

    afterAll(async () => {
      await client.end();
    });

    it('Happy path, create works, return 200', async () => {
      const res = await request(app).post('/api/employees').set('Content-Type', 'application/json').send({
        name: 'Marc Garneau',
        email: 'MarcGarneau@doestexist.com',
      });

      expect(res.status).toBe(201);
    });

    it('duplicate, return 409', async () => {
      // create our first entry
      await request(app).post('/api/employees').set('Content-Type', 'application/json').send({
        name: 'Marc Garneau',
        email: 'MarcGarneau@doestexist.com',
      });
      // second entry with same email
      const res = await request(app).post('/api/employees').set('Content-Type', 'application/json').send({
        name: 'Garneau Marc',
        email: 'MarcGarneau@doestexist.com',
      });

      expect(res.status).toBe(409);
    });

    it('Wrong payload, 400', async () => {
      const res = await request(app).post('/api/employees').set('Content-Type', 'application/json').send({
        something: 'I dont want',
        email: 'MarcGarneau@doestexist.com',
      });

      expect(res.status).toBe(400);
    });

    it('Incomplete payload, 400', async () => {
      const res = await request(app).post('/api/employees').set('Content-Type', 'application/json').send({
        name: 'Garneau Marc',
      });

      expect(res.status).toBe(400);
    });

    it('should return a 400 if the email address is not in the correct format', async () => {
      const res = await request(app).post('/api/employees').set('Content-Type', 'application/json').send({
        name: 'Garneau Marc',
        email: 'not an email',
      });

      expect(res.status).toBe(400);
    });
  });
});
