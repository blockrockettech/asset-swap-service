import { pool } from './pool';

class Quote {
    constructor() {
        this.pool = pool;
        this.table = 'quote';
        this.pool.on('error', (err, client) => `Error, ${err}, on idle client${client}`);
    }

    async getAll(chainId) {
        const queryResult = await this.pool.query(`SELECT * FROM ${this.table} WHERE chain_id = ${chainId}`);
        return queryResult.rows;
    }

    async addQuote(quoteId, channelId, chainId, input, output, amount, fee) {
        return this.pool.query(
            `
                INSERT INTO quote(quote_id, channel_id, chain_id, input, output, amount, fee)
                VALUES('${quoteId}', '${channelId}', ${chainId}, '${input}', '${output}', ${amount}, ${fee})
            `
        );
    }
}

export default new Quote();
