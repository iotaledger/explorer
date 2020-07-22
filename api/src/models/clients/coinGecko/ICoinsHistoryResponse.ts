/* eslint-disable camelcase */
export interface ICoinsHistoryResponse {
    /**
     * An error occured.
     */
    error?: string;

    /**
     * Id of the coin.
     */
    id?: string;

    /**
     * Symbol for the coin.
     */
    symbol?: string;

    /**
     * The name of the coin.
     */
    name?: string;

    /**
     * Localized name of the coin.
     */
    localization?: { [id: string]: string };

    /**
     * The image for the coin.
     */
    image?: {
        /**
         * The thumb size image.
         */
        thumb: string;
        /**
         * The small size image.
         */
        small: string;
    };

    /**
     * The market data
     */
    market_data?: {
        /**
         * Current price per currency.
         */
        current_price: {
            [id: string]: number;
        };

        /**
         * Current market cap per currency.
         */
        market_cap: {
            [id: string]: number;
        };

        /**
         * Total 24h volume cap per currency.
         */
        total_volume: {
            [id: string]: number;
        };
    };

    /**
     * Community data for the coin.
     */
    community_data?: {
        /**
         * Facebook likes.
         */
        facebook_likes: number;
        /**
         * Twitter followers.
         */
        twitter_followers: number;
        /**
         * Reddit averrage posts 48h.
         */
        reddit_average_posts_48h: number;
        /**
         * Reddit average comments 48h.
         */
        reddit_average_comments_48h: number;
        /**
         * Reddit subscribers.
         */
        reddit_subscribers: number;
        /**
         * Reddit accounts active 48h.
         */
        reddit_accounts_active_48h: number;
    };

    /**
     * Developer data.
     */
    developer_data?: {
        /**
         * GitHub forks.
         */
        forks: number;
        /**
         * GitHub stars.
         */
        stars: number;
        /**
         * GitHub subscribers.
         */
        subscribers: number;
        /**
         * GitHub total issues.
         */
        total_issues: number;
        /**
         * GitHub closed issues.
         */
        closed_issues: number;
        /**
         * GitHub pull requests merged.
         */
        pull_requests_merged: number;
        /**
         * GitHub pull requests contributors.
         */
        pull_request_contributors: number;
        /**
         * GitHub code additions last 4 weeks.
         */
        code_additions_deletions_4_weeks: {
            /**
             * GitHub additions.
             */
            additions: number;
            /**
             * GitHub deletions.
             */
            deletions: number;
        };
        /**
         * GitHub commit 4 weeks.
         */
        commit_count_4_weeks: number;
    };

    /**
     * Public interest stats.
     */
    public_interest_stats?: {
        /**
         * Alexa rank.
         */
        alexa_rank: number;
        /**
         * Bing matches.
         */
        bing_matches: number;
    };
}
