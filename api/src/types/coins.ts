import {utils} from "ethers";

export const XDAI = {
    chain_id: '100',
    smart_contract: utils.getAddress('0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d')
};

export const DAI = {
    chain_id: '1',
    smart_contract: utils.getAddress('0x6b175474e89094c44da98b954eedeac495271d0f')
};

export const ACCEPTED_COINS = [DAI, XDAI];
