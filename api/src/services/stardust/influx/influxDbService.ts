import { InfluxDbClient } from "./influxDbClient";

export class InfluxDBService extends InfluxDbClient {
    public get blocksDaily() {
        return this._blocksDaily;
    }
}

