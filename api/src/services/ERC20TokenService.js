import {ethers} from 'ethers';
import {getWallet} from '../web3/provider';
import IERC20 from "../truffleconfig/IERC20.json";

export default class ERC20TokenService {
    constructor(chainId, tokenAddress) {
        this.wallet = getWallet(chainId);
        this.contract = new ethers.Contract(
            tokenAddress,
            IERC20.abi,
            this.wallet
        );
    }

    async getBalance(address) {
        return this.contract.balanceOf(address);
    }

    async getAllowance(owner, spender) {
        return this.contract.allowance(owner, spender);
    }
}
