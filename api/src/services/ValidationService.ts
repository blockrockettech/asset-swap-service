import {ethers, utils} from 'ethers';
import {TransactionValue} from "../types/kchannel";

const XDAI = utils.getAddress('0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d');
const XMOON = utils.getAddress('0xC5C35D01B20f8d5cb65C60f02113EF6cd8e79910');
const DAI = utils.getAddress('0x6b175474e89094c44da98b954eedeac495271d0f');

export default new class ValidationService {

    async validatePair(input: TransactionValue, output: TransactionValue): Promise<Boolean> {

        // check pair is valid .. ?

        return true;
    }
};
