import React from "react";
import { BlockIssuerFeature, CongestionResponse, Ed25519PublicKeyHashBlockIssuerKey } from "@iota/sdk-wasm-nova/web";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { formatAmount } from "~/helpers/stardust/valueFormatHelper";
import "./AccountBlockIssuanceSection.scss";
import { CardInfo, CardInfoProps } from "~/app/components/CardInfo";

interface AccountBlockIssuanceSectionProps {
    readonly blockIssuerFeature: BlockIssuerFeature | null;
    readonly congestion: CongestionResponse | null;
}

const AccountBlockIssuanceSection: React.FC<AccountBlockIssuanceSectionProps> = ({ blockIssuerFeature, congestion }) => {
    const { manaInfo } = useNetworkInfoNova((s) => s.networkInfo);
    const [formatFull, setFormatFull] = React.useState(false);

    const congestionData: CardInfoProps[] = [
        { title: "Estimate for slot", value: congestion?.slot },
        { title: "Ready?", value: congestion?.ready ? "Yes" : "No" },
        {
            title: "Block Issuance Credit",
            value: formatAmount(congestion?.blockIssuanceCredits ?? "0", manaInfo, formatFull),
            onClickValue: () => setFormatFull(!formatFull),
            copyValue: congestion?.blockIssuanceCredits ? String(congestion?.blockIssuanceCredits) : undefined,
        },
        {
            title: "Referenced Mana Cost",
            value: formatAmount(congestion?.referenceManaCost ?? "0", manaInfo, formatFull),
            onClickValue: () => setFormatFull(!formatFull),
            copyValue: congestion?.referenceManaCost ? String(congestion?.referenceManaCost) : undefined,
        },
    ];
    return (
        <div className="section section--block-issuance">
            <div className="card-info-wrapper">
                {congestion &&
                    congestionData.map((data, index) => {
                        return (
                            <CardInfo
                                key={index}
                                title={data.title}
                                value={data.value}
                                onClickValue={data.onClickValue}
                                copyValue={data.copyValue}
                            />
                        );
                    })}
                {blockIssuerFeature && <CardInfo title="Expiry Slot" value={blockIssuerFeature.expirySlot} />}
            </div>
            {blockIssuerFeature?.blockIssuerKeys.map((key) => (
                <div className="section--data margin-t-m" key={(key as Ed25519PublicKeyHashBlockIssuerKey).pubKeyHash}>
                    <div className="label">Public Key</div>
                    <div className="value code">
                        <TruncatedId id={(key as Ed25519PublicKeyHashBlockIssuerKey).pubKeyHash} showCopyButton />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AccountBlockIssuanceSection;
