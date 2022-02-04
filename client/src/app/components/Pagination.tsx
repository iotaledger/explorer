import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./Pagination.scss";
import { PaginationProps } from "./PaginationProps";
import { PaginationState } from "./PaginationState";

/**
 * Component which will display pagination.
 */
class Pagination extends Component<PaginationProps, PaginationState> {
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
            lastPage: 0
        };
    }

    /**
     * The component updated.
     * @param prevProps previous props
     */
    public componentDidUpdate(prevProps: PaginationProps): void {
        if (this.props !== prevProps) {
            this.setState({ paginationRange: this.updatePaginationRange() },
            () => {
                this.setState({
                    lastPage: this.state.paginationRange[this.state.paginationRange.length - 1] as number
                });
            });
        }
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
                    "hidden": (this.props.currentPage === 0 || this.state.paginationRange.length < 2)
                })}
            >
                <li
                    className={classNames("pagination-item", {
                  disabled: this.props.currentPage === 1
                })}
                    onClick={() => {
                        this.onPrevious();
                    }}
                >
                    <div className="arrow left" />
                </li>
                {this.state.paginationRange.map((pageNumber: (number|string), idx: number) => {
                if (pageNumber === Pagination.DOTS) {
                  return <li key={idx} className="pagination-item dots">&#8230;</li>;
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
                        this.onNext();
                    }}
                >
                    <div className="arrow right" />
                </li>
            </ul>
        );
    }


    /**
     * Update pagination range.
     *  @returns The range of available pages.
     */
    protected updatePaginationRange(): (string|number)[] {
        const totalPageCount: number = Math.ceil(this.props.totalCount / this.props.pageSize);

        // Pages count is determined as siblingsCount + firstPage + lastPage + currentPage + 2*DOTS
        const totalPageNumbers: number = this.props.siblingsCount + 5;

        /**
         * If the number of pages is less than the page numbers we want to show in our
         * paginationComponent, we return the range [1..totalPageCount].
         */
        if (totalPageNumbers >= totalPageCount) {
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

            return [...leftRange, Pagination.DOTS, totalPageCount];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + (2 * this.props.siblingsCount);
            const rightRange = this.range(
              totalPageCount - rightItemCount + 1,
              totalPageCount
            );

            return [firstPageIndex, Pagination.DOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = this.range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, Pagination.DOTS, ...middleRange, Pagination.DOTS, lastPageIndex];
        }

        return [];
    }

    private range(start: number, end: number): number[] {
        const length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
    }

    private onNext(): void {
        this.props.onPageChange(this.props.currentPage + 1);
    }

    private onPrevious(): void {
        this.props.onPageChange(this.props.currentPage - 1);
    }
}

export default Pagination;
