/* eslint-disable react/jsx-first-prop-new-line */
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { AddressRouteProps } from "./routes/AddressRouteProps";
import ChrysalisAddress from "./routes/chrysalis/Addr";
import Indexed from "./routes/chrysalis/Indexed";
import { IndexedRouteProps } from "./routes/chrysalis/IndexedRouteProps";
import ChrysalisLanding from "./routes/chrysalis/Landing";
import ChrysalisMessage from "./routes/chrysalis/Message";
import { MessageProps } from "./routes/chrysalis/MessageProps";
import ChrysalisSearch from "./routes/chrysalis/Search";
import ChrysalisVisualizer from "./routes/chrysalis/Visualizer";
import IdentityResolver from "./routes/IdentityResolver";
import { IdentityResolverProps } from "./routes/IdentityResolverProps";
import { LandingRouteProps } from "./routes/LandingRouteProps";
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
import StardustBlock from "./routes/stardust/Block";
import Foundry from "./routes/stardust/Foundry";
import StardustLanding from "./routes/stardust/landing/Landing";
import OutputList from "./routes/stardust/OutputList";
import OutputPage from "./routes/stardust/OutputPage";
import StardustSearch from "./routes/stardust/Search";
import StatisticsPage from "./routes/stardust/statistics/StatisticsPage";
import TransactionPage from "./routes/stardust/TransactionPage";
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
                    protocolVersion={protocolVersion}
                />
            )}
        />
    ];

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
            component={StardustLanding}
        />,
        <Route path="/:network/visualizer/"
            key={keys.next().value}
            component={StardustVisualizer}
        />,
        <Route path="/:network/search/:query?"
            key={keys.next().value}
            component={StardustSearch}
        />,
        <Route path="/:network/addr/:address"
            key={keys.next().value}
            component={StardustAddressPage}
        />,
        <Route path="/:network/block/:blockId"
            key={keys.next().value}
            component={StardustBlock}
        />,
        <Route path="/:network/transaction/:transactionId"
            key={keys.next().value}
            component={TransactionPage}
        />,
        <Route path="/:network/output/:outputId"
            key={keys.next().value}
            component={OutputPage}
        />,
        <Route path="/:network/outputs"
            key={keys.next().value}
            component={OutputList}
        />,
        <Route path="/:network/foundry/:foundryId"
            key={keys.next().value}
            component={Foundry}
        />,
        <Route path="/:network/statistics"
            key={keys.next().value}
            component={StatisticsPage}
        />
    ];

    return (
        <Switch>
            {commonRoutes}
            {
                isStardust ?
                    withNetworkContext(stardustRoutes) :
                    ogAndChrysalisRoutes
            }
        </Switch>
    );
};

export default buildAppRoutes;

