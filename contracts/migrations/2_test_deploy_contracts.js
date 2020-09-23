const {getAccountAddress} = require('@blockrocket/utils');
const getMnemonic = require('./utils/getMnemonic');

const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const Swap = artifacts.require('Swap');
const MockERC20 = artifacts.require('MockERC20');

module.exports = async function (deployer, network, accounts) {
    console.log('Deploying core contracts to network: ' + network);

    const MNEMONIC = getMnemonic(network);

    const admin = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);

    console.log('Deploy swap')
    await deployer.deploy(
        Swap,
        {from: admin}
    );

    const swap = await Swap.deployed();

    console.log('Approve Swap to spend DAI')
    const dai = await MockERC20.at(await swap.tokenA());
    await dai.approve(Swap.address, '250000000000000000000000', {from: admin}); // 250k tokens

    console.log('Approve Swap to spend xDAI')
    const xDai = await MockERC20.at(await swap.tokenB());
    await xDai.approve(Swap.address, '250000000000000000000000', {from: admin}); // 250k tokens
};
