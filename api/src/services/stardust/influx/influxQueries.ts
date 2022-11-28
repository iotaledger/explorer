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

export const ADDRESSES_WITH_BALANCE_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("address_with_balance_count") AS "addressesWithBalance"
    FROM "stardust_addresses"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const AVG_ACTIVE_ADDRESSES_PER_MILESTONE_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        mean("receiving_count") AS "addressesReceiving",
        mean("sending_count") AS "addressesSending"
    FROM "stardust_address_activity"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const TOKENS_TRANSFERRED_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        sum("transferred_value") / 1000000 AS "tokens"
    FROM "stardust_base_token_activity"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const ALIAS_ACTIVITY_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        sum("alias_created_count") AS "created",
        sum("alias_governor_changed_count") AS "governorChanged",
        sum("alias_state_changed_count") AS "stateChanged",
        sum("alias_destroyed_count") AS "destroyed"
    FROM "stardust_output_activity"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const UNLOCK_CONDITIONS_PER_TYPE_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("timelock_count") AS "timelock",
        last("storage_deposit_return_count") AS "storageDepositReturn",
        last("expiration_count") AS "expiration"
    FROM "stardust_unlock_conditions"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const NFT_ACTIVITY_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        sum("nft_created_count") AS "created",
        sum("nft_transferred_count") AS "transferred",
        sum("nft_destroyed_count") AS "destroyed"
    FROM "stardust_output_activity"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const TOKENS_HELD_WITH_UC_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("timelock_value") / 1000000 AS "timelock",
        last("storage_deposit_return_value") / 1000000 AS "storageDepositReturn",
        last("expiration_value") / 1000000 AS "expiration"
    FROM "stardust_unlock_conditions"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const UNCLAIMED_TOKENS_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("unclaimed_value") / 1000000 AS "unclaimed"
    FROM "stardust_unclaimed_rewards"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const UNCLAIMED_GENESIS_OUTPUTS_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("unclaimed_count") AS "unclaimed"
    FROM "stardust_unclaimed_rewards"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const LEDGER_SIZE_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("total_key_bytes") AS "keyBytes",
        last("total_data_bytes") AS "dataBytes"
    FROM "stardust_ledger_size"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

export const STORAGE_DEPOSIT_DAILY_PARAMETERIZED_QUERY = `
    SELECT
        last("total_storage_deposit_value") * 100 / 1000000 AS "storageDeposit"
    FROM "stardust_ledger_size"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

