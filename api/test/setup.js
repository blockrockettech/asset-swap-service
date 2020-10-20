import _sinon from 'sinon';
import supertest from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import app from '../src';
import {ethers as _ethers} from 'ethers';

chai.use(sinonChai);

export const { expect } = chai;
export const server = supertest.agent(app);
export const sinon = _sinon;
export const ethers = _ethers;

// URL exports
export const QUOTE_URL = '/quote';
