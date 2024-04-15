import React from "react";
import "./Loader.scss";

export const Loader = () => {
    return (
        <div>
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        </div>
    );
};

export default Loader;
