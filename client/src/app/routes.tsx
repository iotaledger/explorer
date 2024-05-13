/* eslint-disable react/jsx-first-prop-new-line */
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { AddressRouteProps } from "./routes/AddressRouteProps";
import ChrysalisAddress from "./routes/chrysalis/Addr";
import ChrysalisIndexed from "./routes/chrysalis/Indexed";
import { IndexedRouteProps as ChrysalisIndexedRouteProps } from "./routes/chrysalis/IndexedRouteProps";
import ChrysalisLanding from "./routes/chrysalis/Landing";
import ChrysalisMessage from "./routes/chrysalis/Message";
import { MessageProps as ChrysalisMessageProps } from "./routes/chrysalis/MessageProps";
import ChrysalisSearch from "./routes/chrysalis/Search";
import ChrysalisVisualizer from "./routes/chrysalis/Visualizer";
import IdentityResolver from "./routes/IdentityResolver";
import { IdentityResolverProps } from "./routes/IdentityResolverProps";
import { LandingRouteProps } from "./routes/LandingRouteProps";
import LegacyAddress from "./routes/legacy/Address";
import { AddressRouteProps as LegacyAddressRouteProps } from "./routes/legacy/AddressRouteProps";
import LegacyBundle from "./routes/legacy/Bundle";
import { BundleRouteProps as LegacyBundleRouteProps } from "./routes/legacy/BundleRouteProps";
import LegacyLanding from "./routes/legacy/Landing";
import LegacySearch from "./routes/legacy/Search";
import LegacyTag from "./routes/legacy/Tag";
import { TagRouteProps as LegacyTagRouteProps } from "./routes/legacy/TagRouteProps";
import LegacyTransaction from "./routes/legacy/Transaction";
import { TransactionRouteProps as LegacyTransactionRouteProps } from "./routes/legacy/TransactionRouteProps";
import LegacyVisualizer from "./routes/legacy/Visualizer";
import { SearchRouteProps } from "./routes/SearchRouteProps";
import StardustAddressPage from "./routes/stardust/AddressPage";
import NovaAddressPage from "./routes/nova/AddressPage";
import StardustBlock from "./routes/stardust/Block";
import StardustFoundry from "./routes/stardust/Foundry";
import { Landing as StardustLanding } from "./routes/stardust/landing/Landing";
import NovaLanding from "./routes/nova/landing/Landing";
import NftRedirectRouteStardust from "./routes/stardust/NftRedirectRoute";
import NftRedirectRouteNova from "./routes/nova/NftRedirectRoute";
import StardustOutputList from "./routes/stardust/OutputList";
import StardustOutputPage from "./routes/stardust/OutputPage";
import NovaBlockPage from "./routes/nova/Block";
import NovaTransactionPage from "./routes/nova/TransactionPage";
import NovaOutputPage from "./routes/nova/OutputPage";
import NovaOutputsPage from "./routes/nova/OutputsPage";
import NovaFoundryPage from "./routes/nova/FoundryPage";
import NovaSearch from "./routes/nova/Search";
import NovaEpochPage from "./routes/nova/EpochPage";
import NovaSlotPage from "./routes/nova/SlotPage";
import StardustSearch from "./routes/stardust/Search";
import StardustStatisticsPage from "./routes/stardust/statistics/StatisticsPage";
import NovaStatisticsPage from "./routes/nova/statistics/StatisticsPage";
import StardustTransactionPage from "./routes/stardust/TransactionPage";
import { Visualizer as StardustVisualizer } from "./routes/stardust/Visualizer";
import Visualizer from "./routes/nova/Visualizer";
import StreamsV0 from "./routes/StreamsV0";
import { StreamsV0RouteProps } from "./routes/StreamsV0RouteProps";
import { VisualizerRouteProps } from "./routes/VisualizerRouteProps";
import ValidatorsPage from "./routes/nova/ValidatorsPage";
import { CHRYSALIS, LEGACY, NOVA, STARDUST } from "~models/config/protocolVersion";

/**
 * Generator for keys in routes. Gives an incremented value on every next().
 * @param count The starting value.
 * @yields The next value.
 * @returns The iterator.
 */
function* keyGenerator(count: number): IterableIterator<number> {
    while (true) {
        yield count++;
    }
}

const buildAppRoutes = (protocolVersion: string, withNetworkContext: (wrappedComponent: React.ReactNode) => JSX.Element | null) => {
    const keys = keyGenerator(0);

    const commonRoutes = [
        <Route
            path="/:network/streams/0/:hash?/:mode?/:key?"
            key={keys.next().value}
            component={(props: RouteComponentProps<StreamsV0RouteProps>) => <StreamsV0 {...props} />}
        />,
    ];

    const IdentiyResolverRoute = (
        <Route
            path="/:network/identity-resolver/:did?"
            key={keys.next().value}
            component={(props: RouteComponentProps<IdentityResolverProps>) => (
                <IdentityResolver {...props} protocolVersion={protocolVersion} />
            )}
        />
    );

    if (protocolVersion !== STARDUST) {
        commonRoutes.push(IdentiyResolverRoute);
    }

    const legacyRoutes = [
        <Route
            exact
            path="/:network"
            key={keys.next().value}
            component={(props: RouteComponentProps<LandingRouteProps>) => <LegacyLanding {...props} />}
        />,
        <Route
            path="/:network/visualizer/"
            key={keys.next().value}
            component={(props: RouteComponentProps<VisualizerRouteProps>) => <LegacyVisualizer {...props} />}
        />,
        <Route
            path="/:network/search/:query?"
            key={keys.next().value}
            component={(props: RouteComponentProps<SearchRouteProps>) => <LegacySearch {...props} />}
        />,
        <Route
            path="/:network/address/:address"
            key={keys.next().value}
            component={(props: RouteComponentProps<LegacyAddressRouteProps>) => <LegacyAddress {...props} />}
        />,
        <Route
            path="/:network/transaction/:txHash"
            key={keys.next().value}
            component={(props: RouteComponentProps<LegacyTransactionRouteProps>) => <LegacyTransaction {...props} />}
        />,
        <Route
            path="/:network/tag/:tag"
            key={keys.next().value}
            component={(props: RouteComponentProps<LegacyTagRouteProps>) => <LegacyTag {...props} />}
        />,
        <Route
            path="/:network/bundle/:bundle"
            key={keys.next().value}
            component={(props: RouteComponentProps<LegacyBundleRouteProps>) => <LegacyBundle {...props} />}
        />,
    ];

    const chrysalisRoutes = [
        <Route
            exact
            path="/:network"
            key={keys.next().value}
            component={(props: RouteComponentProps<LandingRouteProps>) => <ChrysalisLanding {...props} />}
        />,
        <Route
            path="/:network/search/:query?"
            key={keys.next().value}
            component={(props: RouteComponentProps<SearchRouteProps>) => <ChrysalisSearch {...props} />}
        />,
        <Route
            path="/:network/visualizer/"
            key={keys.next().value}
            component={(props: RouteComponentProps<VisualizerRouteProps>) => <ChrysalisVisualizer {...props} />}
        />,
        <Route
            path="/:network/message/:messageId"
            key={keys.next().value}
            component={(props: RouteComponentProps<ChrysalisMessageProps>) => <ChrysalisMessage {...props} />}
        />,
        <Route
            path="/:network/addr/:address"
            key={keys.next().value}
            component={(props: RouteComponentProps<AddressRouteProps>) => <ChrysalisAddress {...props} />}
        />,
        <Route
            path="/:network/indexed/:index"
            key={keys.next().value}
            component={(props: RouteComponentProps<ChrysalisIndexedRouteProps>) => <ChrysalisIndexed {...props} />}
        />,
    ];

    const stardustRoutes = [
        <Route exact path="/:network" key={keys.next().value} component={StardustLanding} />,
        <Route path="/:network/visualizer/" key={keys.next().value} component={StardustVisualizer} />,
        <Route path="/:network/search/:query?" key={keys.next().value} component={StardustSearch} />,
        <Route path="/:network/addr/:address" key={keys.next().value} component={StardustAddressPage} />,
        <Route path="/:network/nft/:nftId" key={keys.next().value} component={NftRedirectRouteStardust} />,
        <Route path="/:network/block/:blockId" key={keys.next().value} component={StardustBlock} />,
        <Route path="/:network/transaction/:transactionId" key={keys.next().value} component={StardustTransactionPage} />,
        <Route path="/:network/output/:outputId" key={keys.next().value} component={StardustOutputPage} />,
        <Route path="/:network/outputs" key={keys.next().value} component={StardustOutputList} />,
        <Route path="/:network/foundry/:foundryId" key={keys.next().value} component={StardustFoundry} />,
        <Route path="/:network/statistics" key={keys.next().value} component={StardustStatisticsPage} />,
    ];

    const novaRoutes = [
        <Route exact path="/:network" key={keys.next().value} component={NovaLanding} />,
        <Route path="/:network/addr/:address" key={keys.next().value} component={NovaAddressPage} />,
        <Route path="/:network/visualizer/" key={keys.next().value} component={Visualizer} />,
        <Route path="/:network/block/:blockId" key={keys.next().value} component={NovaBlockPage} />,
        <Route path="/:network/output/:outputId" key={keys.next().value} component={NovaOutputPage} />,
        <Route path="/:network/search/:query?" key={keys.next().value} component={NovaSearch} />,
        <Route path="/:network/slot/:slotIndex" key={keys.next().value} component={NovaSlotPage} />,
        <Route path="/:network/epoch/:epochIndex" key={keys.next().value} component={NovaEpochPage} />,
        <Route path="/:network/transaction/:transactionId" key={keys.next().value} component={NovaTransactionPage} />,
        <Route path="/:network/foundry/:foundryId" key={keys.next().value} component={NovaFoundryPage} />,
        <Route path="/:network/nft/:nftId" key={keys.next().value} component={NftRedirectRouteNova} />,
        <Route path="/:network/statistics" key={keys.next().value} component={NovaStatisticsPage} />,
        <Route path="/:network/validators" key={keys.next().value} component={ValidatorsPage} />,
        <Route path="/:network/outputs" key={keys.next().value} component={NovaOutputsPage} />,
    ];

    return (
        <Switch>
            {commonRoutes}
            {protocolVersion === LEGACY && legacyRoutes}
            {protocolVersion === CHRYSALIS && chrysalisRoutes}
            {protocolVersion === STARDUST && withNetworkContext(stardustRoutes)}
            {protocolVersion === NOVA && novaRoutes}
        </Switch>
    );
};

export default buildAppRoutes;
