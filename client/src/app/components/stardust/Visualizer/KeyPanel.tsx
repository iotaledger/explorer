import React from "react";

import "./KeyPanel.scss";

export const KeyPanel = () => (
    <div className="key-panel-container">
        <div className="card key-panel">
            <div className="key-panel-item">
                <div className="key-marker vertex-state--pending" />
                <div className="key-label">Pending</div>
            </div>
            <div className="key-panel-item">
                <div className="key-marker vertex-state--included" />
                <div className="key-label">Included</div>
            </div>
            <div className="key-panel-item">
                <div className="key-marker vertex-state--referenced" />
                <div className="key-label">Referenced</div>
            </div>
            <div className="key-panel-item">
                <div className="key-marker vertex-state--conflicting" />
                <div className="key-label">Conflicting</div>
            </div>
            <div className="key-panel-item">
                <div className="key-marker vertex-state--milestone" />
                <div className="key-label">Milestone</div>
            </div>
            <div className="key-panel-item">
                <div className="key-marker vertex-state--search-result" />
                <div className="key-label">Search result</div>
            </div>
        </div>
    </div>
);
