import { IZoomConfig } from "../type";
import { ZOOM_RATE, ZOOM_PERIOD, ZOOM_MAX, ZOOM_MIN, ZOOM_WHEEL_RATE } from "../constants";
function getZoomConfig(zoom?: IZoomConfig): {
    rate: number;
    maxrate: number;
    maxsize: number;
    minrate: number;
    minsize: number;
    period: number;
    wheelrate: number;
    innerzoom: boolean;
    dragTarget: "img" | "stage";
} {
    const res: any = {};
    const defaultval = {
        rate: ZOOM_RATE,
        period: ZOOM_PERIOD,
        maxrate: ZOOM_MAX,
        minrate: ZOOM_MIN,
        maxsize: 0,
        minsize: 0,
        wheelrate: ZOOM_WHEEL_RATE,
        innerzoom: true,
        dragTarget: "stage"
    };
    Object.keys(defaultval).map(key => {
        const val = zoom && zoom[key];
        res[key] = val === null || val === undefined ? defaultval[key] : val;
    });
    return res;
}

export default {
    getZoomConfig
}