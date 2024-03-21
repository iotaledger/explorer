/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable no-shadow */
declare module "vivagraphjs" {
    export namespace Graph {
        export interface ILink<U> {
            id: string;
            fromId: string;
            toId: string;
            data: U;
        }
        export interface INode<T, U> {
            id: string;
            links: ILink<U>[];
            data?: T;
        }
        export interface IGraph<T, U> {
            getLink: (nodeA: string, nodeB: string) => ILink<U> | undefined;
            addLink: (nodeA: string, nodeB: string, data?: U) => ILink<U>;
            removeLink: (link: ILink<U>) => void;
            getNode: (node: string) => INode<T, U> | undefined;
            addNode: (node: string, data?: T) => INode<T, U>;
            removeNode: (node: string) => void;

            beginUpdate: () => void;
            endUpdate: () => void;
            forEachNode: (callback: (node: INode<T, U>) => void) => void;
            forEachLink: (callback: (link: ILink<U>) => void) => void;
            forEachLinkedNode: (node: string, callback: (linkedNode: INode<T, U>, link: ILink<U>) => void) => void;
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

        export interface IEvents<T, U> {
            click: (handler: (node: INode<T, U>) => void) => void;
            dblClick: (handler: (node: INode<T, U>) => void) => void;
            mouseEnter: (handler: (node: INode<T, U>) => void) => void;
            mouseLeave: (handler: (node: INode<T, U>) => void) => void;
        }

        function graph<T, U>(): IGraph<T, U>;
        function webgl(context: WebGLRenderingContextBase): IWebGL;
        function webglInputEvents<T, U>(graphics: View.IWebGLGraphics<T, U>, graph: IGraph<T, U>): IEvents<T, U>;

        export namespace View {
            export interface IItem {

            }
            export interface IWebGLGraphics<T, U> {
                link: (callback: (link: ILink<U>) => IItem) => void;
                node: (callback: (node: INode<T, U>) => IItem) => void;
                getNodeUI: (nodeId: string) => {
                    color: string;
                    size: number;
                } | undefined;
                getLinkUI: (linkId: string) => {
                    color: number;
                } | undefined;
                setNodeProgram: (program: WebGLProgram) => void;
                updateSize: () => void;
                scale: (scale: number, offset: { x: number; y: number }) => void;
            }

            export interface IRenderer {
                run: () => void;
                dispose: () => void;
                getLayout: () => Layout.ILayout;
                rerender: () => void;
                zoomOut: () => void;
                reset: () => void;
                pause: () => void;
                resume: () => void;
                getTransform: () => { scale?: number; offset?: { x: number; y: number } };

                on: (event: "scale", callback: (scale: number) => void) => void;
            }
            function webglGraphics<T, U>(): IWebGLGraphics<T, U>;
            function webglLine(color: string | number): IItem;
            function webglSquare(size: nubmer, color: string): IItem;

            function renderer<T, U>(graph: IGraph<T, U>, options: {
                container: HTMLElement | null;
                graphics: IWebGLGraphics<T, U>;
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
            function forceDirected<T, U>(
                graph: IGraph<T, U>,
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
