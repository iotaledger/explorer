import classNames from "classnames";
import React, { ReactNode } from "react";
import { FaSearch } from "react-icons/fa";
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
                <input
                    className="identity-search--text-input"
                    type="text"
                    autoFocus={!this.props.compact}
                    value={this.state.query}
                />
                <button className="identity-search--button" type="submit" onClick={() => this.doSearch()}>
                    {this.props.compact ? <FaSearch /> : "Search"}
                </button>
            </div>
        );
    }

    /**
     * Is the query valid.
     * @param query The query to check.
     * @returns True if the query is valid.
     */
    private isValid(query?: string): boolean {
        return true;
    }

    /**
     * Perform the search.
     */
    private doSearch(): void {
        this.props.onSearch(this.state.query);
    }
}

export default SearchInput;
