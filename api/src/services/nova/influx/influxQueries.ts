export const BLOCK_DAILY_QUERY = {
    full: `
        SELECT
            sum("transaction_count") AS "transaction",
            sum("tagged_data_count") AS "taggedData",
            sum("candidacy_announcement_count") AS "candidacy",
            sum("no_payload_count") AS "noPayload",
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
            sum("no_payload_count") AS "noPayload",
            sum("validation_count") AS "validation"
        FROM "iota_block_activity"
        WHERE time >= $from and time <= $to
        GROUP BY time(1d) fill(null)
    `,
};
