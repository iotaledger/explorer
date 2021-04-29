import { ServiceFactory } from "../factories/serviceFactory";
import { IConfiguration } from "../models/configuration/IConfiguration";
import { NetworkService } from "../services/networkService";

/**
 * Reload network config.
 * @param config The configuration.
 * @returns The response.
 */
export async function reload(config: IConfiguration): Promise<string[]> {
    let log = "Reloading\n";

    try {

        const networkService = ServiceFactory.get<NetworkService>("network");
        await networkService.buildCache();
    } catch (err) {
        log += `Failed\n${err.toString()}\n`;
    }

    log += !log.includes("Failed") ? "Reloading Succeeded" : "Reloading Failed";

    return log.split("\n");
}
