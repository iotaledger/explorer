import { ServiceFactory } from "../../../../factories/serviceFactory";
import { ISlotManaBurnedRequest } from "../../../../models/api/nova/stats/slot/ISlotManaBurnedRequest";
import { ISlotManaBurnedResponse } from "../../../../models/api/nova/stats/slot/ISlotManaBurnedResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { InfluxServiceNova } from "../../../../services/nova/influx/influxServiceNova";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the slot mana burned from influx nova.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: ISlotManaBurnedRequest): Promise<ISlotManaBurnedResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.numberFromString(request.slotIndex, "slotIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const influxService = ServiceFactory.get<InfluxServiceNova>(`influxdb-${networkConfig.network}`);

    if (influxService) {
        const slotIndex = Number.parseInt(request.slotIndex, 10);
        const manaBurnedInSlot = await influxService.getManaBurnedBySlotIndex(slotIndex);

        if (manaBurnedInSlot) {
            return {
                slotIndex: manaBurnedInSlot.slotIndex,
                manaBurned: manaBurnedInSlot.manaBurned,
            };
        }

        return { error: `Could not fetch mana burned for slot ${request.slotIndex}` };
    }

    return { error: "Influx service not found for this network." };
}
