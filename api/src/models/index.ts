import {client} from './Client';
import QuoteModel from './Quote';
import AssetSwapChannelStateModel from './AssetSwapChannelState';

export const Quote = new QuoteModel(client);
export const AssetSwapChannelState = new AssetSwapChannelStateModel(client);
