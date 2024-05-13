import {
    AddressType,
    AliasAddress,
    FeatureType,
    FoundryOutput,
    ImmutableAliasAddressUnlockCondition,
    MetadataFeature,
} from "@iota/sdk-wasm-stardust/web";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { FoundryProps } from "./FoundryProps";
import nativeTokensMessage from "~assets/modals/stardust/address/assets-in-wallet.json";
import foundryMainHeaderInfo from "~assets/modals/stardust/foundry/main-header.json";
import tokenSchemeIRC30 from "~assets/schemas/token-schema-IRC30.json";
import { useFoundryDetails } from "~helpers/stardust/hooks/useFoundryDetails";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { isMarketedNetwork } from "~helpers/networkHelper";
import { Bech32AddressHelper } from "~helpers/stardust/bech32AddressHelper";
import { tryParseMetadata } from "~helpers/stardust/metadataUtils";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { ITokenMetadata } from "~models/api/stardust/foundry/ITokenMetadata";
import FiatValue from "../../components/FiatValue";
import TabbedSection from "../../components/hoc/TabbedSection";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import FeaturesSection from "../../components/stardust/address/section/FeaturesSection";
import AssetsTable from "../../components/stardust/address/section/native-tokens/AssetsTable";
import TokenInfoSection from "../../components/stardust/foundry/TokenInfoSection";
import TruncatedId from "../../components/stardust/TruncatedId";
import NetworkContext from "../../context/NetworkContext";
import "./Foundry.scss";

enum FOUNDRY_PAGE_TABS {
    TokenInfo = "Token Info",
    Features = "Features",
    NativeTokens = "Native Tokens",
}

const Foundry: React.FC<RouteComponentProps<FoundryProps>> = ({
    match: {
        params: { network, foundryId },
    },
}) => {
    const isMounted = useIsMounted();
    const { tokenInfo, bech32Hrp } = useContext(NetworkContext);

    const [isFormattedBalance, setIsFormattedBalance] = useState<boolean>(true);

    const [foundryDetails, isFoundryDetailsLoading, foundryError] = useFoundryDetails(network, foundryId);
    const [foundryOutput, setFoundryOutput] = useState<FoundryOutput>();
    const [controllerAlias, setControllerAlias] = useState<string>();
    const [tokenMetadata, setTokenMetadata] = useState<ITokenMetadata | null>();
    const [tokenCount, setTokenCount] = useState<number>(0);

    useEffect(() => {
        if (foundryDetails) {
            const output = foundryDetails?.output as FoundryOutput;
            const immutableAliasUnlockCondition = output.unlockConditions[0] as ImmutableAliasAddressUnlockCondition;
            const aliasId = (immutableAliasUnlockCondition.address as AliasAddress).aliasId;

            const immutableFeatures = (foundryDetails?.output as FoundryOutput).immutableFeatures;
            const metadataFeature = immutableFeatures?.find((feature) => feature.type === FeatureType.Metadata) as MetadataFeature;

            if (isMounted && metadataFeature) {
                const parsedMetadata = tryParseMetadata<ITokenMetadata>(metadataFeature.data, tokenSchemeIRC30);
                setTokenMetadata(parsedMetadata);
            }
            if (isMounted) {
                setFoundryOutput(output);
                setControllerAlias(aliasId);
            }
        }
    }, [foundryDetails]);

    let foundryContent = null;
    if (foundryDetails && foundryOutput) {
        const isMarketed = isMarketedNetwork(network);
        const serialNumber = foundryOutput.serialNumber;
        const balance = Number(foundryOutput.amount);

        const controllerAliasBech32 = controllerAlias
            ? Bech32AddressHelper.buildAddress(bech32Hrp, controllerAlias, AddressType.Alias)
            : undefined;

        foundryContent = (
            <React.Fragment>
                <div className="section no-border-bottom padding-b-s">
                    <div className="section--header">
                        <div className="row middle">
                            <h2>General</h2>
                        </div>
                    </div>
                    <div className="section--data">
                        <div className="label">Serial number</div>
                        <div className="value code row middle">
                            <span className="margin-r-t">{serialNumber}</span>
                        </div>
                    </div>
                    {controllerAlias && controllerAliasBech32 && (
                        <div className="section--data">
                            <div className="label">Controller Alias</div>
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
                                <div className="label">Balance</div>
                                <div className="value featured">
                                    {balance && (
                                        <React.Fragment>
                                            <span onClick={() => setIsFormattedBalance(!isFormattedBalance)} className="pointer margin-r-5">
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
                            infoContent: nativeTokensMessage,
                        },
                        [FOUNDRY_PAGE_TABS.Features]: {
                            disabled: !foundryOutput.features && !foundryOutput.immutableFeatures,
                        },
                    }}
                >
                    <TokenInfoSection tokenId={foundryId} tokenScheme={foundryOutput.tokenScheme} tokenMetadata={tokenMetadata} />
                    <FeaturesSection output={foundryOutput} />
                    <AssetsTable networkId={network} outputs={[foundryDetails]} setTokenCount={setTokenCount} />
                </TabbedSection>
            </React.Fragment>
        );
    }

    return (
        <div className="foundry">
            <div className="wrapper">
                <div className="inner">
                    <div className="foundry--header">
                        <div className="row middle">
                            <h1>Foundry</h1>
                            <Modal icon="info" data={foundryMainHeaderInfo} />
                            {isFoundryDetailsLoading && <Spinner />}
                        </div>
                    </div>
                    {foundryError ? <NotFound searchTarget="foundry" query={foundryId} /> : foundryContent}
                </div>
            </div>
        </div>
    );
};

export default Foundry;
