import {
    FeatureType,
    FoundryOutput,
    MetadataFeature,
    ImmutableAccountAddressUnlockCondition,
    Utils,
    Bech32Address,
} from "@iota/sdk-wasm-nova/web";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import nativeTokensMessage from "~assets/modals/nova/address/native-token.json";
import foundryMainHeaderInfo from "~assets/modals/nova/output/foundries.json";
import tokenSchemeIRC30 from "~assets/schemas/token-schema-IRC30.json";
import { useFoundryDetails } from "~helpers/nova/hooks/useFoundryDetails";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { isMarketedNetwork } from "~helpers/networkHelper";
import { tryParseMetadata } from "~helpers/stardust/metadataUtils";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import { ITokenMetadata } from "~models/api/stardust/foundry/ITokenMetadata";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import Icon from "~/app/components/Icon";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import NotFound from "~/app/components/NotFound";
import Modal from "~/app/components/Modal";
import Spinner from "~/app/components/Spinner";
import AssetsTable from "~/app/components/nova/address/section/native-tokens/AssetsTable";
import FeaturesSection from "~/app/components/nova/address/FeaturesSection";
import FiatValue from "~/app/components/FiatValue";
import TabbedSection from "~/app/components/hoc/TabbedSection";
import TokenInfoSection from "~/app/components/nova/foundry/TokenInfoSection";
import "./FoundryPage.scss";

export interface FoundryPageProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The foundry id to lookup.
     */
    foundryId: string;
}

enum FOUNDRY_PAGE_TABS {
    TokenInfo = "Token Info",
    Features = "Features",
    NativeTokens = "Native Tokens",
}

const FoundryPage: React.FC<RouteComponentProps<FoundryPageProps>> = ({
    match: {
        params: { network, foundryId },
    },
}) => {
    const isMounted = useIsMounted();
    const { tokenInfo, bech32Hrp } = useNetworkInfoNova((s) => s.networkInfo);
    const [isFormattedBalance, setIsFormattedBalance] = useState<boolean>(true);
    const [foundryDetails, isFoundryDetailsLoading, foundryError] = useFoundryDetails(network, foundryId);
    const [foundryOutput, setFoundryOutput] = useState<FoundryOutput>();
    const [controllerAccountBech32, setControllerAccountBech32] = useState<Bech32Address>();
    const [tokenMetadata, setTokenMetadata] = useState<ITokenMetadata | null>();
    const [tokensCount, setTokensCount] = useState<number>(0);

    useEffect(() => {
        if (foundryDetails) {
            const output = foundryDetails?.output as FoundryOutput;
            const immutableAccountUnlockCondition = output.unlockConditions[0] as ImmutableAccountAddressUnlockCondition;
            const bech32 = Utils.addressToBech32(immutableAccountUnlockCondition.address, bech32Hrp);

            const immutableFeatures = (foundryDetails?.output as FoundryOutput).immutableFeatures;
            const metadataFeature = immutableFeatures?.find((feature) => feature.type === FeatureType.Metadata) as MetadataFeature;

            if (isMounted && metadataFeature) {
                const parsedMetadata = tryParseMetadata<ITokenMetadata>(
                    metadataFeature.entries[Object.keys(metadataFeature.entries)[0]],
                    tokenSchemeIRC30,
                );
                setTokenMetadata(parsedMetadata);
            }

            if (isMounted) {
                setFoundryOutput(output);
                setControllerAccountBech32(bech32);
            }
        }
    }, [foundryDetails]);

    let foundryContent = null;
    if (foundryDetails && foundryOutput) {
        const isMarketed = isMarketedNetwork(network);
        const serialNumber = foundryOutput.serialNumber;
        const balance = Number(foundryOutput.amount);

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
                    {controllerAccountBech32 && (
                        <div className="section--data">
                            <div className="label">Controller Account</div>
                            <div className="value code highlight">
                                <TruncatedId
                                    id={controllerAccountBech32}
                                    link={`/${network}/addr/${controllerAccountBech32}`}
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
                            disabled: tokensCount === 0,
                            counter: tokensCount,
                            infoContent: nativeTokensMessage,
                        },
                        [FOUNDRY_PAGE_TABS.Features]: {
                            disabled: !foundryOutput.features && !foundryOutput.immutableFeatures,
                        },
                    }}
                >
                    <TokenInfoSection tokenId={foundryId} tokenScheme={foundryOutput.tokenScheme} tokenMetadata={tokenMetadata} />
                    <FeaturesSection output={foundryOutput} />
                    <AssetsTable outputs={[foundryDetails]} setTokensCount={setTokensCount} />
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

export default FoundryPage;
