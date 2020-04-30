import ZoomOnWheel from "./ZoomOnWheel";
import { IStageEventMap } from "./IStageEvent";
import ZoomOnTouch from "./ZoomOnTouch";

export const defaultStageEvents: IStageEventMap = {
    "zoomOnWheel": ZoomOnWheel,
    "zoomOnTouch": ZoomOnTouch
};
