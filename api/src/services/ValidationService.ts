import {TransactionValue} from "../types/kchannel";
import _ from 'lodash';
import {utils} from "ethers";
import {ACCEPTED_COINS} from "../types/coins";

export default new class ValidationService {

    async validatePair(input: TransactionValue, output: TransactionValue): Promise<Boolean> {

        // Check both defined
        if (!input || !output) {
            console.log(`Failed validation - invalid address for inbound/outbound contract`);
            return false;
        }

        // Validate they look like addresses
        if (!utils.isAddress(input.smart_contract) || !utils.isAddress(output.smart_contract)) {
            console.log(`Failed validation - invalid address for inbound/outbound contract`);
            return false;
        }

        // Validate chains
        if (!input.chain_id || !output.chain_id) {
            console.log(`Failed validation - missing chain_id inbound/outbound contract`);
            return false;
        }

        const inboundContract = utils.getAddress(input.smart_contract);
        const outboundContract = utils.getAddress(output.smart_contract);

        // Cannot go between the same asset
        if (inboundContract === outboundContract) {
            console.log(`Failed validation - input and output are the same`);
            return false;
        }

        // Some basic pair matching logic
        const isValidInbound = _.filter(ACCEPTED_COINS, {
            chain_id: input.chain_id,
            smart_contract: inboundContract
        });

        const isValidOutbound = _.filter(ACCEPTED_COINS, {
            chain_id: output.chain_id,
            smart_contract: outboundContract
        });

        // Check both ins and out are from this pair
        return isValidInbound.length === 1 && isValidOutbound.length === 1;
    }
};
