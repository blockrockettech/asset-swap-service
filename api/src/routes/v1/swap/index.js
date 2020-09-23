const swap = require('express').Router({mergeParams: true});

import Quote from "../../../models/Quote";

swap.get('/:quoteId', async (req, res, next) => {
    const {quoteId} = req.params;
    return res
        .status(200)
        .json({
            msg: `Processing swap for quote ID [${quoteId}]`
        });
});

module.exports = swap;

