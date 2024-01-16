import { TaggedDataPayload as ITaggedDataPayload } from "@iota/sdk-wasm-nova/web";
import React from "react";
import DataToggle from "~/app/components/DataToggle";

interface TaggedDataPayloadProps {
    readonly payload: ITaggedDataPayload;
}

const TaggedDataPayload: React.FC<TaggedDataPayloadProps> = ({ payload }) => {
    const { tag, data } = payload;

    return (
        <div>
            <div className="section--data">
                {tag && (
                    <React.Fragment>
                        <div className="label row middle">
                            <span className="margin-r-t">Tag</span>
                        </div>
                        <DataToggle sourceData={tag} withSpacedHex={true} />
                    </React.Fragment>
                )}
                {data && (
                    <React.Fragment>
                        <div className="label row middle">
                            <span className="margin-r-t">Data</span>
                        </div>
                        <DataToggle sourceData={data} withSpacedHex={true} />
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

TaggedDataPayload.defaultProps = {
    payload: undefined,
};

export default TaggedDataPayload;
