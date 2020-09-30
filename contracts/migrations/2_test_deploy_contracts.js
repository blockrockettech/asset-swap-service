const {getAccountAddress} = require('@blockrocket/utils');
const getMnemonic = require('./utils/getMnemonic');

const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const Deposit = artifacts.require('Deposit');
const MockERC20 = artifacts.require('MockERC20');

module.exports = async function (deployer, network, accounts) {
    console.log('Deploying core contracts to network: ' + network);

    const MNEMONIC = getMnemonic(network);

    const admin = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);
    const account3 = getAccountAddress(accounts, 2, network, MNEMONIC, INFURA_KEY);

    console.log('Deploying DAI');
    await deployer.deploy(MockERC20, 'DAI', 'DAI', {from: admin});
    const dai = await MockERC20.deployed();

    console.log('Sending 250k DAI to account #3 for later lock up');
    const _250_Thousand_Tokens = '250000000000000000000000';
    await dai.transfer(account3, _250_Thousand_Tokens, {from: admin});

    console.log('Deploying deposit contract for DAI');
    await deployer.deploy(Deposit, dai.address, {from: admin});
    const daiDeposit = await Deposit.deployed();
    console.log('dai deposit address', daiDeposit.address);

    console.log('Deploying xDAI')
    await deployer.deploy(MockERC20, 'xDAI', 'xDAI', {from: admin});
    const xDai = await MockERC20.deployed();

    console.log('Deploying deposit contract for xDAI');
    await deployer.deploy(Deposit, xDai.address, {from: admin});
    const xDaiDeposit = await Deposit.deployed();
    console.log('xDAI deposit address', xDaiDeposit.address);

    console.log('Depositing 250k DAI from account #3');
    await dai.approve(daiDeposit.address, _250_Thousand_Tokens, {from: account3});
    await daiDeposit.deposit(_250_Thousand_Tokens, {from: account3});

    console.log('Deposit 250K xDAI from account #1');
    await xDai.approve(xDaiDeposit.address, _250_Thousand_Tokens, {from: admin});
    await xDaiDeposit.deposit(_250_Thousand_Tokens, {from: admin});
};
