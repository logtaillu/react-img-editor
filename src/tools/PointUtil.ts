export default {
    getPointPos(stage) {
        const pos = stage.getPointerPosition();
        const scale = stage.getScale();
        const pointPos = {
            x: (pos.x - stage.x()) / scale.x,
            y: (pos.y - stage.y()) / scale.y
        };
        return pointPos;
    },
    getCenterPos(dragNode, stage) {
        const bounds = dragNode.getBounds(dragNode.dragref);
        // 中点位置
        const pos = {
            x: (bounds.left + bounds.right) / 2,
            y: (bounds.top + bounds.bottom) / 2
        }
        return pos;
    }
}