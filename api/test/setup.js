import _sinon from 'sinon';
import supertest from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import app from '../src';

chai.use(sinonChai);

export const { expect } = chai;
export const server = supertest.agent(app);
export const sinon = _sinon;

// URL exports
export const INFO_URL = '/';
export const BASE_URL = '/v1'
export const QUOTE_URL = BASE_URL + '/quote';
