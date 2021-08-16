import classNames from "classnames";
import React, { ReactNode } from "react";
import AsyncComponent from "../AsyncComponent";
import "./IdentitySearchInput.scss";
import { IdentitySearchInputProps } from "./IdentitySearchInputProps";
import { IdentitySearchInputState } from "./IdentitySearchInputState";

/**
 * Component which will show the search input page.
 */
class SearchInput extends AsyncComponent<IdentitySearchInputProps, IdentitySearchInputState> {
    /**
     * Create a new instance of SearchInput.
     * @param props The props.
     */
    constructor(props: IdentitySearchInputProps) {
        super(props);

        this.state = {
            query: "",
            isValid: false,
            networkMismatch: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="identity-search-input">
                <div>
                    <input
                        className="identity-search--text-input"
                        type="text"
                        value={this.state.query}
                        onChange={(e) =>
                            this.setState({
                                query: e.target.value,
                                isValid: this.isValid(e.target.value),
                                networkMismatch: this.didContainsWrongNetwork(e.target.value, this.props.network)
                            })
                        }
                    />

                    <button
                        className="identity-search--button"
                        type="submit"
                        onClick={() => this.doSearch()}
                        disabled={!this.state.isValid}
                    >
                        Search
                    </button>
                </div>
                {this.state.networkMismatch && <p>Selected Network does not match DID Network</p>}
            </div>
        );
    }

    /**
     * Is the query valid.
     * @param query The query to check.
     * @returns True if the query is valid.
     */
    private isValid(query?: string): boolean {
        if (!query) {
            return false;
        }

        if (!query.startsWith("did:iota:")) {
            return false;
        }

        return true;
    }

    /**
     * Perform the search.
     */
    private doSearch(): void {
        this.props.onSearch(this.state.query);
    }

    private didContainsWrongNetwork(did: string, network: string): boolean {
        const colonCountInDid = did.split(":").length - 1;

        if (colonCountInDid !== 3) {
            return false;
        }

        const networkNameInDid = did.split(":")[2];

        if (networkNameInDid !== network) {
            return true;
        }
        return false;
    }
}

export default SearchInput;
