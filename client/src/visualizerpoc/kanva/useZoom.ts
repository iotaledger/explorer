import Konva from "konva";

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
