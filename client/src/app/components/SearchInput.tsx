import classNames from "classnames";
import React, { ReactNode } from "react";
import { FaSearch } from "react-icons/fa";
import { TrytesHelper } from "../../helpers/trytesHelper";
import AsyncComponent from "./AsyncComponent";
import "./SearchInput.scss";
import { SearchInputProps } from "./SearchInputProps";
import { SearchInputState } from "./SearchInputState";

/**
 * Component which will show the search input page.
 */
class SearchInput extends AsyncComponent<SearchInputProps, SearchInputState> {
    /**
     * Create a new instance of SearchInput.
     * @param props The props.
     */
    constructor(props: SearchInputProps) {
        super(props);

        this.state = {
            query: "",
            isValid: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div
                className={classNames(
                    "search-input",
                    { "search-input--compact": this.props.compact }
                )}
            >
                <input
                    className="search--text-input"
                    type="text"
                    autoFocus={!this.props.compact}
                    value={this.state.query}
                    onChange={e => this.setState({
                        query: this.props.protocolVersion === "og"
                            ? e.target.value.toUpperCase().trim()
                            : e.target.value.trim(),
                        isValid: this.isValid(this.props.protocolVersion === "og"
                            ? e.target.value.toUpperCase().trim()
                            : e.target.value.trim())
                    })}
                    placeholder={this.props.compact ? "Search..." : (
                        this.props.protocolVersion === "chrysalis"
                            ? "Search messages, addresses, outputs, milestones, indexes"
                            : "Search transactions, bundles, addresses, tags")}
                    onKeyDown={e => {
                        if (e.keyCode === 13 && this.state.isValid) {
                            this.props.onSearch(this.state.query);
                        }
                    }}
                />
                <button
                    className="search--button"
                    type="submit"
                    onClick={() => this.props.onSearch(this.props.protocolVersion === "og"
                        ? this.state.query.trim().toUpperCase()
                        : this.state.query.trim())}
                    disabled={!this.state.isValid}
                >
                    {this.props.compact ? (<FaSearch />) : "Search"}
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
        if (!query) {
            return false;
        }

        if (this.props.protocolVersion === "og") {
            if (!TrytesHelper.isTrytes(query)) {
                return false;
            }
            return ((query.trim().length > 0 && query.trim().length <= 27) ||
                query.trim().length === 81 ||
                query.trim().length === 90);
        }

        return query.length > 0;
    }
}

export default SearchInput;
