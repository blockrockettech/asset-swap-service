import {TransactionValue} from "../types/kchannel";

class Quote {

    // TODO find type ...
    // TODO: use prepared statements ... ?
    private client: any;

    constructor(client) {
        this.client = client;
        this.client.on('error', (err, client) => `Error, ${err}, on idle client${client}`);
    }

    async getAll() {
        const queryResult = await this.client.query(`SELECT * FROM quote`);
        return queryResult.rows;
    }

    async getQuote(quote_id: string) {
        const queryResult = await this.client.query(
            `SELECT * FROM quote WHERE quote_id = '${quote_id}' LIMIT 1`
        );
        if (queryResult.rows && queryResult.rows.length === 1) {
            return queryResult.rows[0];
        }
        return null;
    }

    async addQuote(quote_id: string, channel_uuid: string, input: TransactionValue, output: TransactionValue, fee: number) {
        return this.client.query(
            `
                INSERT INTO quote(quote_id, channel_id, input, output, amount, fee)
                VALUES('${quote_id}', '${channel_uuid}', '${input.smart_contract}', '${output.kind}', ${output.value}, ${fee})
            `
        );
    }
}

export default Quote;
