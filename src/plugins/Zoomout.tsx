import Plugin from './Plugin';
import { DrawEventPramas } from '../type';
import ZoomUtil from '../tools/ZoomUtil';
import { ZoomByScale } from '../tools/stageEvents/ZoomOnWheel';
export default class Zoomout extends Plugin {
    name = "zoomout";
    iconfont = 'iconfont icon-plus';
    title = '放大';

    onEnter = (drawEventPramas: DrawEventPramas) => {
        const zoom = ZoomUtil.getZoomConfig(drawEventPramas.zoom);
        ZoomByScale(drawEventPramas, zoom.rate, true);
    }
}