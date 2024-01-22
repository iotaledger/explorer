import classNames from "classnames";
import React, { ReactNode } from "react";
import { IdentitySearchInputProps } from "./IdentitySearchInputProps";
import { IdentitySearchInputState } from "./IdentitySearchInputState";
import AsyncComponent from "../AsyncComponent";
import "./IdentitySearchInput.scss";

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
                    "identity-search-input--compact": this.props.compact,
                })}
            >
                <span className="material-icons">search</span>
                <input
                    autoFocus={!this.props.compact}
                    className="identity-search--text-input"
                    type="text"
                    value={this.state.did}
                    placeholder={this.props.compact ? "Search DID" : ""}
                    onChange={(e) =>
                        this.setState({
                            did: e.target.value,
                            isValid: this.isValid(e.target.value),
                        })
                    }
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            this.doSearch();
                        }
                    }}
                />
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
}

export default SearchInput;
