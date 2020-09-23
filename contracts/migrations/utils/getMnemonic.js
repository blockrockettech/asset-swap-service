module.exports = function (network) {
    // For live deployments use a specific Ephimera key
    if (network === 'mainnet') {
        return process.env.ASSET_SWAP_SERVICE_KEY || '';
    }
    return process.env.PROTOTYPE_BR_KEY || '';
};
