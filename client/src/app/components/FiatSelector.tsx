import classNames from "classnames";
import React, { ReactNode, RefObject } from "react";
import Currency from "./Currency";
import { FiatSelectorState } from "./FiatSelectorState";
import "./FiatSelector.scss";

/**
 * Component which will display a currency button.
 */
class FiatSelector extends Currency<unknown, FiatSelectorState> {
  /**
   * The dropdown button class name.
   */
  private static readonly BUTTON_CLASSNAME: string = "fiat-selector__button";

  /**
   * The dropdown reference.
   */
  private readonly dropdown: RefObject<HTMLDivElement>;

  /**
   * Create a new instance of FiatSelector.
   * @param props The Props.
   */
  constructor(props: unknown) {
    super(props);
    this.dropdown = React.createRef();
    this.setState({
      isExpanded: false,
    });
  }

  /**
   * The component did mount.
   */
  public componentDidMount(): void {
    super.componentDidMount();

    document.addEventListener("mousedown", this.outsideClickHandler);
  }

  /**
   * The component is about to Unmount.
   */
  public componentWillUnmount() {
    super.componentWillUnmount();
    document.removeEventListener("mousedown", this.outsideClickHandler);
  }

  /**
   * Render the component.
   * @returns The node to render.
   */
  public render(): ReactNode {
    const renderCurrency = (currency: string) => (
      <div
        key={currency}
        className="fiat-selector__currency"
        onClick={() => {
          this.setCurrency(currency);
          this.closeDropdown();
        }}
      >
        <span className="acronym">{currency}</span>
        <span className="full-name">{this._currencyService.getCurrencyName(currency)}</span>
      </div>
    );

    const supportedFiatCurrencies = this._currencyService.getFiatCurrencies();

    return (
      <div className="fiat-selector">
        <button
          type="button"
          className={FiatSelector.BUTTON_CLASSNAME}
          onClick={() => this.setState({ isExpanded: !this.state?.isExpanded })}
        >
          {this.state?.currency}
        </button>
        <span className={classNames("material-icons chevron", { opened: this.state?.isExpanded })}>expand_more</span>
        {this.state?.isExpanded && (
          <div className="fiat-selector__entries" ref={this.dropdown}>
            <div className="group-header">Currencies</div>
            {supportedFiatCurrencies.map((currency) => renderCurrency(currency))}
          </div>
        )}
      </div>
    );
  }

  /**
   * Update formatted currencies.
   */
  protected updateCurrency(): void {}

  /**
   * Handler to detect clicks outside the dropdown
   * @param event The click Event.
   */
  private readonly outsideClickHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (this.dropdown.current && !this.dropdown.current.contains(target) && target.className !== FiatSelector.BUTTON_CLASSNAME) {
      this.closeDropdown();
    }
  };

  /**
   * Close the dropdown.
   */
  private readonly closeDropdown = () => {
    this.setState({ isExpanded: false });
  };
}

export default FiatSelector;
