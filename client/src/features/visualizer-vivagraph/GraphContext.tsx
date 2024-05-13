import React, { createContext, useRef, useEffect, Dispatch } from "react";
import { INodeData } from "~models/graph/nova/INodeData";
import Viva from "vivagraphjs";

interface GraphContextType {
    graph: React.MutableRefObject<Viva.Graph.IGraph<INodeData, unknown> | null>;
    graphElement: React.RefObject<HTMLDivElement>;
    graphics: React.MutableRefObject<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>;
    renderer: React.MutableRefObject<Viva.Graph.View.IRenderer | null>;
    isVivaReady: boolean;
    setIsVivaReady: Dispatch<boolean> | null;
}

export const GraphContext = createContext<GraphContextType>({
    graph: { current: null },
    graphElement: { current: null },
    graphics: { current: null },
    renderer: { current: null },
    isVivaReady: false,
    setIsVivaReady: null,
});

export const GraphProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    const graphElement = useRef<HTMLDivElement | null>(null);
    const graphics = useRef<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>(null);
    const renderer = useRef<Viva.Graph.View.IRenderer | null>(null);
    const [isVivaReady, setIsVivaReady] = React.useState(false);

    useEffect(() => {
        if (graphElement.current) {
            setIsVivaReady(true);
        }
    }, [graph.current, graphElement.current]);

    return (
        <GraphContext.Provider value={{ graph, graphElement, graphics, renderer, isVivaReady, setIsVivaReady }}>
            {children}
        </GraphContext.Provider>
    );
};
