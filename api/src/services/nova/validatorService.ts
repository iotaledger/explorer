import { Client, ValidatorResponse } from "@iota/sdk-nova";
import cron from "node-cron";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { INetwork } from "../../models/db/INetwork";

/**
 * The collect validators interval cron expression.
 * Every hour at 55 min 55 sec
 */
const COLLECT_VALIDATORS_CRON = "55 55 * * * *";

export class ValidatorService {
    /**
     * The current validators cache state.
     */
    protected _validatorsCache: ValidatorResponse[] = [];

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

    public setupValidatorsCollection() {
        const network = this._network.network;
        logger.verbose(`[ValidatorService] Setting up validator collection for (${network})]`);

        // eslint-disable-next-line no-void
        void this.updateValidatorsCache();

        cron.schedule(COLLECT_VALIDATORS_CRON, async () => {
            logger.verbose(`[ValidatorService] Collecting validators for "${this._network.network}"`);
            // eslint-disable-next-line no-void
            void this.updateValidatorsCache();
        });
    }

    private async updateValidatorsCache() {
        let cursor: string | undefined;
        let validators: ValidatorResponse[] = [];

        do {
            try {
                const validatorsResponse = await this.client.getValidators(undefined, cursor);

                // @ts-expect-error REMOVE THESE COMMENTS AND FIX THE FIELD when the field is fixed in the node (stakers -> validators)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                validators = validators.concat(validatorsResponse.stakers);
                cursor = validatorsResponse.cursor;
            } catch (e) {
                logger.error(`Fetching validators failed. Cause: ${e}`);
            }
        } while (cursor);

        this._validatorsCache = validators;
    }
}
