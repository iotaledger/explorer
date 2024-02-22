import React, { useState } from 'react';

const defaultControlsVisualiser: IControlsVisualiser = { MIN_SINUSOID_PERIOD: 5, MAX_SINUSOID_PERIOD: 8 }

interface IControlsVisualiser {
    MIN_SINUSOID_PERIOD: number;
    MAX_SINUSOID_PERIOD: number;
}
/**
 * Retrieves a value from localStorage and parses it as JSON.
 */
const LOCAL_STORAGE_KEY = 'controlsVisualiser';
export function getFromLocalStorage(): IControlsVisualiser {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    return item ? JSON.parse(item) : defaultControlsVisualiser;
}

/**
 * Saves a value to localStorage as a JSON string.
 */
function setToLocalStorage(value: IControlsVisualiser) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
}

const Input = ({label, min, max, val, set}: {label: string; min: number; max: number; val: number; set: (val: number) => void}) => {
    const [err, setErr] = useState<string | undefined>();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        // Check if the input value is a valid number
        if (event.target.value === '-' || event.target.value === '') {
            // @ts-ignore
            set(event.target.value);
            return;
        }

        const newValue = Math.max(min, Math.min(max, Number(event.target.value)));
        if (newValue >= min && newValue <= max) {
            setErr(undefined);
            set(newValue);
        } else {
            set(newValue);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <label>{label}</label>
            <input
                type="number"
                min={min}
                max={max}
                value={val}
                onChange={handleChange}
            />
            {!!err && <div>{err}</div>}
        </div>
    );
};

export const Controls = () => {
    const [state, setState] = useState<IControlsVisualiser>(() => {
        // Use getFromLocalStorage to retrieve the state
        return getFromLocalStorage() || defaultControlsVisualiser;
    });

    const handleApply = () => {
        setToLocalStorage(state);
        location.reload();
    }

    return (
        <div>
            <Input
                label={"Min sinusoid period"}
                min={-10}
                max={200}
                val={state.MIN_SINUSOID_PERIOD}
                set={(val) => {
                    setState({
                        ...state,
                        MIN_SINUSOID_PERIOD: val,
                    });
                }}
            />
            <Input
                label={"Max sinusoid period"}
                min={-10}
                max={200}
                val={state.MAX_SINUSOID_PERIOD}
                set={(val) => {
                    setState({
                        ...state,
                        MAX_SINUSOID_PERIOD: val,
                    });
                }}
            />
            <button
                type={"button"}
                onClick={handleApply}
            >
                Apply
            </button>
        </div>
    );
};


