import React from "react";
import { IRoute } from "~/app/lib/interfaces";
import { Link } from "react-router-dom";

type InternalRouteProps = React.ComponentPropsWithoutRef<typeof Link>;
type ExternalRouteProps = React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

type Route = (InternalRouteProps | ExternalRouteProps) & { route: IRoute };

export default function NavigationRouteHelper({ children, route, ...linkProps }: React.PropsWithChildren<Route>) {
    if (route.isExternal) {
        const externalProps: ExternalRouteProps = { ...linkProps, href: route.url, target: "_blank", rel: "noopener noreferrer" };
        return <a {...externalProps}>{children}</a>;
    } else {
        const internalProps: InternalRouteProps = { ...linkProps, to: route.url };
        return <Link {...internalProps}>{children}</Link>;
    }
}
