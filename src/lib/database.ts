import dotenv from 'dotenv';

dotenv.config();

import { Pool } from 'pg';

export const client = new Pool();
