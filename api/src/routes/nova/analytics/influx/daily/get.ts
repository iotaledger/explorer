import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { INetworkBoundGetRequest } from "../../../../../models/api/INetworkBoundGetRequest";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../../models/db/protocolVersion";
import {
    IAccountActivityDailyInflux,
    IActiveAddressesDailyInflux,
    IAddressesWithBalanceDailyInflux,
    IAnchorActivityDailyInflux,
    IBlockIssuerDailyInflux,
    IBlocksDailyInflux,
    IDelegationActivityDailyInflux,
    IDelegationsActivityDailyInflux,
    IDelegatorsActivityDailyInflux,
    IFoundryActivityDailyInflux,
    ILedgerSizeDailyInflux,
    IManaBurnedDailyInflux,
    INftActivityDailyInflux,
    IOutputsDailyInflux,
    IStakingActivityDailyInflux,
    IStorageDepositDailyInflux,
    ITokensHeldPerOutputDailyInflux,
    ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux,
    ITransactionsDailyInflux,
    IUnlockConditionsPerTypeDailyInflux,
    IValidatorsActivityDailyInflux,
} from "../../../../../models/influx/nova/IInfluxTimedEntries";
import { NetworkService } from "../../../../../services/networkService";
import { InfluxServiceNova } from "../../../../../services/nova/influx/influxServiceNova";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * The response with the current cached analytic data.
 */
export interface IDailyAnalyticsResponse {
    error?: string;
    blocksDaily?: IBlocksDailyInflux[];
    blockIssuersDaily?: IBlockIssuerDailyInflux[];
    transactionsDaily?: ITransactionsDailyInflux[];
    outputsDaily?: IOutputsDailyInflux[];
    tokensHeldDaily?: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily?: IAddressesWithBalanceDailyInflux[];
    activeAddressesDaily?: IActiveAddressesDailyInflux[];
    tokensTransferredDaily?: ITokensTransferredDailyInflux[];
    anchorActivityDaily?: IAnchorActivityDailyInflux[];
    nftActivityDaily?: INftActivityDailyInflux[];
    accountActivityDaily?: IAccountActivityDailyInflux[];
    foundryActivityDaily?: IFoundryActivityDailyInflux[];
    delegationActivityDaily?: IDelegationActivityDailyInflux[];
    validatorsActivityDaily?: IValidatorsActivityDailyInflux[];
    delegatorsActivityDaily?: IDelegatorsActivityDailyInflux[];
    delegationsActivityDaily?: IDelegationsActivityDailyInflux[];
    stakingActivityDaily?: IStakingActivityDailyInflux[];
    unlockConditionsPerTypeDaily?: IUnlockConditionsPerTypeDailyInflux[];
    tokensHeldWithUnlockConditionDaily?: ITokensHeldWithUnlockConditionDailyInflux[];
    ledgerSizeDaily?: ILedgerSizeDailyInflux[];
    storageDepositDaily?: IStorageDepositDailyInflux[];
    manaBurnedDaily?: IManaBurnedDailyInflux[];
}

/**
 * Get influx cached analytic stats for the requested network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: INetworkBoundGetRequest): Promise<IDailyAnalyticsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    const networkConfig = networkService.get(request.network);
    ValidationHelper.oneOf(request.network, networks, "network");

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const influxService = ServiceFactory.get<InfluxServiceNova>(`influxdb-${request.network}`);

    return influxService
        ? {
              blocksDaily: influxService.blocksDaily,
              blockIssuersDaily: influxService.blockIssuersDaily,
              transactionsDaily: influxService.transactionsDaily,
              outputsDaily: influxService.outputsDaily,
              tokensHeldDaily: influxService.tokensHeldDaily,
              addressesWithBalanceDaily: influxService.addressesWithBalanceDaily,
              activeAddressesDaily: influxService.activeAddressesDaily,
              tokensTransferredDaily: influxService.tokensTransferredDaily,
              anchorActivityDaily: influxService.anchorActivityDaily,
              nftActivityDaily: influxService.nftActivityDaily,
              accountActivityDaily: influxService.accountActivityDaily,
              foundryActivityDaily: influxService.foundryActivityDaily,
              delegationActivityDaily: influxService.delegationActivityDaily,
              validatorsActivityDaily: influxService.validatorsActivityDaily,
              delegatorsActivityDaily: influxService.delegatorsActivityDaily,
              delegationsActivityDaily: influxService.delegationsActivityDaily,
              stakingActivityDaily: influxService.stakingActivityDaily,
              unlockConditionsPerTypeDaily: influxService.unlockConditionsPerTypeDaily,
              tokensHeldWithUnlockConditionDaily: influxService.tokensHeldWithUnlockConditionDaily,
              ledgerSizeDaily: influxService.ledgerSizeDaily,
              storageDepositDaily: influxService.storageDepositDaily,
              manaBurnedDaily: influxService.manaBurnedDaily,
          }
        : {
              error: "Influx service not found for this network.",
          };
}
