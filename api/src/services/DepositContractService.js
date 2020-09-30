import {ethers} from 'ethers';
import {getWallet} from '../web3/provider';
import DepositContract from '../truffleconfig/Deposit.json';

export default class DepositContractService {
    constructor(chainId, address) {
        this.wallet = getWallet(chainId);
        this.contract = new ethers.Contract(
            address,
            DepositContract.abi,
            this.wallet
        );
    }

    balanceOf(userAddress) {
        return this.contract.balanceOf(userAddress);
    }
}
