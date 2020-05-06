import { ZoomByScale } from "./ZoomOnWheel";
import { IStageEvent } from "./IStageEvent";
import ZoomUtil from "../ZoomUtil";
function getDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export default [
    {
        eventName: "touchmove",
        handle: (params, e: any) => {
            const { dragNode, currentPluginRef } = params;
            const touches = e.evt && e.evt.touches || [];
            if (currentPluginRef || touches.length < 2) {
                return;
            } else {
                e.evt.preventDefault();
                const zoom = () => {
                    const touch1 = e.evt.touches[0];
                    const touch2 = e.evt.touches[1];
                    if (touch1 && touch2) {
                        const dist = getDistance(
                            {
                                x: touch1.clientX,
                                y: touch1.clientY
                            },
                            {
                                x: touch2.clientX,
                                y: touch2.clientY
                            }
                        );

                        if (!dragNode.lastDist) {
                            dragNode.lastDist = dist;
                        }
                        // 2点间的距离
                        const scale = dist / dragNode.lastDist;
                        ZoomByScale(params, scale);
                        dragNode.lastDist = dist;
                    }
                };
                const period = ZoomUtil.getZoomConfig(params.zoom).period;
                if (period) {
                    if (dragNode.timer) { return; }
                    dragNode.timer = setTimeout(zoom, period);
                } else {
                    zoom();
                }
            }
        }
    },
    {
        eventName: 'touchstart',
        handle: (params, e: any) => {
            const { dragNode, stage } = params;
            const touches = e.evt && e.evt.touches || [];
            if (touches.length >= 2) {
                dragNode.lastDist = 0;
                stage.draggable(false);
            }
        }
    }
] as IStageEvent[];