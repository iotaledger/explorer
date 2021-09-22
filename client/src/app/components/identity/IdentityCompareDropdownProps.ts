import { IIdentityMessageWrapper } from "./../../../models/identity/IIdentityMessageWrapper";
export interface IdentityCompareDropdownProps {
    selectedMessage?: IIdentityMessageWrapper;
    messages: IIdentityMessageWrapper[];
    onSelectionChange(selectedMessage?: IIdentityMessageWrapper): void;
}
