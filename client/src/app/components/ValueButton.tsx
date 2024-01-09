import { UnitsHelper, Units } from "@iota/iota.js";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./ValueButton.scss";
import { ValueButtonProps } from "./ValueButtonProps";
import { ValueButtonState } from "./ValueButtonState";

/**
 * Component which will display a value button.
 */
class ValueButton extends Component<ValueButtonProps, ValueButtonState> {
  /**
   * Create a new instance of ValueButton.
   * @param props The props.
   */
  constructor(props: ValueButtonProps) {
    super(props);

    const bestUnits = UnitsHelper.calculateBest(props.value);

    this.state = {
      units: bestUnits,
    };
  }

  /**
   * The component was updated.
   * @param prevProps The previous properties.
   */
  public componentDidUpdate(prevProps: ValueButtonProps): void {
    if (this.props.value !== prevProps.value) {
      const bestUnits = UnitsHelper.calculateBest(this.props.value);

      this.setState({
        units: bestUnits,
      });
    }
  }

  /**
   * Render the component.
   * @returns The node to render.
   */
  public render(): ReactNode {
    return (
      <div className="value-button">
        <div className="value-button--label">{this.props.label ?? "Value"}</div>
        <div className="value-button--value">{UnitsHelper.formatUnits(this.props.value, this.state.units)}</div>
        <div className="value-button--selector">
          {Object.keys(UnitsHelper.UNIT_MAP).map((unit) => (
            <button
              type="button"
              key={unit}
              className={classNames({ selected: this.state.units === unit })}
              onClick={() => this.setState({ units: unit as Units })}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export default ValueButton;
