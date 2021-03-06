-- TODO clean this up to be proper types once we know more
CREATE TABLE IF NOT EXISTS quote
(
    id                  SERIAL PRIMARY KEY,
    quote_id            VARCHAR UNIQUE,
    channel_id          VARCHAR     NOT NULL,
    input               VARCHAR     NOT NULL DEFAULT '0',
    input_chain_id      VARCHAR     NOT NULL DEFAULT '0',
    output              VARCHAR     NOT NULL DEFAULT '0',
    output_chain_id     VARCHAR     NOT NULL DEFAULT '0',
    amount              VARCHAR     NOT NULL DEFAULT '0',
    fee                 VARCHAR     NOT NULL DEFAULT '0',
    fulfilled           BOOLEAN     NOT NULL DEFAULT FALSE,
    fulfilled_timestamp VARCHAR              DEFAULT NULL,
    created_timestamp   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asset_swap_channel_state
(
    id                 SERIAL PRIMARY KEY,
    channel_uuid       VARCHAR     NOT NULL,
    nonce              INT         NOT NULL,
    channel_state_hash VARCHAR     NOT NULL,
    smart_contract     VARCHAR     NOT NULL,
    chain_id           VARCHAR     NOT NULL,
    value              VARCHAR     NOT NULL,
    created_timestamp  timestamptz NOT NULL DEFAULT now()
);

