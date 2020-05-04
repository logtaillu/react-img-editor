import DragWrapper from "../components/DragWrapper";
import { isNum } from "../tools/HelperUitl";
const PointUtil = {
    // 获取相对stage的无缩放坐标
    getPointPos(stage: any,point?) {
        const pos = point || stage.getPointerPosition();
        const scale = stage.getScale();
        const pointPos = {
            x: (pos.x - stage.x()) / scale.x,
            y: (pos.y - stage.y()) / scale.y
        };
        return pointPos;
    },
    // 转换回实际坐标
    getOriPos(stage, pos){
        const scale = stage.getScale();
        const pointPos = {
            x: pos.x * scale.x + stage.x(),
            y: pos.y * scale.y + stage.y()
        };
        return pointPos;
    },
    getCenterPos(dragNode: DragWrapper) {
        const bounds = dragNode.getBounds(dragNode.dragref);
        // 中点位置
        const pos = {
            x: (bounds.left + bounds.right) / 2,
            y: (bounds.top + bounds.bottom) / 2
        }
        return pos;
    },
    getPositionByRotate(stage: any) {
        const rotate = stage.rotation();
        let half = { x: stage.width() * stage.scaleX() / 2, y: stage.height() * stage.scaleY() / 2 };
        const num = rotate / 90;
        let nowcenter = { x: half.x, y: half.y };
        if (num === 1) {
            nowcenter = { x: -half.y, y: half.x };
        } else if (num === 2) {
            nowcenter = { x: -half.x, y: -half.y };
        } else if (num === 3) {
            nowcenter = { x: half.y, y: -half.x };
        }
        return nowcenter;
    },
    getInnerCenter(stage: any) {
        const pos = PointUtil.getPositionByRotate(stage);
        return {
            x: pos.x + stage.x(),
            y: pos.y + stage.y()
        }
    },
    boundpos(val: number, boda: number, bodb: number) {
        if (isNum(boda) && isNum(bodb)) {
            const min = Math.min(boda, bodb);
            const max = Math.max(boda, bodb);
            return Math.max(min, Math.min(val, max));
        } else {
            return val;
        }
    }
}

export default PointUtil;