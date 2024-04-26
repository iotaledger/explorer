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

export const BLOCK_ISSUERS_DAILY_QUERY = {
    full: `
        SELECT
            sum("active_count") AS "active",
            sum("registered_count") AS "registered"
        FROM "iota_block_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("active_count") AS "active",
            sum("registered_count") AS "registered"
        FROM "iota_block_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TRANSACTION_DAILY_QUERY = {
    full: `
        SELECT
            sum("txn_finalized_count") AS "finalized",
            sum("txn_failed_count") AS "failed"
        FROM "iota_block_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("txn_finalized_count") AS "finalized",
            sum("txn_failed_count") AS "failed"
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
            last("nft_count") AS "nft",
            last("anchor_count") AS "anchor",
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
            last("nft_count") AS "nft",
            last("anchor_count") AS "anchor",
            last("delegation_count") AS "delegation"
        FROM "iota_ledger_outputs"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const BLOCK_STATS_QUERY = `
    SELECT
        sum("transaction_count") AS "transaction",
        sum("tagged_data_count") AS "taggedData",
        sum("candidacy_announcement_count") AS "candidacy",
        sum("validation_count") AS "noPayload"
    FROM "iota_block_activity"
    WHERE time >= $from and time < $to
`;

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
            last("ed25519_address_with_balance_count") AS "ed25519",
            last("account_address_with_balance_count") AS "account",
            last("nft_address_with_balance_count") AS "nft",
            last("anchor_address_with_balance_count") AS "anchor",
            last("implicit_account_address_with_balance_count") AS "implicit"
        FROM "iota_addresses"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("ed25519_address_with_balance_count") AS "ed25519",
            last("account_address_with_balance_count") AS "account",
            last("nft_address_with_balance_count") AS "nft",
            last("anchor_address_with_balance_count") AS "anchor",
            last("implicit_account_address_with_balance_count") AS "implicit"
        FROM "iota_addresses"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const TOTAL_ACTIVE_ADDRESSES_DAILY_QUERY = {
    full: `
        SELECT
            last("ed25519_address_with_balance_count") AS "ed25519",
            last("account_address_with_balance_count") AS "account",
            last("nft_address_with_balance_count") AS "nft",
            last("anchor_address_with_balance_count") AS "anchor",
            last("implicit_account_address_with_balance_count") AS "implicit"
        FROM "iota_daily_active_addresses"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("ed25519_address_with_balance_count") AS "ed25519",
            last("account_address_with_balance_count") AS "account",
            last("nft_address_with_balance_count") AS "nft",
            last("anchor_address_with_balance_count") AS "anchor",
            last("implicit_account_address_with_balance_count") AS "implicit"
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

export const ACCOUNT_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("account_created_count") AS "created",
            sum("account_transferred_count") AS "transferred",
            sum("account_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("account_created_count") AS "created",
            sum("account_transferred_count") AS "transferred",
            sum("account_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const FOUNDRY_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("foundry_created_count") AS "created",
            sum("foundry_transferred_count") AS "transferred",
            sum("foundry_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("foundry_created_count") AS "created",
            sum("foundry_transferred_count") AS "transferred",
            sum("foundry_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const DELEGATION_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("delegation_created_count") AS "created",
            sum("delegation_transferred_count") AS "transferred",
            sum("delegation_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("delegation_created_count") AS "created",
            sum("delegation_transferred_count") AS "transferred",
            sum("delegation_destroyed_count") AS "destroyed"
        FROM "iota_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const VALIDATORS_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("validators_candidates_count") AS "candidates",
            sum("validators_total_count") AS "total"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("validators_candidates_count") AS "candidates",
            sum("validators_total_count") AS "total"
        FROM "iota_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const DELEGATORS_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("delegators_total_count") AS "total"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("delegators_total_count") AS "total"
        FROM "iota_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const DELEGATIONS_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("delegations_total_count") AS "total"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("delegations_total_count") AS "total"
        FROM "iota_output_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const STAKING_ACTIVITY_DAILY_QUERY = {
    full: `
        SELECT
            sum("staking_total_count") AS "total"
        FROM "iota_output_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            sum("staking_total_count") AS "total"
        FROM "iota_output_activity"
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
        FROM "iota_unlock_conditions"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("timelock_count") AS "timelock",
            last("storage_deposit_return_count") AS "storageDepositReturn",
            last("expiration_count") AS "expiration"
        FROM "iota_unlock_conditions"
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
        FROM "iota_unlock_conditions"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("timelock_amount") / 1000000 AS "timelock",
            last("storage_deposit_return_amount") / 1000000 AS "storageDepositReturn",
            last("expiration_amount") / 1000000 AS "expiration"
        FROM "iota_unlock_conditions"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const LEDGER_SIZE_DAILY_QUERY = {
    full: `
        SELECT
            last("total_key_bytes") AS "keyBytes",
            last("total_data_bytes") AS "dataBytes"
        FROM "iota_ledger_size"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("total_key_bytes") AS "keyBytes",
            last("total_data_bytes") AS "dataBytes"
        FROM "iota_ledger_size"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const STORAGE_DEPOSIT_DAILY_QUERY = {
    full: `
        SELECT
            last("total_storage_score") / 1000000 AS "storageDeposit"
        FROM "iota_ledger_size"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("total_storage_score") / 1000000 AS "storageDeposit"
        FROM "iota_ledger_size"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

export const MANA_BURN_DAILY_QUERY = {
    full: `
        SELECT
            last("mana_burned") AS "manaBurned",
            last("bic_burned") AS "bicBurned"
        FROM "iota_mana_activity"
        WHERE time < $to
        GROUP BY time(1d) fill(null)
    `,
    partial: `
        SELECT
            last("mana_burned") AS "manaBurned",
            last("bic_burned") AS "bicBurned"
        FROM "iota_mana_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};

/* ANALYTIC QUERIES */

export const ACCOUNT_ADDRESSES_WITH_BALANCE_TOTAL_QUERY = `
    SELECT
        last("account_address_with_balance_count") AS "accountAddressesWithBalance"
    FROM "iota_addresses";
`;

export const NATIVE_TOKENS_STAT_TOTAL_QUERY = `
    SELECT
        last("foundry_count") AS "nativeTokensCount"
    FROM "iota_ledger_outputs";
`;

export const NFT_STAT_TOTAL_QUERY = `
    SELECT
        last("nft_count") AS "nftsCount"
    FROM "iota_ledger_outputs";
`;

export const STORAGE_DEPOSIT_TOTAL_QUERY = `
    SELECT
        last("total_storage_deposit_amount") AS "lockedStorageDeposit"
    FROM "iota_ledger_size";
`;

export const DELEGATORS_TOTAL_QUERY = `
    SELECT
        last("delegation_count") AS "delegatorsCount"
    FROM "iota_ledger_outputs";
`;
