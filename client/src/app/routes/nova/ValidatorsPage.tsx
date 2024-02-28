import React from "react";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import { useValidators } from "~/helpers/nova/hooks/useValidators";
import "./ValidatorsPage.scss";

const validators = [
    {
        address: "rms1pqltlgheluyq6rk9mug5d8c0y3amtu4wjdu00vehnwyleasr0g5979zqg3z",
        stakingEndEpoch: 4294967295,
        poolStake: "909638544",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pppqneg2cgk9zr94pq42a9x6vm500ps2cjm37ew3rztcalz03d9y7tp9qsk",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1ppyxarw2z2t72uhj5qk2p7aq0lplr3kwqqml7ta53grwly9pd92uvyd006v",
        stakingEndEpoch: 4294967295,
        poolStake: "4881898",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pp9cuc3842lzg9m2zmh2v0nrz5ajghv86se5296gs3hqx983g87v2fy92wt",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1ppf8u7y7azdjpl7pvwfk7zlm6aj7zla8p6sn4mx3tm3atm600ragzxfzf7d",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1ppv0tgwark2w4yljl8k0ktxw79x9r69dk3z8hjmxd08zcexuyfwlqzraqel",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1ppspph38hhe8ahxv4m8u7tkeucss8yjf6cs23wpqm4dsrjvg0harx2jg0h9",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pp3ccy0u2elawuxp3fx53nff7q4wem8a4nk8wla5kqkevfsxgk9gju8fs3v",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1ppkpgfmxny9eguculpzzgjjjwap9s8aqq36t6xmukma5gu8dc67q5wv4d53",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1ppcdudrtpv4l48qj2tgncdy2dpu9nzhls5a08y6h35ehr7jy3gu2udnz2yt",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1ppeperemlk3as2qjcr2kymjr9zskpkcvcuyqgle2fvgnqrtldw3tqzycedd",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1ppm2m9d55fwv6xnaua50vupuk5vkg3tzhas8zxerrfr6u8ftzmejzsl3gja",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pplanc63fdccrew99f0x0ncrqnug83q2pyesm9umn52nqe66atj6jes4gzj",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pzp3zcgyvpkuy59ltwrm7e36rymyr9mutzg9nap5r0ctw5w7zjluqndfwt4",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pzttmad6l6d0g38xpgfpuafm6h3l0xp3s05wae46q4l4v5zpfywpg55ka2j",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pzwu47n4tcz9sc064tmd8ju9tp6e5wrgmrckeetgjf65jjzwtph5x70lzee",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pz50kd9fp7d44t4lsfyqscjhk3pylu5f0y3jexgj6u2qrc4mur8mzr5pxjq",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pzkvnshkrkjx4n4grchsythcdlu4m9q6p0ps0ktxanc3erd2mzjy52ce6ee",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1prgqnlcg5j9tzll5mllntz4ja6zz83psellpj32nd7mcsw22hsurvt2896j",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pr0l9sjmhj8g52ynu0j4ppwerx38tvq0a8xtfd0f9gl7uva6x9x9u33qpvh",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1prckf429zjrss6xr4jm57p77da2t4yl5ex6wq085yrprk9ezuvlvcuaszeu",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
    {
        address: "rms1pr79zjkh0gku4q6mj0tfkg223lpygql5ft07mfjjq5k4dkn973a9gs6823k",
        stakingEndEpoch: 4294967295,
        poolStake: "44200",
        validatorStake: "44200",
        fixedCost: "1",
        active: true,
        latestSupportedProtocolVersion: 3,
        latestSupportedProtocolHash: "0x546a6f78619ba470581867e782e4a4194a1f28d3566588e77bb1e13dddb81a65",
    },
];

const ValidatorsPage: React.FC = () => {
    // const { validators } = useValidators();

    return (
        <section className="validators-page">
            <div className="wrapper">
                <div className="inner">
                    <div className="validators-page__header">
                        <div className="header__title row middle">
                            <h1>Validators</h1>
                        </div>
                    </div>

                    <div className="all-validators__section">
                        <h2 className="all-validators__header">All Validators</h2>
                        <div className="all-validators__wrapper">
                            <div className="validator-item table-header">
                                <div className="validator-item__address">Address</div>
                                <div className="validator-item__state">Active?</div>
                                <div className="validator-item__fixed-cost">Cost</div>
                                <div className="validator-item__pool-stake">Pool stake</div>
                                <div className="validator-item__validator-stake">Validator stake</div>
                                <div className="validator-item__delegators">Delegators</div>
                                <div className="validator-item__staking-end-epoch">End epoch</div>
                            </div>
                            {validators.map((validator, idx) => {
                                return (
                                    <div className="validator-item" key={`validator-${idx}`}>
                                        <div className="validator-item__address">
                                            <TruncatedId id={validator.address} />
                                        </div>
                                        <div className="validator-item__state">{validator.active.toString()}</div>
                                        <div className="validator-item__fixed-cost">{validator.fixedCost}</div>
                                        <div className="validator-item__pool-stake">{validator.poolStake}</div>
                                        <div className="validator-item__validator-stake">{validator.validatorStake}</div>
                                        <div className="validator-item__delegators">123</div>
                                        <div className="validator-item__staking-end-epoch">{validator.stakingEndEpoch}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ValidatorsPage;
