import { SearchQuery } from "./searchQueryBuilder";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ISearchResponse } from "../../models/api/nova/ISearchResponse";
import { INetwork } from "../../models/db/INetwork";
import { NovaApiService } from "../../services/nova/novaApiService";

export class SearchExecutor {
    /**
     * The search query.
     */
    private readonly query: SearchQuery;

    private readonly apiService: NovaApiService;

    constructor(network: INetwork, query: SearchQuery) {
        this.query = query;
        this.apiService = ServiceFactory.get<NovaApiService>(`api-service-${network.network}`);
    }

    public async run(): Promise<ISearchResponse> {
        const searchQuery = this.query;
        const promises: Promise<void>[] = [];
        let promisesResult: ISearchResponse | null = null;

        if (searchQuery.blockId) {
            promises.push(
                this.executeQuery(
                    this.apiService.block(searchQuery.blockId),
                    (blockResponse) => {
                        promisesResult = {
                            block: blockResponse.block,
                        };
                    },
                    "Block fetch failed",
                ),
            );
        }

        await Promise.any(promises);

        if (promisesResult !== null) {
            return promisesResult;
        }

        return {};
    }

    private async executeQuery<T>(query: Promise<T>, successHandler: (result: T) => void, failureMessage: string): Promise<void> {
        try {
            const result = await query;
            if (result) {
                successHandler(result);
            } else {
                throw new Error(failureMessage);
            }
        } catch {
            throw new Error(failureMessage);
        }
    }
}
