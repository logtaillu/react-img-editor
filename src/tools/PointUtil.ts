export default {
    getPointPos(stage) {
        const pos = stage.getPointerPosition();
        const scale = stage.getScale();
        const pointPos = {
            x: (pos.x - stage.x()) / scale.x,
            y: (pos.y - stage.y()) / scale.y
        };
        return pointPos;
    }
}