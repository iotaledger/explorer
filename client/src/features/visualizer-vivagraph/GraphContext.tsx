import React, { createContext, useRef, useEffect } from 'react';
import { INodeData } from "~models/graph/nova/INodeData";
import Viva from "vivagraphjs";

interface GraphContextType {
    graph: React.RefObject<Viva.Graph.IGraph<INodeData, unknown> | null>;
    graphElement: React.RefObject<HTMLDivElement>;
    graphics: React.RefObject<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>;
    isVivaReady: boolean;
}

interface GraphProviderProps {
    children: React.ReactNode;
}

export const GraphContext = createContext<GraphContextType>({
    graph: { current: null },
    graphElement: { current: null },
    graphics: { current: null },
    isVivaReady: false,
});

export const GraphProvider: React.FC<GraphProviderProps> = ({ children }) => {
    const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    const graphElement = useRef<HTMLDivElement | null>(null);
    const graphics = useRef<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>(null);
    const [isVivaReady, setIsVivaReady] = React.useState(false);

    useEffect(() => {
        if (graphElement.current) {
            setIsVivaReady(true);
        }
    }, [graph.current, graphElement.current]);

    return (
        <GraphContext.Provider value={{ graph, graphElement, graphics, isVivaReady }}>
            {children}
        </GraphContext.Provider>
    );
};
