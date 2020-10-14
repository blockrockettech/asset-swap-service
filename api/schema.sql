-- TODO clean this up to be proper types once we know more
CREATE TABLE IF NOT EXISTS quote
(
    id                SERIAL PRIMARY KEY,
    quote_id          VARCHAR UNIQUE,
    channel_id        VARCHAR     NOT NULL,
    input             VARCHAR     NOT NULL DEFAULT '0',
    output            VARCHAR     NOT NULL DEFAULT '0',
    amount            VARCHAR     NOT NULL DEFAULT '0',
    fee               VARCHAR     NOT NULL DEFAULT '0',
    created_timestamp timestamptz NOT NULL DEFAULT now()
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

-- Add foreign key for state channel hash
alter table asset_swap_channel_state
    add constraint asset_swap_channel_channel_state_hash_pk
        unique (channel_state_hash);

