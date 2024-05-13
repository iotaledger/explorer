export interface IIconContent {
    Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string | undefined }>;
    title: string;
    subtitle: string;
}
