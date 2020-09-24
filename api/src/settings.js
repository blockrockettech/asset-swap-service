import dotenv from 'dotenv';
dotenv.config();

// ----------------------------
// Expose settings as constants
// ----------------------------
export const postgresEndpoint = process.env.POSTGRES_ENDPOINT;
export const web3PrivateKey = process.env.WEB3_PRIVATE_KEY;
