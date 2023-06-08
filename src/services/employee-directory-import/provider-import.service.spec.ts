import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { client } from '../../lib/database';
import { InvalidProviderData, ProviderImportService } from './provider-import.service';

const dataProvider = {
  Simple: {
    name: 'Simple',
    payload: {
      url: 'https://notarealprovider.com/tests/google/0',
    },
    providerReturn: {
      provider: 'Google',
      employees: [
        {
          id: 'googleId5',
          name: 'Alex Bozer',
          emails: [
            {
              address: 'bozer@quarx.com',
              isPrimary: true,
            },
          ],
        },
        {
          id: 'googleId3',
          name: 'Annie Flowers',
          emails: [
            {
              address: 'annieflowers@quarx.com',
              isPrimary: true,
            },
          ],
        },
      ],
    },
    expected: [
      {
        email: 'bozer@quarx.com',
        google_user_id: 'googleId5',
        name: 'Alex Bozer',
        secondary_emails: [],
        slack_user_id: null,
      },
      {
        email: 'annieflowers@quarx.com',
        google_user_id: 'googleId3',
        name: 'Annie Flowers',
        secondary_emails: [],
        slack_user_id: null,
      },
    ],
    exception: false,
  },
  NoPrimaryEmail: {
    name: 'NoPrimaryEmail',
    payload: {
      url: 'https://notarealprovider.com/tests/google/0',
    },
    providerReturn: {
      provider: 'Google',
      employees: [
        {
          id: 'googleId5',
          name: 'Alex Bozer',
          emails: [
            {
              address: 'bozer@quarx.com',
              isPrimary: false,
            },
          ],
        },
      ],
    },
    expected: null,
    exception: true,
  },
  WrongEmailFormat: {
    name: 'WrongEmailFormat',
    payload: {
      url: 'https://notarealprovider.com/tests/google/0',
    },
    providerReturn: {
      provider: 'Google',
      employees: [
        {
          id: 'googleId5',
          name: 'Alex Bozer',
          emails: [
            {
              address: 'bozerquarx.com',
              isPrimary: true,
            },
          ],
        },
      ],
    },
    expected: null,
    exception: true,
  },
  SeveralEmails: {
    name: 'SeveralEmails',
    payload: {
      url: 'https://notarealprovider.com/tests/google/0',
    },
    providerReturn: {
      provider: 'Google',
      employees: [
        {
          id: 'googleId5',
          name: 'Alex Bozer',
          emails: [
            {
              address: 'bozer@quarx.com',
              isPrimary: false,
            },
            {
              address: 'bozer1337@quarx.com',
              isPrimary: true,
            },
            {
              address: 'bozer2@quarx.com',
              isPrimary: false,
            },
          ],
        },
      ],
    },
    expected: [
      {
        email: 'bozer1337@quarx.com',
        google_user_id: 'googleId5',
        name: 'Alex Bozer',
        secondary_emails: ['bozer@quarx.com', 'bozer2@quarx.com'],
        slack_user_id: null,
      },
    ],
    exception: false,
  },
  SingleEmail: {
    name: 'SingleEmail',
    payload: {
      url: 'https://notarealprovider.com/tests/google/0',
    },
    providerReturn: {
      provider: 'Google',
      employees: [
        {
          id: 'googleId5',
          name: 'Alex Bozer',
          email: 'bozer1337@quarx.com',
        },
      ],
    },
    expected: [
      {
        email: 'bozer1337@quarx.com',
        google_user_id: 'googleId5',
        name: 'Alex Bozer',
        secondary_emails: [],
        slack_user_id: null,
      },
    ],
    exception: false,
  },
};

const chainedDataProvider = {
  BothProviderId: {
    name: 'BothProviderId',
    payload: [
      { url: 'https://notarealprovider.com/tests/google/0' },
      { url: 'https://notarealprovider.com/tests/slack/0' },
    ],
    providerReturn: [
      {
        provider: 'Google',
        employees: [
          {
            id: 'googleId5',
            name: 'Ursula Le Guin',
            email: 'ursula@quarx.com',
          },
        ],
      },
      {
        provider: 'Slack',
        employees: [
          {
            id: 'slackId17',
            name: 'Ursula Le Guin',
            email: 'ursula@quarx.com',
          },
        ],
      },
    ],
    expected: [
      {
        email: 'ursula@quarx.com',
        google_user_id: 'googleId5',
        name: 'Ursula Le Guin',
        secondary_emails: [],
        slack_user_id: 'slackId17',
      },
    ],
    exception: false,
  },
};

describe('ProviderImportService', () => {
  beforeEach(async () => {
    await client.query(`TRUNCATE employees CASCADE;`);
  });

  // tests with only 1 call
  Object.values(dataProvider).forEach((data) => {
    it(data.name, async () => {
      const mock = new MockAdapter(axios);
      mock.onGet(data.payload.url).reply(200, data.providerReturn);

      let exception = false;
      try {
        const service = new ProviderImportService();
        await service.importEmployees(data.payload);
      } catch (e) {
        exception = true;
      }

      if (data.expected) {
        const result = await client.query(`SELECT * FROM employees`);
        expect(result.rows.map(({ id, ...employee }) => employee)).toEqual(data.expected);
      }
      expect(exception).toBe(data.exception);
    });
  });

  // tests with several calls
  Object.values(chainedDataProvider).map((data) => {
    it(data.name, async () => {
      const mock = new MockAdapter(axios);
      let exception = false;

      // we need to avoid the .map because we need our call to be sequential
      for (const k in data.payload) {
        mock.onGet(data.payload[k].url).reply(200, data.providerReturn[k]);

        try {
          const service = new ProviderImportService();
          await service.importEmployees(data.payload[k]);
        } catch (e) {
          exception = true;
        }
      }
      if (data.expected) {
        const result = await client.query(`SELECT * FROM employees`);
        expect(result.rows.map(({ id, ...employee }) => employee)).toEqual(data.expected);
      }
      expect(exception).toBe(data.exception);
    });
  });

  afterAll(async () => {
    await client.end();
  });
});
