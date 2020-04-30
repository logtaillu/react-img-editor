import { IZoomConfig } from "../common/type";
import { ZOOM_RATE, ZOOM_PERIOD, ZOOM_MAX, ZOOM_MIN, ZOOM_WHEEL_RATE } from "../common/constants";
function getZoomConfig(zoom?: IZoomConfig): {
    rate: number;
    maxrate: number;
    maxsize: number;
    minrate: number;
    minsize: number;
    period: number;
    wheelrate: number;
} {
    const res: any = {};
    const defaultval = {
        rate: ZOOM_RATE,
        period: ZOOM_PERIOD,
        maxrate: ZOOM_MAX,
        minrate: ZOOM_MIN,
        maxsize: 0,
        minsize: 0,
        wheelrate: ZOOM_WHEEL_RATE
    };
    Object.keys(defaultval).map(key => {
        const val = zoom && zoom[key];
        res[key] =  val === null || val === undefined ? defaultval[key] : val;
    });
    return res;
}

export default {
    getZoomConfig
}