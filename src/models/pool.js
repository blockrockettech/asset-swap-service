import { Pool } from 'pg';
import { postgresEndpoint } from '../settings';

export const pool = new Pool({ connectionString: postgresEndpoint });
