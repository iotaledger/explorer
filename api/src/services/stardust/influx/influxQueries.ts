export const BLOCK_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        sum("transaction_count") AS "transaction",
        sum("milestone_count") AS "milestone",
        sum("tagged_data_count") AS "taggedData",
        sum("no_payload_count") AS "noPayload"
    FROM "stardust_block_activity"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const TRANSACTION_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        sum("confirmed_count") AS "confirmed",
        sum("conflicting_count") AS "conflicting"
    FROM "stardust_block_activity"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const OUTPUTS_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("basic_count") AS "basic",
        last("alias_count") AS "alias",
        last("foundry_count") AS "foundry",
        last("nft_count") AS "nft"
    FROM "stardust_ledger_outputs"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const TOKENS_HELD_BY_OUTPUTS_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("basic_value") / 1000000 AS "basic",
        last("alias_value") / 1000000 AS "alias",
        last("foundry_value") / 1000000 AS "foundy",
        last("nft_value") / 1000000 AS "nft"
    FROM "stardust_ledger_outputs"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

