import { Client, ValidatorResponse, CommitteeResponse } from "@iota/sdk-nova";
import cron from "node-cron";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { INetwork } from "../../models/db/INetwork";

/**
 * The collect validators interval cron expression.
 * Every 10 minutes
 */
const COLLECT_VALIDATORS_CRON = "*/10 * * * *";

export class ValidatorService {
    /**
     * The current validators cache state.
     */
    protected _validatorsCache: ValidatorResponse[] = [];

    /**
     * The current committee cache state.
     */
    protected _committeeCache: CommitteeResponse | null = null;

    /**
     * The network in context for this client.
     */
    private readonly _network: INetwork;

    /**
     * The client to use for requests.
     */
    private readonly client: Client;

    /**
     * Create a new instance of ValidatorService.
     * @param network The network configuration.
     */
    constructor(network: INetwork) {
        this._network = network;
        this.client = ServiceFactory.get<Client>(`client-${network.network}`);
    }

    public get validators(): ValidatorResponse[] {
        return this._validatorsCache;
    }

    public get committee(): CommitteeResponse | null {
        return this._committeeCache;
    }

    public setupValidatorsCollection() {
        const network = this._network.network;
        logger.verbose(`[ValidatorService] Setting up validator collection for (${network})]`);

        // eslint-disable-next-line no-void
        void this.updateValidatorsCache();
        // eslint-disable-next-line no-void
        void this.updateCommitteeCache();

        cron.schedule(COLLECT_VALIDATORS_CRON, async () => {
            logger.verbose(`[ValidatorService] Collecting validators for "${this._network.network}"`);
            // eslint-disable-next-line no-void
            void this.updateValidatorsCache();
            // eslint-disable-next-line no-void
            void this.updateCommitteeCache();
        });
    }

    private async updateValidatorsCache() {
        let cursor: string | undefined;
        let validators: ValidatorResponse[] = [];

        do {
            try {
                const validatorsResponse = await this.client.getValidators(undefined, cursor);

                validators = validators.concat(validatorsResponse.validators);
                cursor = validatorsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching validators failed. Cause: ${e}`);
            }
        } while (cursor);

        this._validatorsCache = validators;
    }

    private async updateCommitteeCache() {
        try {
            this._committeeCache = await this.client.getCommittee();
        } catch (e) {
            logger.error(`Fetching committee failed. Cause: ${e}`);
        }
    }
}
