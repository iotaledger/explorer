import { Component } from "react";

/**
 * Base component for component with async requests.
 */
class AsyncComponent<P, S = {}> extends Component<P, S> {
    /**
     * Is the component mounted.
     */
    protected _isMounted?: boolean;

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        this._isMounted = true;
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
        this._isMounted = false;
    }

    /**
     * Set the state if the component is still mounted.
     * @param state The state to set.
     * @param callback The callback for the setState.
     */
    public setState<K extends keyof S>(
        state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
        callback?: () => void
    ): void {
        if (this._isMounted) {
            super.setState(state, callback);
        }
    }
}

export default AsyncComponent;
