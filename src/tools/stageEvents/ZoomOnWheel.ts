import { IStageEvent } from "./IStageEvent";
import PointUtil from "../PointUtil";
import { DrawEventPramas } from "../../type";
import ZoomUtil from "../ZoomUtil";
export function ZoomByScale({ stage, dragNode,zoom }: DrawEventPramas, newScale: number) {
    if (!stage) {
        return;
    }
    const iszoomout = newScale >= 1;
    const oldScale = stage.scaleX();
    const nowscale = newScale * oldScale;
    // 无视scale的点在stage内的位置
    const oldpointpos = {
        x: (stage.getPointerPosition().x - stage.width() / 2),
        y: (stage.getPointerPosition().y - stage.height() / 2),
    };
    const center = PointUtil.getCenterPos(dragNode);
    const zoomconf = ZoomUtil.getZoomConfig(zoom);
    const ratein = !zoomconf.minrate || (nowscale >= zoomconf.minrate);
    const sizein = !zoomconf.minsize || (stage.height() * newScale >= zoomconf.minsize && stage.width() * newScale >= zoomconf.minsize);
    const ratemax = !zoomconf.maxrate || (nowscale <= zoomconf.maxrate);
    const sizemax = !zoomconf.maxsize || (stage.height() * newScale <= zoomconf.maxsize && stage.width() * newScale <= zoomconf.maxsize);
    const inmax = ratemax && sizemax;
    const inmin = ratein && sizein;
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
        const { currentPluginRef, dragNode } = params;
        if (currentPluginRef) {
            return;
        } else {
            const zoomconf = ZoomUtil.getZoomConfig(params.zoom);
            const zoom = () => {
                const iszoomout = e.evt.deltaY <= 0;
                var newScale =
                    iszoomout ? 1 * zoomconf.wheelrate : 1 / zoomconf.wheelrate;
                ZoomByScale(params, newScale);
                dragNode.timer = null;
            };
            if (zoomconf.period) {
                if (dragNode.timer) { return; }
                dragNode.timer = setTimeout(zoom, zoomconf.period);
            } else {
                zoom();
            }
        }
    }
}] as IStageEvent[];