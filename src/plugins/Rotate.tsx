import Plugin from './Plugin';
import { DrawEventPramas } from '../type';
import PointUtil from '../tools/PointUtil';
import ZoomUtil from "../tools/ZoomUtil";
export default class Rotate extends Plugin {
    name = "rotate";
    iconfont = 'iconfont icon-rotate';
    title = '旋转';

    rotate(child: any, x: number, y: number, scale: { x: number, y: number }) {
        // 回0位
        child.setPosition({ x: 0, y: 0 });
        child.setOffset({ x: 0, y: 0 });
        // 旋转
        child.rotate(90);
        const rotation = child.rotation();
        child.setRotation(rotation % 360);
        const num = (rotation / 90) % 4;
        if (num === 1) {
            child.setPosition({ x: x / scale.x, y: 0 });
        } else if (num === 2) {
            child.setPosition({ x: x / scale.x, y: y / scale.y });
        } else if (num === 3) {
            child.setPosition({ x: 0, y: y / scale.y });
        }
    }

    onEnter = (drawEventPramas: DrawEventPramas) => {
        const { layer, imageLayer, stage, dragNode, zoom } = drawEventPramas;
        const zoomconfig = ZoomUtil.getZoomConfig(zoom);
        if (zoomconfig.innerzoom) {
            this.innerRotate(drawEventPramas);
        } else {
            const { height, width } = stage.size();
            const pos = PointUtil.getCenterPos(dragNode);
            const scale = stage.scale();
            stage.setSize({ width: height, height: width });
            const childs = imageLayer.getChildren();
            childs.map((child: any) => this.rotate(child, height, width, scale));
            const otherchilds = layer.getChildren();
            otherchilds.map((child: any) => this.rotate(child, height, width, scale));
            imageLayer.draw();
            layer.draw();
            const newPos = PointUtil.getCenterPos(dragNode);
            dragNode.resetPos({
                x: newPos.x - pos.x,
                y: newPos.y - pos.y
            });
        }
    }

    getPositionByRotate(rotate, half) {
        const num = rotate / 90;
        let nowcenter = { x: half.x, y: half.y };
        if (num === 1) {
            nowcenter = { x: -half.y, y: half.x };
        } else if (num === 2) {
            nowcenter = { x: -half.x, y: -half.y };
        } else if (num === 3) {
            nowcenter = { x: half.y, y: -half.x };
        }
        return nowcenter;
    }

    innerRotate(drawEventPramas: DrawEventPramas) {
        const { stage } = drawEventPramas;
        const off = stage.offset();
        const pos = stage.position();
        const rotation = stage.rotation();
        let half = { x: stage.width() * stage.scaleX() / 2, y: stage.height() * stage.scaleY() / 2 };
        // 拖回0点
        stage.setPosition({ x: 0, y: 0 });
        // 中点旋转
        stage.setOffset(half);
        const newrotate = (rotation + 90) % 360;
        stage.setRotation(newrotate);
        stage.setOffset(off);

        // 把现在的中点拖回原来的中点
        const ori = this.getPositionByRotate(rotation, half);
        const now = this.getPositionByRotate(newrotate, half);
        stage.setPosition({
            x: pos.x + ori.x - now.x,
            y: pos.y + ori.y - now.y
        });

        stage.batchDraw();
    }
}