import Konva from "konva";

const SCALE_MIN = 0.8;
const SCALE_MAX = 0.05;

export const useZoom = () => {
    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const scaleBy = 1.1;
        const stage = e.target.getStage();

        if (stage) {
            const oldScale = stage.scaleX();

            const pointerPosition = stage.getPointerPosition();

            if (pointerPosition) {
                const mousePointTo = {
                    x: (pointerPosition.x - stage.x()) / oldScale,
                    y: (pointerPosition.y - stage.y()) / oldScale
                };

                const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

                if (newScale < SCALE_MAX || newScale > SCALE_MIN) {
                    return;
                }

                stage.scale({ x: newScale, y: newScale });

                stage.position({
                    x: pointerPosition.x - (mousePointTo.x * newScale),
                    y: pointerPosition.y - (mousePointTo.y * newScale)
                });

                stage.batchDraw();
            }
        }
    };

    return {
        handleWheel
    };
};
