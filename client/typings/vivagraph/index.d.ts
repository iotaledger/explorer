/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable no-shadow */
declare module "vivagraphjs" {
    export namespace Graph {
        export interface ILink {
            id: string;
            fromId: string;
            toId: string;
            data: any;
        }
        export interface INode {
            id: string;
            links: ILink[];
            data: any;
        }
        export interface IGraph {
            getLink: (nodeA: string, nodeB: string) => ILink | undefined;
            addLink: (nodeA: string, nodeB: string, data?: any) => void;
            removeLink: (link: ILink) => void;
            getNode: (node: string) => string | undefined;
            addNode: (node: string, data?: any) => void;
            removeNode: (node: string) => void;

            beginUpdate: () => void;
            endUpdate: () => void;
            forEachNode: (callback: (node: INode) => void) => void;
            forEachLink: (callback: (link: ILink) => void) => void;
            forEachLinkedNode: (node: string, callback: (linkedNode: INode, link: ILink) => void) => void;
        }

        export interface ILocation {
            vertexPos: number;
            customAttributes: number;
            transform: number[];
            screenSize: number;
        }

        export interface IWebGL {
            createProgram: (code: string, codeB: string) => WebGLProgram;
            getLocations: (program: WebGLProgram, commands: string[]) => ILocation;
            extendArray: (arr: Float32Array, numItems: number, itemSize: number) => Float32Array;
            copyArrayPart: (arr: Float32Array, from: number, to: number, itemSize: number) => Float32Array;
        }

        export interface IEvents {
            click: (handler: (node: { id: string }) => void) => void;
            mouseEnter: (handler: (node: { id: string }) => void) => void;
            mouseLeave: (handler: (node: { id: string }) => void) => void;
        }

        function graph(): IGraph;
        function webgl(context: WebGLRenderingContextBase): IWebGL;
        function webglInputEvents(graphics: View.IWebGLGraphics, graph: IGraph): IEvents;

        export namespace View {
            export interface IItem {

            }
            export interface IWebGLGraphics {
                link: (callback: (link: ILink) => IItem) => void;
                node: (callback: (node: INode) => IItem) => void;
                getNodeUI: (nodeId: string) => {
                    color: string;
                    size: number;
                } | undefined;
                getLinkUI: (linkId: string) => {
                    color: string;
                } | undefined;
                setNodeProgram: (program: WebGLProgram) => void;
                updateSize: () => void;
            }

            export interface IRenderer {
                run: () => void;
                dispose: () => void;
                getLayout: () => Layout.ILayout;
                rerender: () => void;
                zoomOut: () => void;
            }
            function webglGraphics(): IWebGLGraphics;
            function webglLine(color: string): IItem;

            function renderer(graph: IGraph, options: {
                container: HTMLElement | null;
                graphics: IWebGLGraphics;
                layout: Layout.ILayout;
                renderLinks: boolean;
            }): IRenderer;
        }

        export namespace Layout {
            export interface ISimulator {
                springLength: (size: number) => void;
            }
            export interface ILayout {
                simulator: ISimulator;
            }
            function forceDirected(
                graph: IGraph,
                options: {
                    springLength: number;
                    springCoeff: number;
                    dragCoeff: number;
                    stableThreshold: number;
                    gravity: number;
                    timeStep: number;
                    theta: number;
                }): ILayout;
        }
    }
}
