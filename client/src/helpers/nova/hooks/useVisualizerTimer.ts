import { useConfigStore } from "~/features/visualizer-threejs/store";

export default function useVisualizerTimer() {
    const initialTime = useConfigStore((state) => state.initialTime);

    return () => {
        if (!initialTime) {
            return 0;
        }

        const currentTime = Date.now();
        const diff = (currentTime - initialTime) / 1_000;

        return diff;
    };
}
