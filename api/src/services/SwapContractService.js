import {ethers} from 'ethers';
import {getWallet} from '../web3/provider';
import {getContractAddressFromTruffleConf} from '../utils';

import SwapContract from '../truffleconfig/Swap.json';

export function swapContractAddress(chainId) {
    return getContractAddressFromTruffleConf(SwapContract, chainId);
}

export class SwapContractService {
    constructor(chainId) {
        this.wallet = getWallet(chainId);
        this.contract = new ethers.Contract(
            swapContractAddress(chainId),
            SwapContract.abi,
            this.wallet
        );
    }

    isValidInputOrOutputToken(tokenAddress) {
        return this.contract.isValidInputOrOutputToken(tokenAddress);
    }
}
