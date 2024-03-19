import React, { createContext, useRef } from 'react';
import { INodeData } from "~models/graph/nova/INodeData";
import Viva from "vivagraphjs";

interface GraphContextType {
    graph: React.RefObject<Viva.Graph.IGraph<INodeData, unknown> | null>;
    graphElement: React.RefObject<HTMLDivElement>;
    graphics: React.RefObject<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>;
}

interface GraphProviderProps {
    children: React.ReactNode;
}

export const GraphContext = createContext<GraphContextType>({
    graph: { current: null },
    graphElement: { current: null },
    graphics: { current: null },
});

export const GraphProvider: React.FC<GraphProviderProps> = ({ children }) => {
    const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    const graphElement = useRef<HTMLDivElement | null>(null);
    const graphics = useRef<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>(null);

    return (
        <GraphContext.Provider value={{ graph, graphElement, graphics }}>
            {children}
        </GraphContext.Provider>
    );
};
