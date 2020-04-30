import Plugin from './Plugin';
import { DrawEventParams } from '../common/type';
import PointUtil from '../tools/PointUtil';
import ZoomUtil from '../tools/ZoomUtil';
export default class Zoomin extends Plugin {
    name = "zoomin";
    iconfont = 'iconfont icon-minus';
    title = '缩小';

    onEnter = (DrawEventParams: DrawEventParams) => {
        const { stage, dragNode } = DrawEventParams;
        const oldscale = stage.scaleX();
        const zoom = ZoomUtil.getZoomConfig(DrawEventParams.zoom);
        const ratein = !zoom.minrate || (oldscale / zoom.rate >= zoom.minrate);
        const sizein = !zoom.minsize || (stage.height() / zoom.rate >= zoom.minsize && stage.width() / zoom.rate >= zoom.minsize);
        if ( ratein && sizein) {
            const pos = PointUtil.getCenterPos(dragNode);
            const newscale = oldscale / zoom.rate;
            stage.scale({ x: newscale, y: newscale });
            const size = stage.size();
            stage.size({ width: size.width / zoom.rate, height: size.height / zoom.rate });
            stage.batchDraw();
            const newPos = PointUtil.getCenterPos(dragNode);
            dragNode.resetPos({
                x: newPos.x - pos.x,
                y: newPos.y - pos.y
            }, true);
        }
    }
}