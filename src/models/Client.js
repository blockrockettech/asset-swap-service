import { Pool } from 'pg';
import { postgresEndpoint } from '../settings';

export const client = new Pool({ connectionString: postgresEndpoint });
