export const BLOCK_DAILY_STATS_PARAMETERIZED_QUERY = `
    SELECT
        sum("transaction_count") AS "transaction",
        sum("milestone_count") AS "milestone",
        sum("tagged_data_count") AS "taggedData",
        sum("no_payload_count") AS "noPayload"
    FROM "stardust_block_activity"
    WHERE time >= $from and time <= $to
    GROUP BY time(1d) fill(null)
`;

