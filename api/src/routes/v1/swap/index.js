const swap = require('express').Router({mergeParams: true});

import Quote from "../../../models/Quote";

swap.get('/:quoteId', async (req, res, next) => {
    const {quoteId} = req.params;

    //TODO: check the user approval still persists and there is still enough liquidity

    return res
        .status(200)
        .json({
            msg: `Processing swap for quote ID [${quoteId}]`
        });
});

module.exports = swap;

