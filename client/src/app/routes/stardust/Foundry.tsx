import { ALIAS_ADDRESS_TYPE, IAliasAddress, IFoundryOutput, IImmutableAliasUnlockCondition } from "@iota/iota.js-stardust";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import nativeTokensMessage from "../../../assets/modals/stardust/address/assets-in-wallet.json";
import { useFoundryDetails } from "../../../helpers/hooks/useFoundryDetails";
import { useIsMounted } from "../../../helpers/hooks/useIsMounted";
import { isMarketedNetwork } from "../../../helpers/networkHelper";
import { Bech32AddressHelper } from "../../../helpers/stardust/bech32AddressHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import FiatValue from "../../components/FiatValue";
import TabbedSection from "../../components/hoc/TabbedSection";
import Icon from "../../components/Icon";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import AssetsTable from "../../components/stardust/address/section/association/AssetsTable";
import FeaturesSection from "../../components/stardust/address/section/FeaturesSection";
import TruncatedId from "../../components/stardust/TruncatedId";
import NetworkContext from "../../context/NetworkContext";
import { FoundryProps } from "./FoundryProps";
import "./Foundry.scss";

enum FOUNDRY_PAGE_TABS {
    TokenInfo = "Token Info",
    Features = "Features",
    NativeTokens = "Native Tokens"
}

const Foundry: React.FC<RouteComponentProps<FoundryProps>> = (
    { match: { params: { network, foundryId } } }
) => {
    const isMounted = useIsMounted();
    const { tokenInfo, bech32Hrp } = useContext(NetworkContext);

    const [isFormattedBalance, setIsFormattedBalance] = useState<boolean>(true);

    const [foundryDetails, isFoundryDetailsLoading, foundryError] = useFoundryDetails(network, foundryId);
    const [foundryOutput, setFoundryOutput] = useState<IFoundryOutput>();
    const [controllerAlias, setControllerAlias] = useState<string>();
    const [tokenCount, setTokenCount] = useState<number>(0);

    useEffect(() => {
        if (foundryDetails) {
            const output = foundryDetails?.output as IFoundryOutput;
            const immutableAliasUnlockCondition =
                output.unlockConditions[0] as IImmutableAliasUnlockCondition;
            const aliasId = (immutableAliasUnlockCondition.address as IAliasAddress).aliasId;

            if (isMounted) {
                setFoundryOutput(output);
                setControllerAlias(aliasId);
            }
        }
    }, [foundryDetails]);


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
    if (foundryDetails && foundryOutput) {
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
                <div className="section no-border-bottom">
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
                            <div className="value code highlight">
                                <TruncatedId
                                    id={controllerAlias}
                                    link={`/${network}/addr/${controllerAliasBech32.bech32}`}
                                    showCopyButton
                                />
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
                <TabbedSection
                    tabsEnum={FOUNDRY_PAGE_TABS}
                    tabOptions={{
                        [FOUNDRY_PAGE_TABS.NativeTokens]: {
                            disabled: tokenCount === 0,
                            counter: tokenCount,
                            infoContent: nativeTokensMessage
                        },
                        [FOUNDRY_PAGE_TABS.Features]: {
                            disabled: !foundryOutput.features && !foundryOutput.immutableFeatures
                        }
                    }}
                >
                    <div className="section">
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
                    </div >
                    <FeaturesSection output={foundryOutput} />
                    <AssetsTable
                        networkId={network}
                        outputs={[foundryDetails]}
                        setTokenCount={setTokenCount}
                    />
                </TabbedSection>
            </React.Fragment >
        );
    }

    return (
        <div className="foundry">
            <div className="wrapper">
                <div className="inner">
                    <div className="foundry--header">
                        <div className="row middle">
                            <h1>
                                Foundry
                            </h1>
                            {isFoundryDetailsLoading && <Spinner />}
                        </div>
                    </div>
                    {foundryContent}
                </div>
            </div>
        </div>
    );
};

export default Foundry;

