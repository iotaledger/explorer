import classNames from "classnames";
import React, { ReactNode } from "react";
import { FaSearch } from "react-icons/fa";
import AsyncComponent from "./../components/AsyncComponent";
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
            did: "",
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
            <div
                className={classNames("identity-search-input", {
                    "identity-search-input--compact": this.props.compact
                })}
            >
                <input
                    autoFocus={!this.props.compact}
                    className="identity-search--text-input"
                    type="text"
                    value={this.state.did}
                    placeholder={this.props.compact ? "Search DID" : ""}
                    onChange={e =>
                        this.setState({
                            did: e.target.value,
                            isValid: this.isValid(e.target.value),
                            networkMismatch: this.didContainsWrongNetwork(e.target.value, this.props.network)
                        })}
                    onKeyPress={e => {
                        if (e.key === "Enter") {
                            this.doSearch();
                        }
                    }}
                />

                <button
                    className="identity-search--button"
                    type="submit"
                    onClick={() => this.doSearch()}
                    disabled={!this.state.isValid}
                >
                    {this.props.compact ? <FaSearch /> : "Search"}
                </button>
                {this.state.networkMismatch && <p>Selected Network may not match DID Network</p>}
            </div>
        );
    }

    /**
     * Is the DID valid.
     * @param did The DID to check.
     * @returns True if the DID is valid.
     */
    private isValid(did?: string): boolean {
        if (!did) {
            return false;
        }

        if (!did.startsWith("did:iota:")) {
            return false;
        }

        return true;
    }

    /**
     * Perform the search.
     */
    private doSearch(): void {
        this.props.onSearch(this.state.did);
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