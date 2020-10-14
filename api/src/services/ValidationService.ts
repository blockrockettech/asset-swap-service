import {TransactionValue} from "../types/kchannel";
import _ from 'lodash';
import {utils} from "ethers";

// TODO move these to a central place ... ?
const XDAI = utils.getAddress('0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d');
const DAI = utils.getAddress('0x6b175474e89094c44da98b954eedeac495271d0f');
const XMOON = utils.getAddress('0xC5C35D01B20f8d5cb65C60f02113EF6cd8e79910');

export default new class ValidationService {

    async validatePair(input: TransactionValue, output: TransactionValue): Promise<Boolean> {

        // Cannot go between the same asset
        if (input.smart_contract === output.smart_contract) {
            console.log(`Failed validation as input and output are the same`);
            return false;
        }

        // Only xDAI and DAI atm
        const allowedContracts = [XDAI, DAI];

        // Check both ins and out are from this pair
        return _.includes(allowedContracts, utils.getAddress(input.smart_contract))
            && _.includes(allowedContracts, utils.getAddress(output.smart_contract));
    }
};
