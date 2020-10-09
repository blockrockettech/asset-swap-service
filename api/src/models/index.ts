import {client} from './Client';
import QuoteModel from './Quote';

export const Quote = new QuoteModel(client);
