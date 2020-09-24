import {v4 as uuidv4} from 'uuid';
import {SwapContractService, swapContractAddress} from "./SwapContractService";
import ERC20TokenService from "./ERC20TokenService";
import FeeService from "./FeeService";
import {ethers} from "ethers";

export default new class kChannelService {

    async getQuote(chainId, channelId, input, output, amount) {
        // check that the input and output tokens are valid swaps
        const isInputTokenValid = await this.isTokenValid(chainId, input);
        if (!isInputTokenValid) {
            const msg = 'Input is not a valid token';
            console.error(msg);
            return {
                success: false,
                error: {
                    msg
                }
            }
        }

        const isOutputTokenValid = await this.isTokenValid(chainId, output);
        if (!isOutputTokenValid) {
            const msg = 'Output is not a valid token';
            console.error(msg);
            return {
                success: false,
                error: {
                    msg
                }
            }
        }

        // check the user owns the amount they want to swap and has approved the service
        const amountBN = ethers.BigNumber.from(amount);
        const {balance, allowance} = await this.getUserBalanceAndApprovalAmounts(
            chainId,
            input,
            channelId,
            swapContractAddress(chainId)
        );

        if (balance.lt(amountBN)) {
            const msg = `The user's balance is less than the amount they wish to swap`;
            console.error(msg);
            return {
                success: false,
                error: {
                    msg
                }
            }
        }

        if (allowance.lt(amountBN)) {
            const msg = `The allowance from the user is less than the amount they wish to swap`;
            console.error(msg);
            return {
                success: false,
                error: {
                    msg
                }
            }
        }

        // check there is enough liquidity
        const outputLiquidity = await this.getLiquidityOfOutputToken(chainId, output, swapContractAddress(chainId));
        if (outputLiquidity.lt(amountBN)) {
            const msg = `There is not enough output liquidity based on a swap amount`;
            console.error(msg);
            return {
                success: false,
                error: {
                    msg
                }
            }
        }

        const fee = FeeService.getDAISwapFee(amount); // TODO: this is not a real calculation - to be replaced

        // output based on a 1:1 exchange rate.
        // TODO: assumption is that there is no slippage
        const outputAfterFee = parseFloat(amount) - fee;

        return {
            id: uuidv4(),
            fee,
            outputAfterFee,
            success: true,
        };
    }

    async isTokenValid(chainId, tokenAddress) {
        try {
            ethers.utils.getAddress(tokenAddress);
        } catch (e) {
            console.error(`Supplied token address [${tokenAddress}] failed checksum validation`);
            return false;
        }

        const swapContract = new SwapContractService(chainId);
        return swapContract.isValidInputOrOutputToken(tokenAddress);
    }

    async getUserBalanceAndApprovalAmounts(chainId, tokenAddress, userAddress, swapAddress) {
        const token = new ERC20TokenService(chainId, tokenAddress);
        return {
            balance: await token.getBalance(userAddress),
            allowance: await token.getAllowance(userAddress, swapAddress)
        };
    }

    async getLiquidityOfOutputToken(chainId, tokenAddress, swapAddress) {
        const token = new ERC20TokenService(chainId, tokenAddress);
        return token.getBalance(swapAddress);
    }
}
