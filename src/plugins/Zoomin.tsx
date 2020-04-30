import Plugin from './Plugin';
import { DrawEventPramas } from '../type';
import PointUtil from '../tools/PointUtil';
import ZoomUtil from '../tools/ZoomUtil';
import { ZoomByScale } from "../tools/stageEvents/ZoomOnWheel";
export default class Zoomin extends Plugin {
    name = "zoomin";
    iconfont = 'iconfont icon-minus';
    title = '缩小';

    onEnter = (drawEventPramas: DrawEventPramas) => {
        const zoom = ZoomUtil.getZoomConfig(drawEventPramas.zoom);
        ZoomByScale(drawEventPramas, 1/zoom.rate, true);
    }
}