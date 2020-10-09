import {TransactionValue} from "../types/kchannel";

export default new class AssetSwapAccountService {

    async canCurrentlyFulfillSwap(output: TransactionValue, amount: TransactionValue): Promise<Boolean> {

        // check kchannel service balance for coin balance

        return true;
    }

    async composeTransaction(input, output, amount, fee, channel_id, quote): Promise<Boolean> {



        return true;
    }

};
