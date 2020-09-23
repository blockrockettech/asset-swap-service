import { pool } from './pool';

class Quote {
    constructor() {
        this.pool = pool;
        this.table = 'quotes';
        this.pool.on('error', (err, client) => `Error, ${err}, on idle client${client}`);
    }

    async select(columns, clause) {
        let query = `SELECT ${columns} FROM ${this.table}`;
        if (clause) {
            query = `
                ${query}
                WHERE ${clause}
            `
        }

        return this.pool.query(query);
    }
}

export default new Quote();
