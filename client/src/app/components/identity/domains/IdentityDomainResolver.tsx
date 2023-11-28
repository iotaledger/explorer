import React, { Fragment, ReactNode } from "react";
import { IdentityDomainResolverProps } from "./IdentityDomainResolverProps";
import { IdentityDomainResolverState } from "./IdentityDomainResolverState";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import AsyncComponent from "../../AsyncComponent";
import "./IdentityDomainResolver.scss";
import Spinner from "../../Spinner";
import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";
import Tooltip from "../../Tooltip";


class IdentityDomainResolver extends AsyncComponent<IdentityDomainResolverProps,
    IdentityDomainResolverState
> {
    /**
     * Timer to check to state update.
     */
    private readonly _timerId?: NodeJS.Timer;

    constructor(props: IdentityDomainResolverProps) {
        super(props);
        this.state = {
            verifiedDomainsPresentation: new Map(),
            //errorMessage: ""
        };
    }

    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
        console.log(this.props);
        this.computeVerifiedDomainsPresentation(this.props.verifiedDomains);

        // if (resolvedIdentity.error) {
        //     this.setState({
        //         errorMessage: resolvedIdentity.error
        //     });
        // }
    }

    public componentDidUpdate(prevProps: IdentityDomainResolverProps) {
        if (prevProps !== this.props) {
          this.computeVerifiedDomainsPresentation(this.props.verifiedDomains);
        }
    }

    computeVerifiedDomainsPresentation(verifiedDomains: IdentityDomainResolverProps['verifiedDomains']) {
        const newVerifiedDomainsPresentation: IdentityDomainResolverState['verifiedDomainsPresentation'] = new Map();
        verifiedDomains?.forEach((value, key) => {
            newVerifiedDomainsPresentation.set(key, {status: 'in-flight'});
            value.then(() => {
                this.setState({
                    verifiedDomainsPresentation: new Map(this.state.verifiedDomainsPresentation).set(key, {status:'verified'}) ,
                });
            }).catch((err) => {
                this.setState({
                    verifiedDomainsPresentation: new Map(this.state.verifiedDomainsPresentation).set(key, {status: 'error', message: err.message}) ,
                });
            });
        });
        this.setState({
            verifiedDomainsPresentation: newVerifiedDomainsPresentation,
        });
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
    }


    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div>
            {[...this.state.verifiedDomainsPresentation.keys()].map(key => (
                 <div className="value code row middle">
                 <div className="margin-r-t">
                     <a href={key}>
                         {key}
                     </a>
                 </div>
                 <div className="margin-r-t">
                     {this.state.verifiedDomainsPresentation.get(key)?.status == "in-flight" && <Spinner compact/>}
                     {this.state.verifiedDomainsPresentation.get(key)?.status == "verified" && <IoCheckmarkCircle color="green" style={{ verticalAlign: 'middle' }}/>}
                     {this.state.verifiedDomainsPresentation.get(key)?.status == "error" && 
                     (<Tooltip key={key} tooltipContent={this.state.verifiedDomainsPresentation.get(key)?.message}>
                        <IoAlertCircle color="red" style={{ verticalAlign: 'middle' }}/>
                    </Tooltip>)}
                 </div>
             </div>
            // <li key={k}>myMap.get(k)</li>
            )) ?? "no linked domains"}
            </div>
        );
    }
}
export default IdentityDomainResolver;
