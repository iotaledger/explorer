import { IAliasAddress, IFoundryOutput, IImmutableAliasUnlockCondition } from "@iota/iota.js-stardust";
import { optional } from "@ruffy/ts-optional/dist/Optional";
import React, { useContext, useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import Icon from "../../components/Icon";
import AssetsTable from "../../components/stardust/AssetsTable";
import Feature from "../../components/stardust/Feature";
import NetworkContext from "../../context/NetworkContext";
import { FoundryProps } from "./FoundryProps";
import "./Foundry.scss";

const Foundry: React.FC<RouteComponentProps<FoundryProps>> = (
    { history, match: { params: { network, foundryId } } }
) => {
    const isMounted = useRef(false);
    const { tokenInfo } = useContext(NetworkContext);
    const [foundryOutput, setFoundryOutput] = useState<IFoundryOutput>();
    const [controllerAlias, setControllerAlias] = useState<string>();
    const [isFormattedBalance, setIsFormattedBalance] = useState<boolean>(true);

    useEffect(() => {
        isMounted.current = true;
        const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
        tangleCacheService.foundryDetails({ network, foundryId }).then(response => {
            if (response) {
                const theFoundryOutput = response.foundryDetails?.output as IFoundryOutput;
                const immutableAliasUnlockCondition =
                    theFoundryOutput.unlockConditions[0] as IImmutableAliasUnlockCondition;
                const aliasId = (immutableAliasUnlockCondition.address as IAliasAddress).aliasId;

                if (isMounted.current) {
                    setFoundryOutput(theFoundryOutput);
                    setControllerAlias(aliasId);
                }
            } else {
                history.replace(`/${network}/search/${foundryId}`);
            }
        })
        .catch(_ => {});

        return () => {
            isMounted.current = false;
        };
    }, []);

    const isMarketed = isMarketedNetwork(network);

    if (!foundryOutput) {
        return null;
    }

    const serialNumber = foundryOutput.serialNumber;
    const balance = Number(foundryOutput.amount);
    const tokenScheme = foundryOutput.tokenScheme.type;
    const maximumSupply = Number(foundryOutput.tokenScheme.maximumSupply);
    const mintedTokens = Number(foundryOutput.tokenScheme.mintedTokens);
    const meltedTokens = Number(foundryOutput.tokenScheme.meltedTokens);

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

                        <div className="section--data">
                            <div className="label">
                                Controller Alias
                            </div>
                            <div className="value code row middle">
                                <span className="margin-r-t">
                                    {controllerAlias}
                                </span>
                                <CopyButton
                                    buttonType="copy"
                                    onClick={() => ClipboardHelper.copy(controllerAlias)}
                                />
                            </div>
                        </div>

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

                    {optional(foundryOutput.features).nonEmpty() && (
                        <div className="section">
                            <div className="section--header row row--tablet-responsive middle space-between">
                                <div className="row middle">
                                    <h2>Features</h2>
                                </div>
                            </div>
                            {foundryOutput.features?.map((feature, idx) => (
                                <Feature key={idx} feature={feature} isPreExpanded={true} isImmutable={false} />
                            ))}
                        </div>
                    )}

                    {optional(foundryOutput.immutableFeatures).nonEmpty() && (
                        <div className="section">
                            <div className="section--header row row--tablet-responsive middle space-between">
                                <div className="row middle">
                                    <h2>Immutable features</h2>
                                </div>
                            </div>
                            {foundryOutput.immutableFeatures?.map((feature, idx) => (
                                <Feature key={idx} feature={feature} isPreExpanded={true} isImmutable={true} />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Foundry;

