import {Quote} from '../../../models';
import assetSwapService from '../../../services/AssetSwapService';
import * as kChannelsService from '../../../services/KChannelsService';

// TODO
export async function approve_asset_swap(args, callback) {
  const {quoteId, chainId, channelId, message, signature} = args;

  if (!chainId || !channelId || !quoteId || !message || !signature) {
    callback(null, {
      msg: 'One or more of the args supplied is invalid'
    });
    return;
  }

  // 1. lookup reference number (validation stage)
  const quote = await Quote.getQuote(quoteId);
  if (!quote) {
    callback(null, {
      msg: `Error trying to find a quote for channel ID [${channelId}], quote ID [${quoteId}], chain ID [${chainId}]`
    });
    return;
  }

  const {input, output, amount, fee, channel_id} = quote;

  // 2. kchannels: compose transaction (assets required, quote reference)
  //    - call kchannels - Method: create_new_transaction()
  //                       returns -> transaction obj
  const transaction = await assetSwapService.composeTransaction(input, output, amount, fee, channel_id, quote);

  // TODO checks transaction still valid by:
  // 3. validate transaction                  -> how to validate this? Do we check the signatures match the payload?
  // 4. validate recipient                    -> how? Do we check the receipt has an open channel with the other zone?
  // 5. validate own channel state and nonce  -> Is this simply checking that we haven't incremented our own nonce in the meantime?
  // 6. sign transaction                      -> EIP-712 signature - add to the signature_list on the original transaction above .2 ?

  // 7. kchannels: Send tx to kchannels       -> Method: process_transaction()
  //  returns -> transaction and summary
  const transactionSummary = await kChannelsService.sendTransaction(transaction);

  // TODO are these processes full async or would we expect them to serially fulfilled?
  // 8. validate transaction is fully executed -> Is this simply assuming a non failed response from .7 above?
  // 9. validate transaction summary           -> confirm TransactionSummary is correct and populated with enough signatures?
  // 10. sign transaction summary              -> EIP-712 signature - add to the signature_list on the original transaction above .2 ?
  // 10. a.                                    -> I assume we also need to store this final pre-flight stage in our DB?

  // 11. kchannels: Send tx - Method: complete_transaction()
  //       returns -> store receipt transaction summary against quote

  // ASSET SWAP COMPLETE

  return {success: true, receipt: {}};
}

// asset swap L1
// subscribe to ws from internal asset swap service account
// store current balance as is comes down the ws

