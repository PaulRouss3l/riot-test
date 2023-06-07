import request from 'supertest';
import 'jest-extended';
import app from '../src/app';
import { client } from '../src/lib/database';
import { getEmployeeByEmail } from '../src/models/employee.model';

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

    it('Happy path, create works, return 200', async () => {
      const res = await request(app).post('/api/employees').set('Content-Type', 'application/json').send({
        name: 'Marc Garneau',
        email: 'MarcGarneau@doestexist.com',
      });

      expect(res.status).toBe(201);
      const result = await getEmployeeByEmail('MarcGarneau@doestexist.com');
      expect(result).not.toBeNull();
    });

    it('duplicate, return 409', async () => {
      // create our first entry
      await request(app).post('/api/employees').set('Content-Type', 'application/json').send({
        name: 'Marc Garneau',
        email: 'MarcGarneau@doestexist.com',
      });
      const result = await getEmployeeByEmail('MarcGarneau@doestexist.com');
      expect(result).not.toBeNull();
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

  describe('POST /api/import', () => {
    beforeEach(async () => {
      await client.query(`TRUNCATE employees CASCADE;`);
    });

    it('Happy path, create works, return 200', async () => {
      const res = await request(app).post('/api/import').set('Content-Type', 'application/json').send({
        url: 'https://fake-directory-provider.onrender.com/tests/slack/0',
      });

      expect(res.status).toBe(201);
      const expected = {
        provider: 'Slack',
        employees: [
          {
            id: 'slackId1',
            name: 'Candace Foster',
            email: 'candacefoster@quarx.com',
          },
          {
            id: 'slackId2',
            name: 'Latonya Morrow',
            email: 'latonyamorrow@quarx.com',
          },
        ],
      };
      expect(res.body).toEqual(expected);
    });

    it('Invalid payload, return 400', async () => {
      const res = await request(app).post('/api/import').set('Content-Type', 'application/json').send({
        not: 'expected',
      });

      expect(res.status).toBe(400);
    });

    it('Invalid url, return 400', async () => {
      const res = await request(app).post('/api/import').set('Content-Type', 'application/json').send({
        url: 'Not an url',
      });

      expect(res.status).toBe(400);
    });

    it('valid url, but unresponsive return 400', async () => {
      const res = await request(app).post('/api/import').set('Content-Type', 'application/json').send({
        url: 'https://fake-subscriptions-api.fly.dev/tests/slack/1',
      });

      expect(res.status).toBe(400);
    });
  });

  afterAll(async () => {
    await client.end();
  });
});
