import { IStageEvent } from "./IStageEvent";
import { ZOOM_WHEEL_RATE } from "../../constants";
import PointUtil from "../PointUtil";
export default {
    eventName: "wheel",
    handle: ({ stage, dragNode }, e) => {
        e.evt.preventDefault();
        var oldScale = stage.scaleX();
        // 无视scale的点在stage内的位置
        const oldpointpos = {
            x: (stage.getPointerPosition().x - stage.width() / 2),
            y: (stage.getPointerPosition().y - stage.height() / 2),
        };
        const center = PointUtil.getCenterPos(dragNode, stage);

        var newScale =
            e.evt.deltaY <= 0 ? 1 * ZOOM_WHEEL_RATE : 1 / ZOOM_WHEEL_RATE;
        stage.scale({ x: newScale * oldScale, y: newScale * oldScale });
        const size = stage.size();
        stage.size({ width: size.width * newScale, height: size.height * newScale });
        stage.batchDraw();
        const newCenter = PointUtil.getCenterPos(dragNode, stage);
        const newPosoff = {
            x: oldpointpos.x * (newScale - 1),
            y: oldpointpos.y * (newScale - 1)
        }
        // 1.保持中点
        // 2. 偏移点
        dragNode.resetPos({
            x: (newCenter.x - center.x) - newPosoff.x,
            y: (newCenter.y - center.y) - newPosoff.y,
        });
    }
} as IStageEvent;