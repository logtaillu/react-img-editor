import DragWrapper from "../components/DragWrapper";
import { isNum } from "../tools/HelperUitl";
const PointUtil = {
    rotatePointRightAngle(point: { x, y }, rotation) {
        const rotate = rotation * Math.PI / 180;
        // 因为我们只有90度单位的旋转
        const cos = parseInt(Math.cos(rotate).toFixed(0));
        const sin = parseInt(Math.sin(rotate).toFixed(0));
        return {
            x: cos * point.x - sin * point.y,
            y: sin * point.x + cos * point.y
        };
    },
    // 获取相对stage的无缩放坐标
    getPointPos(stage: any, point?) {
        const pos = point || stage.getPointerPosition();
        const scale = stage.scale();
        let pointPos = {
            x: (pos.x - stage.x()) / scale.x,
            y: (pos.y - stage.y()) / scale.y
        };
        const rotation = stage.rotation();
        pointPos = PointUtil.rotatePointRightAngle(pointPos,-rotation);
        return pointPos;
    },
    // 转换回实际坐标
    getOriPos(stage, pos) {
        const scale = stage.getScale();
        const rotation = stage.rotation();
        pos = PointUtil.rotatePointRightAngle(pos,rotation);
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
    // 相对于pos的gap范围需要在bound范围内，改用坐标方式计算
    boundpos(val: number, gap: number[], bound: number[]) {
        if (isNum(bound[0]) && isNum(bound[1]) && isNum(gap[0]) && isNum(gap[1])) {
            // 顺序排序
            bound.sort((a, b) => a - b);
            gap.sort((a, b) => a - b);
            // bound[0]-gap[0]<=val<=bound[1]-gap[1]
            return Math.min(Math.max(val, bound[0] - gap[0]), bound[1] - gap[1]);
        } else {
            return val;
        }
    },
    isPointInImage(pos,img){
        const imgpos = img.position();
        return pos.x>=imgpos.x&&pos.x<=(imgpos.x+img.width())&&pos.y>=imgpos.y&&pos.y<=(imgpos.y+img.height());
    }
}

export default PointUtil;