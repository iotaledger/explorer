/* eslint-disable react/jsx-first-prop-new-line */
import React from "react";
import { Route, RouteComponentProps } from "react-router-dom";
import { CHRYSALIS } from "../models/config/protocolVersion";
import { AddressRouteProps } from "./routes/AddressRouteProps";
import { AliasRouteProps } from "./routes/AliasRouteProps";
import ChrysalisAddress from "./routes/chrysalis/Addr";
import Indexed from "./routes/chrysalis/Indexed";
import { IndexedRouteProps } from "./routes/chrysalis/IndexedRouteProps";
import ChrysalisLanding from "./routes/chrysalis/Landing";
import ChrysalisMessage from "./routes/chrysalis/Message";
import { MessageProps } from "./routes/chrysalis/MessageProps";
import ChrysalisSearch from "./routes/chrysalis/Search";
import ChrysalisVisualizer from "./routes/chrysalis/Visualizer";
import CurrencyConverter from "./routes/CurrencyConverter";
import IdentityResolver from "./routes/IdentityResolver";
import { IdentityResolverProps } from "./routes/IdentityResolverProps";
import { LandingRouteProps } from "./routes/LandingRouteProps";
import Markets from "./routes/Markets";
import { NftRouteProps } from "./routes/NftRouteProps";
import Address from "./routes/og/Address";
import { AddressRouteProps as OgAddressRouteProps } from "./routes/og/AddressRouteProps";
import Bundle from "./routes/og/Bundle";
import { BundleRouteProps } from "./routes/og/BundleRouteProps";
import Tag from "./routes/og/Tag";
import { TagRouteProps } from "./routes/og/TagRouteProps";
import Transaction from "./routes/og/Transaction";
import { TransactionRouteProps } from "./routes/og/TransactionRouteProps";
import { SearchRouteProps } from "./routes/SearchRouteProps";
import StardustAddressPage from "./routes/stardust/AddressPage";
import Alias from "./routes/stardust/Alias";
import StardustBlock from "./routes/stardust/Block";
import { BlockProps } from "./routes/stardust/BlockProps";
import Foundry from "./routes/stardust/Foundry";
import { FoundryProps } from "./routes/stardust/FoundryProps";
import StardustLanding from "./routes/stardust/Landing";
import Nft from "./routes/stardust/Nft";
import NftRegistryDetails from "./routes/stardust/NftRegistryDetails";
import { NftRegistryDetailsProps } from "./routes/stardust/NftRegistryDetailsProps";
import OutputList from "./routes/stardust/OutputList";
import OutputListProps from "./routes/stardust/OutputListProps";
import OutputPage from "./routes/stardust/OutputPage";
import OutputPageProps from "./routes/stardust/OutputPageProps";
import StardustSearch from "./routes/stardust/Search";
import Statistic from "./routes/stardust/Statistic";
import TransactionPage from "./routes/stardust/TransactionPage";
import { TransactionPageProps } from "./routes/stardust/TransactionPageProps";
import StardustVisualizer from "./routes/stardust/Visualizer";
import StreamsV0 from "./routes/StreamsV0";
import { StreamsV0RouteProps } from "./routes/StreamsV0RouteProps";
import { VisualizerRouteProps } from "./routes/VisualizerRouteProps";

/**
 * Generator for keys in routes. Gives an incremented value on every next().
 * @param count The starting value.
 * @yields The next value.
 * @returns The iterator.
 */
function *keyGenerator(count: number): IterableIterator<number> {
    while (true) {
        yield count++;
    }
}

const buildAppRoutes = (
    isStardust: boolean,
    isMarketed: boolean,
    protocolVersion: string,
    withNetworkContext: (wrappedComponent: React.ReactNode) => JSX.Element | null
) => {
    const keys = keyGenerator(0);

    const commonRoutes = [
        <Route path="/:network/streams/0/:hash?/:mode?/:key?"
            key={keys.next().value}
            component={(props: RouteComponentProps<StreamsV0RouteProps>) => (
                <StreamsV0 {...props} />
            )}
        />,
        <Route path="/:network/identity-resolver/:did?"
            key={keys.next().value}
            component={(props: RouteComponentProps<IdentityResolverProps>) => (
                <IdentityResolver {...props}
                    isSupported={protocolVersion === CHRYSALIS}
                />
            )}
        />
    ];

    if (isMarketed) {
        commonRoutes.push(
            <Route path="/:network/markets" component={Markets} key={keys.next().value} />
        );
        commonRoutes.push(
            <Route path="/:network/currency-converter" component={CurrencyConverter} key={keys.next().value} />
        );
    }

    const ogAndChrysalisRoutes = [
        <Route exact path="/:network"
            key={keys.next().value}
            component={(props: RouteComponentProps<LandingRouteProps>) => (
                <ChrysalisLanding {...props} />
            )}
        />,
        <Route path="/:network/visualizer/"
            key={keys.next().value}
            component={(props: RouteComponentProps<VisualizerRouteProps>) => (
                <ChrysalisVisualizer {...props} />
            )}
        />,
        <Route path="/:network/search/:query?"
            key={keys.next().value}
            component={(props: RouteComponentProps<SearchRouteProps>) => (
                <ChrysalisSearch {...props} />
            )}
        />,
        <Route path="/:network/addr/:address"
            key={keys.next().value}
            component={(props: RouteComponentProps<AddressRouteProps>) => (
                <ChrysalisAddress {...props} />
            )}
        />,
        <Route path="/:network/address/:hash"
            key={keys.next().value}
            component={(props: RouteComponentProps<OgAddressRouteProps>) => (
                <Address {...props} />
            )}
        />,
        <Route path="/:network/message/:messageId"
            key={keys.next().value}
            component={(props: RouteComponentProps<MessageProps>) => (
                <ChrysalisMessage {...props} />
            )}
        />,
        <Route path="/:network/indexed/:index"
            key={keys.next().value}
            component={(props: RouteComponentProps<IndexedRouteProps>) => (
                <Indexed {...props} />
            )}
        />,
        <Route path="/:network/transaction/:hash"
            key={keys.next().value}
            component={(props: RouteComponentProps<TransactionRouteProps>) => (
                <Transaction {...props} />
            )}
        />,
        <Route path="/:network/tag/:hash"
            key={keys.next().value}
            component={(props: RouteComponentProps<TagRouteProps>) => (
                <Tag {...props} />
            )}
        />,
        <Route path="/:network/bundle/:hash"
            key={keys.next().value}
            component={(props: RouteComponentProps<BundleRouteProps>) => (
                <Bundle {...props} />
            )}
        />
    ];

    const stardustRoutes = [
        <Route exact path="/:network"
            key={keys.next().value}
            component={(props: RouteComponentProps<LandingRouteProps>) => (
                withNetworkContext(<StardustLanding {...props} />)
            )}
        />,
        <Route path="/:network/visualizer/"
            key={keys.next().value}
            component={(props: RouteComponentProps<VisualizerRouteProps>) => (
                withNetworkContext(<StardustVisualizer {...props} />)
            )}
        />,
        <Route path="/:network/search/:query?"
            key={keys.next().value}
            component={(props: RouteComponentProps<SearchRouteProps>) => (
                withNetworkContext(<StardustSearch {...props} />)
            )}
        />,
        <Route path="/:network/addr/:address"
            key={keys.next().value}
            component={(props: RouteComponentProps<AddressRouteProps>) => (
                withNetworkContext(<StardustAddressPage {...props} />)
            )}
        />,
        <Route path="/:network/block/:blockId"
            key={keys.next().value}
            component={(props: RouteComponentProps<BlockProps>) => (
                withNetworkContext(<StardustBlock {...props} />)
            )}
        />,
        <Route path="/:network/transaction/:transactionId"
            key={keys.next().value}
            component={(props: RouteComponentProps<TransactionPageProps>) => (
                withNetworkContext(<TransactionPage {...props} />)
            )}
        />,
        <Route path="/:network/output/:outputId"
            key={keys.next().value}
            component={(props: RouteComponentProps<OutputPageProps>) => (
                withNetworkContext(<OutputPage {...props} />)
            )}
        />,
        <Route path="/:network/outputs"
            key={keys.next().value}
            component={(props: RouteComponentProps<OutputListProps>) => (
                withNetworkContext(<OutputList {...props} />)
            )}
        />,
        <Route path="/:network/foundry/:foundryId"
            key={keys.next().value}
            component={(props: RouteComponentProps<FoundryProps>) => (
                withNetworkContext(<Foundry {...props} />)
            )}
        />,
        <Route path="/:network/nft-registry/:nftId"
            key={keys.next().value}
            component={(props: RouteComponentProps<NftRegistryDetailsProps>) => (
                <NftRegistryDetails {...props} />
            )}
        />,
        <Route path="/:network/alias/:aliasAddress"
            key={keys.next().value}
            component={(props: RouteComponentProps<AliasRouteProps>) => (
                withNetworkContext(<Alias {...props} />)
            )}
        />,
        <Route path="/:network/nft/:nftAddress"
            key={keys.next().value}
            component={(props: RouteComponentProps<NftRouteProps>) => (
                withNetworkContext(<Nft {...props} />)
            )}
        />,
        <Route path="/:network/statistics"
            component={Statistic} 
            key={keys.next().value} 
        />
    ];

    const routes: JSX.Element[] = [];
    routes.push(...commonRoutes);

    if (isStardust) {
        routes.push(...stardustRoutes);
    } else {
        routes.push(...ogAndChrysalisRoutes);
    }

    return routes;
};

export default buildAppRoutes;

