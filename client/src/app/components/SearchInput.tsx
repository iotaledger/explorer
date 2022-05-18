import React, { ReactNode } from "react";
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
            isValid: false,
            showSearchInput: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <React.Fragment>
                {/* -------------- Desktop Search ---------------- */}
                <div
                    className="search-input"
                >
                    <span className="material-icons">
                        search
                    </span>
                    <input
                        className="search--text-input"
                        type="text"
                        autoFocus
                        value={this.state.query}
                        onChange={e => this.setState({
                            query: this.props.protocolVersion === "og"
                                ? e.target.value.toUpperCase().trim()
                                : e.target.value,
                                isValid: this.isValid(this.props.protocolVersion === "og"
                                    ? e.target.value.toUpperCase().trim()
                                    : e.target.value)
                        })}
                        onKeyDown={e => {
                            if (e.keyCode === 13 && this.state.isValid) {
                                this.doSearch();
                            }
                        }}
                        placeholder="Search the tangle..."
                    />

                </div>
                {/* -------------- Mobile Search ---------------- */}
                <div className="search-input--compact">
                    <button
                        type="button"
                        onClick={() =>
                            this.setState({ showSearchInput: !this.state.showSearchInput }
                            )}
                    >
                        <span className="material-icons">
                            search
                        </span>
                    </button>
                    {this.state.showSearchInput && (
                        <React.Fragment>
                            <div className="text-input">
                                <input
                                    className="search--text-input"
                                    type="text"
                                    autoFocus
                                    value={this.state.query}
                                    onChange={e => this.setState({
                                        query: this.props.protocolVersion === "og"
                                            ? e.target.value.toUpperCase().trim()
                                            : e.target.value,
                                        isValid: this.isValid(this.props.protocolVersion === "og"
                                            ? e.target.value.toUpperCase().trim()
                                            : e.target.value)
                                    })}
                                    onKeyDown={e => {
                                        if (e.keyCode === 13 && this.state.isValid) {
                                            this.doSearch();
                                            this.setState({ showSearchInput: false });
                                        }
                                    }}
                                    placeholder="Search the tangle..."
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        this.setState({ showSearchInput: false });
                                    }}
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                            <div
                                className="bg-placeholder"
                                onClick={() => {
                                    this.setState({ showSearchInput: false });
                                }}
                            />
                        </React.Fragment>
                    )}
                </div>
            </React.Fragment>

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

        return query.trim().length > 0;
    }

    /**
     * Perform the search.
     */
    private doSearch(): void {
        this.props.onSearch(this.props.protocolVersion === "og"
            ? this.state.query.trim().toUpperCase()
            : this.state.query.trim());

        // Clear search input field when a search has been made.
        this.setState({ query: "" });
    }
}

export default SearchInput;
