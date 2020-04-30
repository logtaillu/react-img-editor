import Plugin from './Plugin';
import { DrawEventParams } from '../common/type';
import { ZOOM_RATE, ZOOM_MIN } from "../common/constants";
import PointUtil from '../tools/PointUtil';
export default class Zoomin extends Plugin {
    name = "zoomin";
    iconfont = 'iconfont icon-minus';
    title = '缩小';

    onEnter = (DrawEventParams: DrawEventParams) => {
        const { stage, dragNode } = DrawEventParams;
        const oldscale = stage.scaleX();
        if ( !ZOOM_MIN || (oldscale / ZOOM_RATE >= ZOOM_MIN)) {
            const pos = PointUtil.getCenterPos(dragNode);
            const newscale = oldscale / ZOOM_RATE;
            stage.scale({ x: newscale, y: newscale });
            const size = stage.size();
            stage.size({ width: size.width / ZOOM_RATE, height: size.height / ZOOM_RATE });
            stage.batchDraw();
            const newPos = PointUtil.getCenterPos(dragNode);
            dragNode.resetPos({
                x: newPos.x - pos.x,
                y: newPos.y - pos.y
            }, true);
        }
    }
}