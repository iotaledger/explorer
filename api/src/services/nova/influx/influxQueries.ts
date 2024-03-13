export const BLOCK_DAILY_QUERY = {
    full: `
        SELECT
            sum("transaction_count") AS "transaction",
            sum("tagged_data_count") AS "taggedData",
            sum("candidacy_announcement_count") AS "candidacy",
            sum("validation_count") AS "validation"
        FROM "iota_block_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("transaction_count") AS "transaction",
            sum("tagged_data_count") AS "taggedData",
            sum("candidacy_announcement_count") AS "candidacy",
            sum("validation_count") AS "validation"
        FROM "iota_block_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TRANSACTION_DAILY_QUERY = {
    full: `
        SELECT
            sum("finalized_count") AS "finalized",
            sum("failed_count") AS "failed"
        FROM "iota_block_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("finalized_count") AS "finalized",
            sum("failed_count") AS "failed"
        FROM "iota_block_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const OUTPUTS_DAILY_QUERY = {
    full: `
        SELECT
            last("basic_count") AS "basic",
            last("account_count") AS "account",
            last("foundry_count") AS "foundry",
            last("nft_count") AS "nft"
            last("anchor_count") AS "anchor"
            last("delegation_count") AS "delegation"
        FROM "iota_ledger_outputs"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("basic_count") AS "basic",
            last("account_count") AS "account",
            last("foundry_count") AS "foundry",
            last("nft_count") AS "nft"
            last("anchor_count") AS "anchor"
            last("delegation_count") AS "delegation"
        FROM "iota_ledger_outputs"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const EPOCH_STATS_QUERY = `
    SELECT
        last("epoch_index") AS "epochIndex",
        last("tagged_data_count") AS "taggedData",
        last("transaction_count") AS "transaction",
        last("candidacy_announcement_count") AS "candidacy",
        last("no_payload_count") AS "noPayload"
    FROM "iota_block_activity"
`;
export const EPOCH_STATS_QUERY_BY_INDEX = `
    SELECT
        epoch_index AS "epochIndex",
        tagged_data_count AS "taggedData",
        transaction_count AS "transaction",
        candidacy_announcement_count AS "candidacy",
        no_payload_count AS "noPayload"
    FROM "iota_block_activity"
    WHERE "epoch_index" = $epochIndex
`;
