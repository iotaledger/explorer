import { IAliasAddress, IFoundryOutput, IImmutableAliasUnlockCondition } from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { ClipboardHelper } from "../../../helpers/clipboardHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import { STARDUST } from "../../../models/db/protocolVersion";
import { StardustTangleCacheService } from "../../../services/stardust/stardustTangleCacheService";
import CopyButton from "../../components/CopyButton";
import FiatValue from "../../components/FiatValue";
import Icon from "../../components/Icon";
import AssetsTable from "../../components/stardust/AssetsTable";
import NetworkContext from "../../context/NetworkContext";
import { FoundryProps } from "./FoundryProps";
import "./Foundry.scss";

const Foundry: React.FC<RouteComponentProps<FoundryProps>> = ({ match: { params: { network, outputId } } }) => {
    const { tokenInfo } = useContext(NetworkContext);
    const [output, setOutput] = useState<IFoundryOutput>();
    const [serialNumber, setSerialNumber] = useState<number>();
    const [controllerAlias, setControllerAlias] = useState<string>();
    const [balance, setBalance] = useState<number>();
    const [tokenScheme, setTokenScheme] = useState<number>();
    const [maximumSupply, setMaximumSupply] = useState<number>();
    const [mintedTokens, setMintedTokens] = useState<number>();
    const [meltedTokens, setMeltedTokens] = useState<number>();

    useEffect(() => {
        const tangleCacheService = ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`);
        tangleCacheService.outputDetails(network, outputId).then(outputDetails => {
            const foundryOutput = outputDetails?.output as IFoundryOutput;
            const immutableAliasUnlockCondition = (foundryOutput.unlockConditions[0] as IImmutableAliasUnlockCondition);
            const aliasId = (immutableAliasUnlockCondition.address as IAliasAddress).aliasId;

            setOutput(foundryOutput);
            setSerialNumber(foundryOutput.serialNumber);
            setControllerAlias(aliasId);
            setBalance(Number(foundryOutput.amount));
            setTokenScheme(foundryOutput.tokenScheme.type);
            setMaximumSupply(Number(foundryOutput.tokenScheme.maximumSupply));
            setMintedTokens(Number(foundryOutput.tokenScheme.mintedTokens));
            setMeltedTokens(Number(foundryOutput.tokenScheme.meltedTokens));
        })
        .catch(_ => {});
    }, []);

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
                                    labelPosition="top"
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
                                                {formatAmount(balance, tokenInfo, true)}
                                                {" "}
                                                <span>(</span>
                                                <FiatValue value={balance} />
                                                <span>)</span>
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

                        {output && (
                            <AssetsTable networkId={network} outputs={[output]} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Foundry;
