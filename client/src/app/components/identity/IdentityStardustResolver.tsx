import { IMessageMetadata } from "@iota/iota.js";
import { Fragment, ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { CHRYSALIS } from "../../../models/config/protocolVersion";
import { TangleStatus } from "../../../models/tangleStatus";
import AsyncComponent from "../AsyncComponent";
import "./IdentityStardustResolver.scss"
import React from "react";
import Modal from "../Modal";
import CopyButton from "../CopyButton";
import JsonViewer from "../JsonViewer";
import { HiDownload } from "react-icons/hi";
import { DownloadHelper } from "../../../helpers/downloadHelper";
import IdentityMessageIdOverview from "./IdentityMsgIdOverview";
import Spinner from "../Spinner";
import { IdentityDiffStorageService } from "../../../services/identityDiffStorageService";
import { IdentityStardustResolverProps } from "./IdentityStardustResolverProps";
import { IdentityStardustResolverState } from "./IdentityStardustResolverState";
import { RouteComponentProps } from "react-router-dom";
import welcomeMessage from "../../../assets/modals/identity-resolver/welcome.json";

class IdentityStardustResolver extends AsyncComponent<
    RouteComponentProps<IdentityStardustResolverProps> & { isSupported: boolean },
    IdentityStardustResolverState
> {
    /**
     * Timer to check to state update.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * placeholder when messageId is not available.
     */
    private readonly EMPTY_MESSAGE_ID = "0".repeat(64);

    constructor(props: RouteComponentProps<IdentityStardustResolverProps> & { isSupported: boolean }) {
        super(props);


        this.state = {
            did: undefined,
            error: false,
            errorMessage: "",
        };
    }
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        if (!this.state.did) {
            return;
        }

        // const res = await ServiceFactory.get<IdentityService>("identity").resolveIdentity(
        //     this.state.did,
        //     this.props.match.params.network
        // );

        // if (typeof res.error === "object") {
        //     res.error = JSON.stringify(res.error);
        // }

        // if (res.error) {
        //     this.setState({
        //         error: true,
        //         errorMessage: res.error
        //     });
        //     return;
        // }

        // if (res.document) {
        //     this.setState({
        //         resolvedIdentity: res,
        //         isIdentityResolved: true,
        //         latestMessageId: res.messageId ?? undefined,
        //         version: res.version
        //     });

        //     await this.updateMessageDetails(res.messageId ?? "");
        // }
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this._timerId) {
            clearTimeout(this._timerId);
            this._timerId = undefined;
        }
        IdentityDiffStorageService.instance.clearAll();
    }

    /**
     * Calculate the status for the message.
     * @param metadata The metadata to calculate the status from.
     * @returns The message status.
     */
    private calculateStatus(metadata?: IMessageMetadata): TangleStatus {
        let messageTangleStatus: TangleStatus = "unknown";

        if (metadata) {
            if (metadata.milestoneIndex) {
                messageTangleStatus = "milestone";
            } else if (metadata.referencedByMilestoneIndex) {
                messageTangleStatus = "referenced";
            } else {
                messageTangleStatus = "pending";
            }
        }

        return messageTangleStatus;
    }

 /**
 * Render the component.
 * @returns The node to render.
 */
    public render(): ReactNode {
        return (
            <div>
                <div className="row space-between wrap  ">
                    <div className="row middle">
                        <h1>
                            Decentralized Identifier
                        </h1>
                        <Modal icon="info" data={welcomeMessage} />
                    </div>
                </div>
            </div>
        )
    }

}

export default IdentityStardustResolver;