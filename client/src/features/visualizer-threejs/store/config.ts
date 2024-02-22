import { create } from "zustand";

interface ConfigState {
    dimensions: { width: number; height: number };
    setDimensions: (width: number, height: number) => void;

    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;

    inView: boolean;
    setInView: (inView: boolean) => void;

    isEdgeRenderingEnabled: boolean;
    setEdgeRenderingEnabled: (isEdgeRenderingEnabled: boolean) => void;

    initialTime: number | null;
    setInitialTime: (initialTime: number) => void;

    sinusoidPeriodsSum: number;
    setSinusoidPeriodsSum: (totalPeriodsSum: number) => void;
    sinusoidRandomPeriods: number[];
    setSinusoidRandomPeriods: (randomizedPeriods: number[]) => void;

    randomSinusoidAmplitudes: number[];
    setRandomSinusoidAmplitudes: (randomizedAmplitudes: number[]) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
    /**
     * Canvas dimensions
     */
    dimensions: { width: 0, height: 0 },
    setDimensions: (width, height) => {
        set((state) => ({
            ...state,
            dimensions: { width, height },
        }));
    },

    /**
     * Is animation playing
     */
    isPlaying: false,
    setIsPlaying: (isPlaying) => {
        set((state) => ({
            ...state,
            isPlaying,
        }));
    },

    /**
     * Is canvas in view
     */
    inView: false,
    setInView: (inView) => {
        set((state) => ({
            ...state,
            inView,
        }));
    },

    /**
     * Is edge rendering enabled
     */
    isEdgeRenderingEnabled: false,
    setEdgeRenderingEnabled: (isEdgeRenderingEnabled) => {
        set((state) => ({
            ...state,
            isEdgeRenderingEnabled,
        }));
    },

    /**
     * The initial time when the emitter was mounted.
     * Used for all animations based on time.
     */
    initialTime: null,
    setInitialTime: (initialTime) => {
        set((state) => ({
            ...state,
            initialTime,
        }));
    },

    /**
     * Randomized periods for the tangle.
     */
    sinusoidPeriodsSum: 0,
    setSinusoidPeriodsSum: (totalPeriodsSum) => {
        set((state) => ({
            ...state,
            sinusoidPeriodsSum: totalPeriodsSum,
        }));
    },
    sinusoidRandomPeriods: [],
    setSinusoidRandomPeriods: (randomizedPeriods) => {
        set((state) => ({
            ...state,
            sinusoidRandomPeriods: randomizedPeriods,
        }));
    },

    /**
     * Randomized amplitudes for the tangle.
     */
    randomSinusoidAmplitudes: [],
    setRandomSinusoidAmplitudes: (randomizedAmplitudes) => {
        set((state) => ({
            ...state,
            randomSinusoidAmplitudes: randomizedAmplitudes,
        }));
    },
}));
