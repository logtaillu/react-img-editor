import { IStageEvent } from "./IStageEvent";
import { ZOOM_WHEEL_RATE } from "../../constants";
export default {
    eventName: "wheel",
    handle: ({ stage, dragNode }, e) => {
        e.evt.preventDefault();
        var oldScale = stage.scaleX();
        const pos = {
            x: stage.getPointerPosition().x - (stage.width() / 2),
            y: stage.getPointerPosition().y
        }
        
        var newScale =
            e.evt.deltaY <= 0 ? 1 * ZOOM_WHEEL_RATE : 1 / ZOOM_WHEEL_RATE;
        stage.scale({ x: newScale * oldScale, y: newScale * oldScale });
        const size = stage.size();
        stage.size({ width: size.width * newScale, height: size.height * newScale });
        stage.batchDraw();
        const newPos = {
            x: pos.x * (1 - newScale),
            y: pos.y * (1 - newScale)
        }
        dragNode.resetPos(newPos);
    }
} as IStageEvent;