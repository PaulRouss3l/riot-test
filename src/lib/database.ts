import dotenv from 'dotenv';

dotenv.config();

import { Pool } from 'pg';

export const client = new Pool();

class NotFound extends Error {}

export const notFoundExn = <T>(maybeT: T | null) => {
  if (maybeT === null) throw new NotFound();
  return maybeT;
};
