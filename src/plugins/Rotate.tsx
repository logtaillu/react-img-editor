import Plugin from './Plugin';
import { DrawEventPramas } from '../type';
import PointUtil from '../tools/PointUtil';
import ZoomUtil from "../tools/ZoomUtil";
export default class Rotate extends Plugin {
    name = "rotate";
    iconfont = 'iconfont icon-rotate';
    title = '旋转';

    rotate(child: any, x: number, y: number) {
        // 回0位
        child.setPosition({ x: 0, y: 0 });
        child.setOffset({ x: 0, y: 0 });
        // 旋转
        child.rotate(90);
        const rotation = child.rotation();
        child.setRotation(rotation % 360);
        const num = (rotation / 90) % 4;
        if (num === 1) {
            child.setPosition({ x: x, y: 0 });
        } else if (num === 2) {
            child.setPosition({ x: x, y: y });
        } else if (num === 3) {
            child.setPosition({ x: 0, y: y });
        }
    }

    onEnter = (drawEventPramas: DrawEventPramas) => {
        const { stage, dragNode, zoom } = drawEventPramas;
        const zoomconfig = ZoomUtil.getZoomConfig(zoom);
        if (zoomconfig.innerzoom) {
            this.innerRotate(drawEventPramas);
        } else {
            const { height, width } = stage.size();
            const pos = PointUtil.getCenterPos(dragNode);
            stage.setSize({ width: height, height: width });
            this.rotate(stage, height, width);
            stage.batchDraw();
            const newPos = PointUtil.getCenterPos(dragNode);
            dragNode.resetPos({
                x: newPos.x - pos.x,
                y: newPos.y - pos.y
            });
        }
    }

    innerRotate(drawEventPramas: DrawEventPramas) {
        const { stage } = drawEventPramas;
        const off = stage.offset();
        const rotation = stage.rotation();
        // 原中点相对于左上角 [0,0]的位置
        const ori = PointUtil.getInnerCenter(stage);
        let half = { x: stage.width() * stage.scaleX() / 2, y: stage.height() * stage.scaleY() / 2 };
        // 拖回0点
        stage.setPosition({ x: 0, y: 0 });
        // 中点旋转
        stage.setOffset(half);
        const newrotate = (rotation + 90) % 360;
        stage.setRotation(newrotate);
        stage.setOffset(off);

        // 把现在的中点拖回原来的中点
        // 当前中点点相对左上角[0,0]的位置
        const now = PointUtil.getInnerCenter(stage);
        const newPos = {
            x: ori.x - now.x,
            y: ori.y - now.y
        };
        const func = stage.getDragBoundFunc();
        stage.position(func ? func(newPos) : newPos);
        stage.batchDraw();
    }
}