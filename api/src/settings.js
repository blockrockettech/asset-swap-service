import dotenv from 'dotenv';
dotenv.config();

// ----------------------------
// Expose settings as constants
// ----------------------------
export const postgresEndpoint = process.env.POSTGRES_ENDPOINT;
