import classNames from "classnames";
import React, { ReactNode } from "react";
import { PaginationProps } from "./PaginationProps";
import { PaginationState } from "./PaginationState";
import AsyncComponent from "../components/AsyncComponent";
import "./Pagination.scss";

/**
 * Component which will display pagination.
 */
class Pagination extends AsyncComponent<PaginationProps, PaginationState> {
    /**
     * Dots for pagination.
     */
     private static readonly DOTS: string = "...";

    /**
     * Create a new instance of Pagination.
     * @param props The props.
     */
    constructor(props: PaginationProps) {
        super(props);
        this.state = {
            paginationRange: [],
            lastPage: 0,
            isMobile: false
        };
    }

    /**
     * The component updated.
     * @param prevProps previous props
     */
    public componentDidUpdate(prevProps: PaginationProps): void {
        if (this.props !== prevProps) {
            this.setState(
                { paginationRange: this.updatePaginationRange() },
                () => this.setState(
                    { lastPage: this.state.paginationRange.at(-1) as number }
                )
            );
        }
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();
        this.setState(
            { paginationRange: this.updatePaginationRange() },
            () => this.setState(
                { lastPage: this.state.paginationRange.at(-1) as number }
            )
        );
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    public resize() {
        const isMobileViewPort = window.innerWidth < 768;

        if (this.state.isMobile !== isMobileViewPort && this._isMounted) {
            this.setState(
                { isMobile: isMobileViewPort },
                () => this.setState({ paginationRange: this.updatePaginationRange() })
            );
        }
    }

    /**
     * The component will unmounted.
     */
    public async componentWillUnmount(): Promise<void> {
        super.componentWillUnmount();
        // eslint-disable-next-line unicorn/no-invalid-remove-event-listener
        window.removeEventListener("resize", this.resize.bind(this));
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <ul
                className={classNames("pagination", {
                    [this.props.classNames as string]: this.props.classNames !== undefined,
                    hidden: (this.props.currentPage === 0 || this.state.paginationRange.length < 2)
                })}
            >
                <li
                    className={classNames("pagination-item", {
                        disabled: this.props.currentPage === 1,
                        hidden: this.state.isMobile
                    })}
                    onClick={() => {
                        const page = this.props.currentPage < 11 ? 1 : this.props.currentPage - 10;
                        this.props.onPageChange(page);
                    }}
                >
                    <div className="arrow left" />
                    <div className="arrow left" />
                </li>
                <li
                    className={classNames("pagination-item", {
                        disabled: this.props.currentPage === 1
                    })}
                    onClick={() => {
                        this.props.onPageChange(this.props.currentPage - 1);
                    }}
                >
                    <div className="arrow left" />
                </li>
                {this.state.paginationRange.map((pageNumber: (number|string), idx: number) => {
                    if (pageNumber === Pagination.DOTS) {
                        return <li key={idx} className="pagination-item dots">{pageNumber}</li>;
                    }

                    return (
                        <li
                            key={idx}
                            className={classNames("pagination-item", {
                                selected: pageNumber === this.props.currentPage
                            })}
                            onClick={() => this.props.onPageChange(pageNumber as number)}
                        >
                            {pageNumber}
                        </li>
                    );
                })}
                <li
                    className={classNames("pagination-item", {
                        disabled: this.props.currentPage === this.state.lastPage
                    })}
                    onClick={() => {
                        this.props.onPageChange(this.props.currentPage + 1);
                    }}
                >
                    <div className="arrow right" />
                </li>
                <li
                    className={classNames("pagination-item", {
                        disabled: this.props.currentPage === this.state.lastPage,
                        hidden: this.state.isMobile
                    })}
                    onClick={() => {
                        const page = this.props.currentPage > this.state.lastPage - 10
                                ? this.state.lastPage
                                : this.props.currentPage + 10;
                        this.props.onPageChange(page);
                    }}
                >
                    <div className="arrow right" />
                    <div className="arrow right" />
                </li>
            </ul>
        );
    }


    /**
     * Update pagination range.
     * @returns The range of available pages.
     */
    protected updatePaginationRange(): (string|number)[] {
        let paginationRange: (string|number)[] = [];

        const totalPageCount: number = Math.ceil(this.props.totalCount / this.props.pageSize);

        // Min page range is determined as siblingsCount + firstPage + lastPage + currentPage + 2*DOTS
        const minPageRangeCount: number = this.props.siblingsCount + 5;

        if (minPageRangeCount >= totalPageCount) {
            return this.range(1, totalPageCount);
        }

        const leftSiblingIndex = Math.max(this.props.currentPage - this.props.siblingsCount, 1);
        const rightSiblingIndex = Math.min(
            this.props.currentPage + this.props.siblingsCount,
            totalPageCount
        );

        /*
         *  Do not show dots if there is only one position left
         *  after/before the left/right page count.
         */
        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPageCount;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = 3 + (2 * this.props.siblingsCount);
            const leftRange = this.range(1, leftItemCount);

            paginationRange = [...leftRange, Pagination.DOTS, totalPageCount];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + (2 * this.props.siblingsCount);
            const rightRange = this.range(
              totalPageCount - rightItemCount + 1,
              totalPageCount
            );

            paginationRange = [firstPageIndex, Pagination.DOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = this.range(leftSiblingIndex, rightSiblingIndex);

            paginationRange = [firstPageIndex, Pagination.DOTS, ...middleRange, Pagination.DOTS, lastPageIndex];
        }

        /*
         *  Add extra range for large number of pages
         */
        const rightRemainingPages = totalPageCount - (this.props.currentPage + this.props.siblingsCount);
        const leftRemainingPages = this.props.currentPage - this.props.siblingsCount;

        if (!this.state.isMobile &&
            this.props.extraPageRangeLimit &&
            rightRemainingPages > this.props.extraPageRangeLimit) {
            const remainderMidPoint = Math.floor((rightRemainingPages) / 2) + this.props.currentPage;
            const rMiddleRange: (string|number)[] = this.range(remainderMidPoint - 1, remainderMidPoint + 1);
            rMiddleRange.push(Pagination.DOTS);
            const lastItemIndex = paginationRange.length - 1;
            paginationRange.splice(lastItemIndex, 0, ...rMiddleRange);
        }

        if (!this.state.isMobile &&
            this.props.extraPageRangeLimit &&
            leftRemainingPages > this.props.extraPageRangeLimit) {
            const remainderMidPoint = Math.floor(leftRemainingPages / 2);
            const lMiddleRange: (string|number)[] = this.range(remainderMidPoint - 1, remainderMidPoint + 1);
            lMiddleRange.unshift(Pagination.DOTS);
            paginationRange.splice(1, 0, ...lMiddleRange);
        }

        return paginationRange;
    }

    /**
     * Creates an array of elements from start value to end value.
     * @param start Start value.
     * @param end End value.
     * @returns Array of elements from start to end value.
     */
    private range(start: number, end: number): number[] {
        const length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
    }
}

export default Pagination;
