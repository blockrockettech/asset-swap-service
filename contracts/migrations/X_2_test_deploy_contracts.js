const {getAccountAddress} = require('@blockrocket/utils');
const getMnemonic = require('./utils/getMnemonic');

const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const Swap = artifacts.require('Swap');
const MockERC20 = artifacts.require('MockERC20');

module.exports = async function (deployer, network, accounts) {
    console.log('Deploying core contracts to network: ' + network);

    const MNEMONIC = getMnemonic(network);

    const admin = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);
    const account3 = getAccountAddress(accounts, 2, network, MNEMONIC, INFURA_KEY);

    console.log('Deploy swap')
    await deployer.deploy(
        Swap,
        {from: admin}
    );

    const swap = await Swap.deployed();

    console.log('Approve Swap to spend DAI')
    const tokenAAddress = await swap.tokenA();
    console.log('DAI token address', tokenAAddress);
    const dai = await MockERC20.at(tokenAAddress);
    await dai.transfer(account3, '250000000000000000000000', {from: admin}) // send account 3 some tokens
    await dai.approve(Swap.address, '250000000000000000000000', {from: admin}); // 250k tokens
    await dai.approve(Swap.address, '250000000000000000000000', {from: account3}); // 250k tokens

    console.log('Approve Swap to spend xDAI')
    const tokenBAddress = await swap.tokenB();
    console.log('xDAI token address', tokenBAddress);
    const xDai = await MockERC20.at(tokenBAddress);
    await xDai.transfer(account3, '250000000000000000000000', {from: admin}) // send account 3 some tokens
    await xDai.approve(Swap.address, '250000000000000000000000', {from: admin}); // 250k tokens
    await xDai.approve(Swap.address, '250000000000000000000000', {from: account3}); // 250k tokens
};
