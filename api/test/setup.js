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
export function base_url(chainId) {
    return `/v1/network/${chainId}`;
}

export function quote_url(chainId) {
    return `${base_url(chainId)}/quote`
}
