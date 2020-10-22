import Web3 from "web3";
import {Account} from "web3-core";
import {CHAIN_RPC} from "./KChannelsService";

const sigUtil = require('eth-sig-util');

interface SignerConfig {
    web3Signer: Account
    web3: Web3
}

export default function getWeb3Signer(): SignerConfig {
    const rpcPath = CHAIN_RPC[process.env.DEFAULT_CHAIN_ID];
    if (!rpcPath) {
        throw new Error(`Invalid setup params, invalid configure of chain ID [${process.env.DEFAULT_CHAIN_ID}]`);
    }
    console.log(`Connecting to RPC endpoint`, rpcPath);

    const web3 = new Web3(new Web3.providers.HttpProvider(rpcPath));
    const web3Signer = web3.eth.accounts.privateKeyToAccount(process.env.ASSET_SWAP_MASTER_ACCOUNT_PRIVATE_KEY);
    web3.eth.accounts.wallet.add(web3Signer);
    web3.eth.defaultAccount = web3Signer.address;
    return {
        web3Signer,
        web3
    };
}

export function signTypedData_v4(account: Account, authTypedParams) {
    return sigUtil.signTypedData_v4(
        Buffer.from(account.privateKey.substr(2), 'hex'),
        {data: authTypedParams}
    );
}
