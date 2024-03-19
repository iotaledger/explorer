export interface IBaseNavigationRoute {
    label: string;
    disabled?: boolean;
}

export interface IRoute extends IBaseNavigationRoute {
    url: string;
    isExternal?: boolean;
}

export interface IDropdownRoute extends IBaseNavigationRoute {
    routes: IRoute[];
}

export type NavigationRoute = IRoute | IDropdownRoute;
