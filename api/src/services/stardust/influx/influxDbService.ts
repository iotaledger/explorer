import { InfluxDbClient } from "./influxDbClient";

export class InfluxDBService extends InfluxDbClient {
    public get blocksDaily() {
        return this._cache.blocksDaily;
    }

    public get transactionsDaily() {
        return this._cache.transactionsDaily;
    }

    public get outputsDaily() {
        return this._cache.outputsDaily;
    }

    public get tokensHeldDaily() {
        return this._cache.tokensHeldDaily;
    }
}

