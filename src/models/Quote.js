import { client } from './Client';

class Quote {
    constructor() {
        this.client = client;
        this.table = 'quote';
        this.client.on('error', (err, client) => `Error, ${err}, on idle client${client}`);
    }

    async getAll(chainId) {
        const queryResult = await this.client.query(`SELECT * FROM ${this.table} WHERE chain_id = ${chainId}`);
        return queryResult.rows;
    }

    async addQuote(quoteId, channelId, chainId, input, output, amount, fee) {
        return this.client.query(
            `
                INSERT INTO quote(quote_id, channel_id, chain_id, input, output, amount, fee)
                VALUES('${quoteId}', '${channelId}', ${chainId}, '${input}', '${output}', ${amount}, ${fee})
            `
        );
    }
}

export default new Quote();
