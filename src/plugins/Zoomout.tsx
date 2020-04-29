import Plugin from './Plugin';
import { DrawEventPramas } from '../type';
import { ZOOM_RATE, ZOOM_MAX } from "../constants";
import PointUtil from '../tools/PointUtil';
export default class Zoomout extends Plugin {
    name = "zoomout";
    iconfont = 'iconfont icon-plus';
    title = '放大';

    onEnter = (drawEventPramas: DrawEventPramas) => {
        const { stage, dragNode } = drawEventPramas;
        const oldscale = stage.scaleX();
        if (!ZOOM_MAX || (oldscale * ZOOM_RATE <= ZOOM_MAX)) {
            const pos = PointUtil.getCenterPos(dragNode);
            const newscale = oldscale * ZOOM_RATE;
            stage.scale({ x: newscale, y: newscale });
            const size = stage.size();
            stage.size({ width: size.width * ZOOM_RATE, height: size.height * ZOOM_RATE });
            stage.batchDraw();
            const newPos = PointUtil.getCenterPos(dragNode);
            dragNode.resetPos({
                x: newPos.x - pos.x,
                y: newPos.y - pos.y
            });
        }
    }
}