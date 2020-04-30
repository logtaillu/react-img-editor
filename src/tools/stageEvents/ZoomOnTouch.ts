import { ZoomByScale } from "./ZoomOnWheel";
import { IStageEvent } from "./IStageEvent";
function getDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export default [
    {
        eventName: "touchmove",
        handle: (params, e: any) => {
            const { dragNode, currentPluginRef } = params;
            if (currentPluginRef) {
                return;
            } else {
                e.evt.preventDefault();
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
            }
        }
    },
    {
        eventName: 'touchstart',
        handle: (params) => {
            const { dragNode } = params;
            dragNode.lastDist = 0;
        }
    }
] as IStageEvent[];