import { IStageEvent } from "./IStageEvent";
import PointUtil from "../PointUtil";
import { DrawEventPramas } from "../../type";
import ZoomUtil from "../ZoomUtil";
export function ZoomByScale(params: DrawEventPramas, newScale: number, isCenter = false) {
    if (ZoomUtil.getZoomConfig(params.zoom).innerzoom) {
        ZoomInner(params, newScale, isCenter);
    } else {
        ZoomOutter(params, newScale, isCenter);
    }
}

function canScale(params: any, nowscale: number) {
    const { zoom, stage } = params;
    nowscale = stage.pixelRatio ? nowscale / stage.pixelRatio: nowscale;
    const zoomconf = ZoomUtil.getZoomConfig(zoom);
    const ratein = !zoomconf.minrate || (nowscale >= zoomconf.minrate);
    const sizein = !zoomconf.minsize || (stage.height() * nowscale >= zoomconf.minsize && stage.width() * nowscale >= zoomconf.minsize);
    const ratemax = !zoomconf.maxrate || (nowscale <= zoomconf.maxrate);
    const sizemax = !zoomconf.maxsize || (stage.height() * nowscale <= zoomconf.maxsize && stage.width() * nowscale <= zoomconf.maxsize);
    const inmax = ratemax && sizemax;
    const inmin = ratein && sizein;
    return inmax && inmin;
}

export function ZoomOutter(params: DrawEventPramas, newScale: number, isCenter = false) {
    const { stage, dragNode, } = params;
    if (!stage) {
        return;
    }
    const iszoomout = newScale >= 1;
    const oldScale = stage.scaleX();
    const nowscale = newScale * oldScale;
    if (canScale(params, nowscale)) {
        // 无视scale的点在stage内的位置
        const oldpointpos = isCenter ? { x: 0, y: 0 } : {
            x: (stage.getPointerPosition().x - stage.width() / 2),
            y: (stage.getPointerPosition().y - stage.height() / 2),
        };
        const center = PointUtil.getCenterPos(dragNode);
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

export function ZoomInner(params: DrawEventPramas, newScale: number, isCenter = false) {
    const { stage } = params;
    const oldScale = stage.scaleX();
    const pointer = isCenter ? PointUtil.getInnerCenter(stage) : stage.getPointerPosition();
    newScale = newScale * oldScale;
    if (canScale(params, newScale)) {
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        stage.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        const func = stage.getDragBoundFunc();
        stage.position(func ? func(newPos) : newPos);
        stage.batchDraw();
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