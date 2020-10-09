-- TODO clean this up to be proper types once we know more
CREATE TABLE IF NOT EXISTS quote
(
    id          SERIAL PRIMARY KEY,
    quote_id    VARCHAR UNIQUE,
    channel_id  VARCHAR,
    input       VARCHAR,
    output      VARCHAR,
    amount      VARCHAR,
    fee         VARCHAR,
    create_date DATE DEFAULT CURRENT_DATE
);
