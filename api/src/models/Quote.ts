import {TransactionValue} from "../types/kchannel";
import {utils} from "ethers";

const {getAddress} = utils;

// TODO replace this whole class with an ORM to save ones sanity!
class Quote {

    private client: any;

    constructor(client) {
        this.client = client;
        this.client.on('error', (err, client) => `Error, ${err}, on idle client${client}`);
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

    // FIXME do I need to store channel_uuid ?

    async addQuote(quote_id: string, channel_uuid: string, input: TransactionValue, output: TransactionValue, fee: number) {
        return this.client.query(`
            INSERT INTO quote(quote_id, channel_id, input, input_chain_id, output, output_chain_id, amount, fee)
            VALUES('${quote_id}', '${channel_uuid}', '${getAddress(input.smart_contract)}', '${input.chain_id}', '${getAddress(output.smart_contract)}', '${output.chain_id}', '${output.value}', ${fee})
        `);
    }

    async fulfillQuote(quote_id: string) {
        const query = `
            UPDATE quote SET 
            fulfilled=true, 
            fulfilled_timestamp=NOW()
            WHERE quote_id='${quote_id}'
        `;
        return this.client.query(query);
    }
}

export default Quote;
