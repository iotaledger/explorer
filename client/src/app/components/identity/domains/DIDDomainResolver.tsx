import React, { ReactNode } from "react";
import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";
import { DIDDomainResolverProps } from "./DIDDomainResolverProps";
import { DIDDomainResolverState, Status } from "./DIDDomainResolverState";
import AsyncComponent from "../../AsyncComponent";
import "./DIDDomainResolver.scss";
import Spinner from "../../Spinner";
import Tooltip from "../../Tooltip";

class DIDDomainResolver extends AsyncComponent<DIDDomainResolverProps, DIDDomainResolverState> {
    constructor(props: DIDDomainResolverProps) {
        super(props);
        this.state = {
            verifiedDomainsPresentation: new Map(),
        };
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        this.computeVerifiedDomainsPresentation(this.props.verifiedDomains);
    }

    public componentDidUpdate(prevProps: DIDDomainResolverProps) {
        if (prevProps !== this.props) {
            this.computeVerifiedDomainsPresentation(this.props.verifiedDomains);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="row flex-wrap-wrap">
                {this.state.verifiedDomainsPresentation.size ? (
                    [...this.state.verifiedDomainsPresentation.keys()].map((key) => (
                        <div key={key} className="value code inline-flex">
                            <div className="margin-r-2">
                                <a href={key}>{key}</a>
                            </div>
                            <div className="margin-r-t">
                                {this.state.verifiedDomainsPresentation.get(key)?.status === Status.InFlight && <Spinner compact />}
                                {this.state.verifiedDomainsPresentation.get(key)?.status === Status.Verified && (
                                    <IoCheckmarkCircle color="green" style={{ verticalAlign: "middle" }} />
                                )}
                                {this.state.verifiedDomainsPresentation.get(key)?.status === Status.Error && (
                                    <Tooltip key={key} tooltipContent={this.state.verifiedDomainsPresentation.get(key)?.message}>
                                        <IoAlertCircle color="red" style={{ verticalAlign: "middle" }} />
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="value code row middle">no linked domains</div>
                )}
            </div>
        );
    }

    private computeVerifiedDomainsPresentation(verifiedDomains: DIDDomainResolverProps["verifiedDomains"]) {
        const newVerifiedDomainsPresentation: DIDDomainResolverState["verifiedDomainsPresentation"] = new Map();
        if (verifiedDomains) {
            for (const [key, value] of verifiedDomains.entries()) {
                newVerifiedDomainsPresentation.set(key, { status: Status.InFlight });
                value
                    .then(() => {
                        this.setState({
                            verifiedDomainsPresentation: new Map(this.state.verifiedDomainsPresentation).set(key, {
                                status: Status.Verified,
                            }),
                        });
                    })
                    .catch((err) => {
                        this.setState({
                            verifiedDomainsPresentation: new Map(this.state.verifiedDomainsPresentation).set(key, {
                                status: Status.Error,
                                message: err.message,
                            }),
                        });
                    });
            }
        }
        this.setState({
            verifiedDomainsPresentation: newVerifiedDomainsPresentation,
        });
    }
}
export default DIDDomainResolver;
