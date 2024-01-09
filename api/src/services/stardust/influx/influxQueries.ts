export const BLOCK_DAILY_QUERY = {
    full: `
        SELECT
            sum("transaction_count") AS "transaction",
            sum("milestone_count") AS "milestone",
            sum("tagged_data_count") AS "taggedData",
            sum("no_payload_count") AS "noPayload"
        FROM "stardust_block_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("transaction_count") AS "transaction",
            sum("milestone_count") AS "milestone",
            sum("tagged_data_count") AS "taggedData",
            sum("no_payload_count") AS "noPayload"
        FROM "stardust_block_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TRANSACTION_DAILY_QUERY = {
    full: `
        SELECT
            sum("confirmed_count") AS "confirmed",
            sum("conflicting_count") AS "conflicting"
        FROM "stardust_block_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("confirmed_count") AS "confirmed",
            sum("conflicting_count") AS "conflicting"
        FROM "stardust_block_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const OUTPUTS_DAILY_QUERY = {
    full: `
        SELECT
            last("basic_count") AS "basic",
            last("alias_count") AS "alias",
            last("foundry_count") AS "foundry",
            last("nft_count") AS "nft"
        FROM "stardust_ledger_outputs"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("basic_count") AS "basic",
            last("alias_count") AS "alias",
            last("foundry_count") AS "foundry",
            last("nft_count") AS "nft"
        FROM "stardust_ledger_outputs"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TOKENS_HELD_BY_OUTPUTS_DAILY_QUERY = {
    full: `
        SELECT
            last("basic_amount") / 1000000 AS "basic",
            last("alias_amount") / 1000000 AS "alias",
            last("foundry_amount") / 1000000 AS "foundy",
            last("nft_amount") / 1000000 AS "nft"
        FROM "stardust_ledger_outputs"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("basic_amount") / 1000000 AS "basic",
            last("alias_amount") / 1000000 AS "alias",
            last("foundry_amount") / 1000000 AS "foundy",
            last("nft_amount") / 1000000 AS "nft"
        FROM "stardust_ledger_outputs"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const ADDRESSES_WITH_BALANCE_DAILY_QUERY = {
    full: `
        SELECT
            last("address_with_balance_count") AS "addressesWithBalance"
        FROM "stardust_addresses"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("address_with_balance_count") AS "addressesWithBalance"
        FROM "stardust_addresses"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY = {
    full: `
        SELECT
            last("count") AS activeAddresses
        FROM "stardust_daily_active_addresses"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("count") AS activeAddresses
        FROM "stardust_daily_active_addresses"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TOKENS_TRANSFERRED_DAILY_QUERY = {
    full: `
        SELECT
            sum("transferred_amount") / 1000000 AS "tokens"
        FROM "stardust_base_token_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("transferred_amount") / 1000000 AS "tokens"
        FROM "stardust_base_token_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const ALIAS_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("alias_created_count") AS "created",
            sum("alias_governor_changed_count") AS "governorChanged",
            sum("alias_state_changed_count") AS "stateChanged",
            sum("alias_destroyed_count") AS "destroyed"
        FROM "stardust_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("alias_created_count") AS "created",
            sum("alias_governor_changed_count") AS "governorChanged",
            sum("alias_state_changed_count") AS "stateChanged",
            sum("alias_destroyed_count") AS "destroyed"
        FROM "stardust_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const UNLOCK_CONDITIONS_PER_TYPE_DAILY_QUERY = {
    full: `
        SELECT
            last("timelock_count") AS "timelock",
            last("storage_deposit_return_count") AS "storageDepositReturn",
            last("expiration_count") AS "expiration"
        FROM "stardust_unlock_conditions"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("timelock_count") AS "timelock",
            last("storage_deposit_return_count") AS "storageDepositReturn",
            last("expiration_count") AS "expiration"
        FROM "stardust_unlock_conditions"
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
        FROM "stardust_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("nft_created_count") AS "created",
            sum("nft_transferred_count") AS "transferred",
            sum("nft_destroyed_count") AS "destroyed"
        FROM "stardust_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TOKENS_HELD_WITH_UC_DAILY_QUERY = {
    full: `
        SELECT
            last("timelock_amount") / 1000000 AS "timelock",
            last("storage_deposit_return_amount") / 1000000 AS "storageDepositReturn",
            last("expiration_amount") / 1000000 AS "expiration"
        FROM "stardust_unlock_conditions"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("timelock_amount") / 1000000 AS "timelock",
            last("storage_deposit_return_amount") / 1000000 AS "storageDepositReturn",
            last("expiration_amount") / 1000000 AS "expiration"
        FROM "stardust_unlock_conditions"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const UNCLAIMED_TOKENS_DAILY_QUERY = {
    full: `
        SELECT
            last("unclaimed_amount") / 1000000 AS "unclaimed"
        FROM "stardust_unclaimed_rewards"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("unclaimed_amount") / 1000000 AS "unclaimed"
        FROM "stardust_unclaimed_rewards"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const UNCLAIMED_GENESIS_OUTPUTS_DAILY_QUERY = {
    full: `
        SELECT
            last("unclaimed_count") AS "unclaimed"
        FROM "stardust_unclaimed_rewards"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("unclaimed_count") AS "unclaimed"
        FROM "stardust_unclaimed_rewards"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const LEDGER_SIZE_DAILY_QUERY = {
    full: `
        SELECT
            last("total_key_bytes") AS "keyBytes",
            last("total_data_bytes") AS "dataBytes"
        FROM "stardust_ledger_size"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("total_key_bytes") AS "keyBytes",
            last("total_data_bytes") AS "dataBytes"
        FROM "stardust_ledger_size"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const STORAGE_DEPOSIT_DAILY_QUERY = {
    full: `
        SELECT
            last("total_storage_deposit_amount") * 100 / 1000000 AS "storageDeposit"
        FROM "stardust_ledger_size"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("total_storage_deposit_amount") * 100 / 1000000 AS "storageDeposit"
        FROM "stardust_ledger_size"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

/* ANALYTIC QUERIES */

export const ADDRESSES_WITH_BALANCE_TOTAL_QUERY = `
    SELECT
        last("address_with_balance_count") AS "addressesWithBalance"
    FROM "stardust_addresses";
`;

export const NATIVE_TOKENS_STAT_TOTAL_QUERY = `
    SELECT
        last("foundry_count") AS "nativeTokensCount"
    FROM "stardust_ledger_outputs";
`;

export const NFT_STAT_TOTAL_QUERY = `
    SELECT
        last("nft_count") AS "nftsCount"
    FROM "stardust_ledger_outputs";
`;

export const STORAGE_DEPOSIT_TOTAL_QUERY = `
    SELECT
        last("total_storage_deposit_amount") * 100 AS "lockedStorageDeposit"
    FROM "stardust_ledger_size";
`;

export const SHIMMER_CLAIMED_TOTAL_QUERY = `
    SELECT
        last("unclaimed_amount") AS "totalUnclaimedShimmer"
    FROM "stardust_unclaimed_rewards";
`;

export const MILESTONE_STATS_QUERY = `
    SELECT
        last("milestone_index") AS "milestoneIndex",
        last("tagged_data_count") AS "taggedData",
        last("milestone_count") AS "milestone",
        last("transaction_count") AS "transaction",
        last("treasury_transaction_count") AS "treasuryTransaction",
        last("no_payload_count") AS "noPayload"
    FROM "stardust_block_activity"
`;
export const MILESTONE_STATS_QUERY_BY_INDEX = `
    SELECT
        milestone_index AS "milestoneIndex",
        tagged_data_count AS "taggedData",
        milestone_count AS "milestone",
        transaction_count AS "transaction",
        treasury_transaction_count AS "treasuryTransaction",
        no_payload_count AS "noPayload"
    FROM "stardust_block_activity"
    WHERE "milestone_index" = $milestoneIndex
`;
