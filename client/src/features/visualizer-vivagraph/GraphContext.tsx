import React, { createContext, useRef } from 'react';
import { INodeData } from "~models/graph/nova/INodeData";
import Viva from "vivagraphjs";

interface GraphContextType {
    graph: React.RefObject<Viva.Graph.IGraph<INodeData, unknown> | null>;
    graphElement: React.RefObject<HTMLDivElement>;
}

interface GraphProviderProps {
    children: React.ReactNode;
}

export const GraphContext = createContext<GraphContextType>({
    graph: { current: null },
    graphElement: { current: null },
});

export const GraphProvider: React.FC<GraphProviderProps> = ({ children }) => {
    const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    const graphElement = useRef<HTMLDivElement | null>(null);

    return (
        <GraphContext.Provider value={{ graph, graphElement }}>
            {children}
        </GraphContext.Provider>
    );
};
