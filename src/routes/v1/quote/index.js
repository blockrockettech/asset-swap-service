import express from 'express';
const quote = express.Router({mergeParams: true});

quote.get('/', async (req, res, next) => {
    return res
        .status(200)
        .json({
            hello: 'world'
        });
});

export default quote;

