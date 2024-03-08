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

export const TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY = {
    full: `
        SELECT
            last("basic_amount") / 1000000 AS "basic",
            last("account_amount") / 1000000 AS "account",
            last("foundry_amount") / 1000000 AS "foundy",
            last("nft_amount") / 1000000 AS "nft",
            last("anchor_amount") / 1000000 AS "anchor",
            last("delegation_amount") / 1000000 AS "delegation"
        FROM "iota_ledger_outputs"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("basic_amount") / 1000000 AS "basic",
            last("account_amount") / 1000000 AS "account",
            last("foundry_amount") / 1000000 AS "foundy",
            last("nft_amount") / 1000000 AS "nft",
            last("anchor_amount") / 1000000 AS "anchor",
            last("delegation_amount") / 1000000 AS "delegation"
        FROM "iota_ledger_outputs"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const ADDRESSES_WITH_BALANCE_DAILY_QUERY = {
    full: `
        SELECT
            last("address_with_balance_count") AS "addressesWithBalance"
        FROM "iota_addresses"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("address_with_balance_count") AS "addressesWithBalance"
        FROM "iota_addresses"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY = {
    full: `
        SELECT
            last("count") AS activeAddresses
        FROM "iota_daily_active_addresses"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("count") AS activeAddresses
        FROM "iota_daily_active_addresses"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TOKENS_TRANSFERRED_DAILY_QUERY = {
    full: `
        SELECT
            sum("transferred_amount") / 1000000 AS "tokens"
        FROM "iota_base_token_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("transferred_amount") / 1000000 AS "tokens"
        FROM "iota_base_token_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const ANCHOR_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("anchor_created_count") AS "created",
            sum("anchor_governor_changed_count") AS "governorChanged",
            sum("anchor_state_changed_count") AS "stateChanged",
            sum("anchor_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("anchor_created_count") AS "created",
            sum("anchor_governor_changed_count") AS "governorChanged",
            sum("anchor_state_changed_count") AS "stateChanged",
            sum("anchor_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const NFT_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("nft_created_count") AS "created",
            sum("nft_transferred_count") AS "transferred",
            sum("nft_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("nft_created_count") AS "created",
            sum("nft_transferred_count") AS "transferred",
            sum("nft_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};
