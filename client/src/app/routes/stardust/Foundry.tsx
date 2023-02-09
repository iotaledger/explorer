import { ALIAS_ADDRESS_TYPE, IAliasAddress, IFoundryOutput, IImmutableAliasUnlockCondition } from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import PromiseMonitor, { PromiseStatus } from "../../../helpers/promise/promiseMonitor";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import Icon from "../../components/Icon";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import AssetsTable from "../../components/stardust/AssetsTable";
import FeaturesSection from "../../components/stardust/FeaturesSection";
import NetworkContext from "../../context/NetworkContext";
import { FoundryProps } from "./FoundryProps";
import "./Foundry.scss";

const Foundry: React.FC<RouteComponentProps<FoundryProps>> = (
    { match: { params: { network, foundryId } } }
) => {
    const isMounted = useIsMounted();
    const { tokenInfo, bech32Hrp } = useContext(NetworkContext);
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [isFormattedBalance, setIsFormattedBalance] = useState<boolean>(true);
    const [jobToStatus, setJobToStatus] = useState(
        new Map<string, PromiseStatus>().set("loadFoundryDetails", PromiseStatus.PENDING)
    );
    const [foundryOutput, setFoundryOutput] = useState<IFoundryOutput>();
    const [foundryError, setFoundryError] = useState<string | undefined>();
    const [controllerAlias, setControllerAlias] = useState<string>();

    useEffect(() => {
        const foundryLoadMonitor = new PromiseMonitor(status => {
            setJobToStatus(jobToStatus.set("loadFoundryDetails", status));
        });

        const loadFoundryDetails = async (): Promise<void> => {
            // eslint-disable-next-line no-void
            void foundryLoadMonitor.enqueue(
                async () => tangleCacheService.foundryDetails({ network, foundryId }).then(
                    response => {
                        if (!response.error) {
                            const theFoundryOutput = response.foundryDetails?.output as IFoundryOutput;
                            const immutableAliasUnlockCondition =
                                theFoundryOutput.unlockConditions[0] as IImmutableAliasUnlockCondition;
                            const aliasId = (immutableAliasUnlockCondition.address as IAliasAddress).aliasId;

                            if (isMounted) {
                                setFoundryOutput(theFoundryOutput);
                                setControllerAlias(aliasId);
                            }
                        } else if (isMounted) {
                            setFoundryError(response.error);
                        }
                    }).catch(_ => { })
            );
        };

        // eslint-disable-next-line no-void
        void loadFoundryDetails();
    }, []);


    if (foundryError) {
        return (
            <div className="foundry">
                <div className="wrapper">
                    <div className="inner">
                        <div className="foundry--header">
                            <div className="row middle">
                                <h1>
                                    Foundry
                                </h1>
                            </div>
                        </div>
                        <NotFound
                            searchTarget="foundry"
                            query={foundryId}
                        />
                    </div>
                </div>
            </div>
        );
    }

    let foundryContent = null;
    if (foundryOutput) {
        const isMarketed = isMarketedNetwork(network);
        const serialNumber = foundryOutput.serialNumber;
        const balance = Number(foundryOutput.amount);
        const tokenScheme = foundryOutput.tokenScheme.type;
        const maximumSupply = Number(foundryOutput.tokenScheme.maximumSupply);
        const mintedTokens = Number(foundryOutput.tokenScheme.mintedTokens);
        const meltedTokens = Number(foundryOutput.tokenScheme.meltedTokens);

        const controllerAliasBech32 = controllerAlias ?
            Bech32AddressHelper.buildAddress(bech32Hrp, controllerAlias, ALIAS_ADDRESS_TYPE) :
            undefined;

        foundryContent = (
            <React.Fragment>
                <div className="section">
                    <div className="section--header row row--tablet-responsive middle space-between">
                        <div className="row middle">
                            <h2>General</h2>
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">
                            Serial number
                        </div>
                        <div className="value code row middle">
                            <span className="margin-r-t">
                                {serialNumber}
                            </span>
                        </div>
                    </div>
                    {controllerAlias && controllerAliasBech32 && (
                        <div className="section--data">
                            <div className="label">
                                Controller Alias
                            </div>
                            <div className="value code row middle highlight">
                                <Link to={`/${network}/addr/${controllerAliasBech32.bech32}`} className="margin-r-t">
                                    {controllerAlias}
                                </Link>
                                <CopyButton copy={controllerAlias} />
                            </div>
                        </div>
                    )}
                    <div className="section--data">
                        <div className="row middle">
                            <Icon icon="wallet" boxed />
                            <div className="balance">
                                <div className="label">
                                    Balance
                                </div>
                                <div className="value featured">
                                    {balance && (
                                        <React.Fragment>
                                            <span
                                                onClick={() => setIsFormattedBalance(!isFormattedBalance)}
                                                className="pointer margin-r-5"
                                            >
                                                {formatAmount(balance, tokenInfo, !isFormattedBalance)}
                                            </span>
                                            {isMarketed && (
                                                <React.Fragment>
                                                    {" "}
                                                    <span>(</span>
                                                    <FiatValue value={balance} />
                                                    <span>)</span>
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section">
                    <div className="section--header row row--tablet-responsive middle space-between">
                        <div className="row middle">
                            <h2>Token Info</h2>
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">
                            Token scheme
                        </div>
                        <div className="value code row middle">
                            <span className="margin-r-t">
                                {tokenScheme}
                            </span>
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">
                            Maximum supply
                        </div>
                        <div className="value code row middle">
                            <span className="margin-r-t">
                                {maximumSupply}
                            </span>
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">
                            Minted tokens
                        </div>
                        <div className="value code row middle">
                            <span className="margin-r-t">
                                {mintedTokens}
                            </span>
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">
                            Melted tokens
                        </div>
                        <div className="value code row middle">
                            <span className="margin-r-t">
                                {meltedTokens}
                            </span>
                        </div>
                    </div>
                    {foundryOutput && (
                        <AssetsTable networkId={network} outputs={[foundryOutput]} />
                    )}
                </div>
                <FeaturesSection output={foundryOutput} />
            </React.Fragment>
        );
    }

    const isLoading = Array.from(jobToStatus.values()).some(status => status !== PromiseStatus.DONE);

    return (
        <div className="foundry">
            <div className="wrapper">
                <div className="inner">
                    <div className="foundry--header">
                        <div className="row middle">
                            <h1>
                                Foundry
                            </h1>
                            {isLoading && <Spinner />}
                        </div>
                    </div>
                    {foundryContent}
                </div>
            </div>
        </div>
    );
};

export default Foundry;

