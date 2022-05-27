import { ServiceFactory } from "../../../factories/serviceFactory";
import { INftDetailsRequest } from "../../../models/api/stardust/INftDetailsRequest";
import { INftDetailsResponse } from "../../../models/api/stardust/INftDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";
import "dotenv/config";

/**
 * Get mock nft detils
 * @returns nft details.
 */
const getMockNftDetails = (): INftDetailsResponse => {
    return {
        imageSrc: "https://cdn.pixabay.com/photo/2021/11/06/14/40/nft-6773494_960_720.png",
        amount: 100,
        quantity: 1.25,
        generalData: {
            standard: "ERC-1155",
            tokenId: "2139039",
            contractAddress: "0x2d71279794d65115d400d823a8a48d25f956c39f48aa245fa6d0a1db9accfc",
            creatorAddress: "0x2d71279794d65115d400d823a8a48d25f956c39f48aa245fa6d0a1db9accbd",
            senderAddress: "0x2d71279794d65115d400d823a8a48d25f956c39f48aa245fa6d0a1db9accav",
            fileType: "JPG",
            network: "Layer 2 network"
        },
        activityHistory: [
            {
                transactionId: "0x5ade9fb0ee287c3bd52a011bcbf19f4cc9137a98afa07f48c2c62f8063d66045",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi"
            },
            {
                transactionId: "0x5ade9fb0ee287c3bd52a011bcbf19f4cc9137a98afa07f48c2c62f8063d66034",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi"
            },
            {
                transactionId: "0x5ade9fb0ee287c3bd52a011bcbf19f4cc9137a98afa07f48c2c62f8063d66023",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi"
            },
            {
                transactionId: "0x5ade9fb0ee287c3bd52a011bcbf19f4cc9137a98afa07f48c2c62f8063d660b0",
                date: "2021-06-18 01:32 AM",
                action: "Sale",
                status: "Confirmed",
                price: "+1.25 Gi"
            }
        ]
    };
}

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: INftDetailsRequest
): Promise<INftDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.nftId, "nftId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }
    if (process.env.FAKE_NFT_DETAILS === "true") {
        return Promise.resolve(getMockNftDetails());
    }
    return Promise.resolve({});
}
