import request from 'supertest';
import 'jest-extended';
import app from '../src/app';
import { client } from '../src/lib/database';
import { Employee, createOrUpdate, getEmployeeByEmail } from '../src/models/employee.model';

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

      const result = await client.query(`SELECT * FROM employees`);
      const expectedInDb = [
        {
          email: 'candacefoster@quarx.com',
          google_user_id: null,
          name: 'Candace Foster',
          secondary_emails: [],
          slack_user_id: 'slackId1',
        },
        {
          email: 'latonyamorrow@quarx.com',
          google_user_id: null,
          name: 'Latonya Morrow',
          secondary_emails: [],
          slack_user_id: 'slackId2',
        },
      ];
      expect(result.rows.map(({ id, ...employee }) => employee)).toEqual(expectedInDb);
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

    it('Happy path, but with data update', async () => {
      await request(app).post('/api/import').set('Content-Type', 'application/json').send({
        url: 'https://fake-directory-provider.onrender.com/tests/slack/0',
      });

      const res = await request(app).post('/api/import').set('Content-Type', 'application/json').send({
        url: 'https://fake-directory-provider.onrender.com/tests/google/1',
      });
      expect(res.status).toBe(201);

      const result = await client.query(`SELECT * FROM employees`);
      const expectedInDb = [
        {
          name: 'Candace Foster',
          email: 'candacefoster@quarx.com',
          secondary_emails: [],
          google_user_id: null,
          slack_user_id: 'slackId1',
        },
        {
          name: 'Latonya Morrow',
          email: 'latonyamorrow@quarx.com',
          secondary_emails: [],
          google_user_id: null,
          slack_user_id: 'slackId2',
        },
        {
          name: 'Beno Foster',
          email: 'beno@quarx.com',
          secondary_emails: [],
          google_user_id: 'googleId1',
          slack_user_id: null,
        },
        {
          name: 'Latonya Morrow',
          email: 'latonya@free.fr',
          secondary_emails: ['latonyamorrow@quarx.com'],
          google_user_id: 'googleId2',
          slack_user_id: null,
        },
        {
          name: 'Annie Flowers',
          email: 'annieflowers@quarx.com',
          secondary_emails: [],
          google_user_id: 'googleId3',
          slack_user_id: null,
        },
      ];
      await expect(result.rows.map(({ id, ...employee }) => employee)).toEqual(expect.arrayContaining(expectedInDb));
    });
  });

  describe('GET /api/employees', () => {
    beforeEach(async () => {
      await client.query(`TRUNCATE employees CASCADE;`);
    });

    it('Happy path, return 200', async () => {
      await createOrUpdate({
        name: 'Ursula Le Guin',
        email: 'ursula@notanemail.com',
        secondary_emails: ['ursula2@notanemail.com'],
        google_user_id: 'g_id',
        slack_user_id: 's_id',
      });

      const res = await request(app).get('/api/employees').send();

      const result: Employee[] = res.body

      expect(res.status).toBe(200);
      expect(result.map(({ id, ...employee }) => employee)).toEqual([
        {
          googleuserid: 'g_id',
          name: 'Ursula Le Guin',
          primaryemailaddress: 'ursula@notanemail.com',
          secondaryemailaddresses: ['ursula2@notanemail.com'],
          slackuserid: 's_id',
        },
      ]);
    });

    it('No employees return 200', async () => {
      const res = await request(app).get('/api/employees').send();

      const result: Employee[] = res.body

      expect(res.status).toBe(200);
      expect(result).toEqual([]);
    });

    it('Several results, return 200', async () => {
      await createOrUpdate({
        name: 'Ursula Le Guin',
        email: 'ursula@notanemail.com',
        secondary_emails: ['ursula2@notanemail.com'],
        google_user_id: 'g_id',
        slack_user_id: 's_id',
      });
      await createOrUpdate({
        name: 'Ursula Le Guin',
        email: 'ursula2@notanemail.com',
        secondary_emails: ['ursula@notanemail.com'],
        google_user_id: 'g_id',
        slack_user_id: 's_id',
      });

      const res = await request(app).get('/api/employees').send();

      const result: Employee[] = res.body

      expect(res.status).toBe(200);
      expect(result.map(({ id, ...employee }) => employee)).toEqual([
        {
          googleuserid: 'g_id',
          name: 'Ursula Le Guin',
          primaryemailaddress: 'ursula@notanemail.com',
          secondaryemailaddresses: ['ursula2@notanemail.com'],
          slackuserid: 's_id',
        },
        {
          googleuserid: 'g_id',
          name: 'Ursula Le Guin',
          primaryemailaddress: 'ursula2@notanemail.com',
          secondaryemailaddresses: ['ursula@notanemail.com'],
          slackuserid: 's_id',
        },
      ]);
    });

    it('partial data, return 200', async () => {
      await createOrUpdate({
        name: 'Ursula Le Guin',
        email: 'ursula@notanemail.com',
      });

      const res = await request(app).get('/api/employees').send();

      const result: Employee[] = res.body

      expect(res.status).toBe(200);
      expect(result.map(({ id, ...employee }) => employee)).toEqual([
        {
          googleuserid: null,
          name: 'Ursula Le Guin',
          primaryemailaddress: 'ursula@notanemail.com',
          secondaryemailaddresses: [],
          slackuserid: null,
        },
      ]);
    });
  });

  afterAll(async () => {
    await client.end();
  });
});
