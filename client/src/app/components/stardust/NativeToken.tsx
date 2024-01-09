import classNames from "classnames";
import React, { ReactNode } from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import { NativeTokenProps } from "./NativeTokenProps";
import { NativeTokenState } from "./NativeTokenState";
import AsyncComponent from "../AsyncComponent";

/**
 * Component which will display a native token.
 */
class NativeToken extends AsyncComponent<NativeTokenProps, NativeTokenState> {
  constructor(props: NativeTokenProps) {
    super(props);

    this.state = {
      isExpanded: this.props.isPreExpanded ?? false,
    };
  }

  /**
   * The component mounted.
   */
  public async componentDidMount(): Promise<void> {
    super.componentDidMount();
  }

  /**
   * Render the component.
   * @returns The node to render.
   */
  public render(): ReactNode {
    const { isExpanded } = this.state;
    const { tokenId, amount } = this.props;

    return (
      <div className="native-token">
        <div className="card--content__input card--value row middle" onClick={() => this.setState({ isExpanded: !isExpanded })}>
          <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
            <DropdownIcon />
          </div>
          <div className="card--label">Native token</div>
        </div>
        {isExpanded && (
          <div className="padding-l-t left-border">
            <div className="card--label">Token id:</div>
            <div className="card--value row">{tokenId}</div>
            <div className="card--label">Amount:</div>
            <div className="card--value row">{Number(amount)}</div>
          </div>
        )}
      </div>
    );
  }
}

export default NativeToken;
