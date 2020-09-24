import Web3 from 'web3';
import { getNetworkName } from '@blockrocket/utils';
import { ethers } from 'ethers';
import { web3PrivateKey } from "../settings";

const httpProviderWeb3 = {};
const walletForNetwork = {};

function createWallet(chainId) {
    let provider = new ethers.providers.Web3Provider(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

    if (chainId !== 5777) {
        provider = ethers.getDefaultProvider(getNetworkName(chainId));
    }

    return new ethers.Wallet(web3PrivateKey, provider);
}

export function getHttpProvider(chainId) {
    if (httpProviderWeb3[chainId]) {
        return httpProviderWeb3[chainId];
    }

    const wallet = createWallet(chainId);
    httpProviderWeb3[chainId] = wallet.provider;
    walletForNetwork[chainId] = wallet;
    return httpProviderWeb3[chainId];
}

export function getWallet(chainId) {
    if (walletForNetwork[chainId]) {
        return walletForNetwork[chainId];
    }

    const wallet = createWallet(chainId);
    httpProviderWeb3[chainId] = wallet.provider;
    walletForNetwork[chainId] = wallet;
    return walletForNetwork[chainId];
}
