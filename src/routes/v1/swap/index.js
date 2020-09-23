const swap = require('express').Router({mergeParams: true});

swap.get('/', async (req, res, next) => {
    return res
        .status(200)
        .json({
            hello: 'world'
        });
});

module.exports = swap;

