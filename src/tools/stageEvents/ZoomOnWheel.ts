import { IStageEvent } from "./IStageEvent";
import { ZOOM_WHEEL_RATE, ZOOM_MAX, ZOOM_MIN } from "../../common/constants";
import PointUtil from "../PointUtil";
import { DrawEventParams } from "../../common/type";
export function ZoomByScale({ stage, dragNode }: DrawEventParams, newScale: number) {
    if (!stage) {
        return;
    }
    const iszoomout = newScale >= 1;
    const oldScale = stage.scaleX();
    const nowscale = newScale * oldScale;
    // 无视scale的点在stage内的位置
    const point = stage.getPointerPosition() || { x: 0, y: 0 };
    const oldpointpos = {
        x: (point.x - stage.width() / 2),
        y: (point.y - stage.height() / 2),
    };
    const center = PointUtil.getCenterPos(dragNode);

    const inmax = !ZOOM_MAX || (nowscale <= ZOOM_MAX);
    const inmin = !ZOOM_MIN || (nowscale >= ZOOM_MIN);
    if (inmax && inmin) {
        stage.scale({ x: newScale * oldScale, y: newScale * oldScale });
        const size = stage.size();
        stage.size({ width: size.width * newScale, height: size.height * newScale });
        stage.batchDraw();
        const newCenter = PointUtil.getCenterPos(dragNode);
        const newPosoff = {
            x: oldpointpos.x * (newScale - 1),
            y: oldpointpos.y * (newScale - 1)
        }
        // 1.保持中点
        // 2. 偏移点
        dragNode.resetPos({
            x: (newCenter.x - center.x) - newPosoff.x,
            y: (newCenter.y - center.y) - newPosoff.y,
        }, !iszoomout);
    }
}
export default [{
    eventName: "wheel",
    handle: (params, e) => {
        e.evt.preventDefault();
        const { currentPlugin } = params;
        if (currentPlugin) {
            return;
        } else {
            const iszoomout = e.evt.deltaY <= 0;
            var newScale =
                iszoomout ? 1 * ZOOM_WHEEL_RATE : 1 / ZOOM_WHEEL_RATE;
            ZoomByScale(params, newScale);
        }
    }
}] as IStageEvent[];