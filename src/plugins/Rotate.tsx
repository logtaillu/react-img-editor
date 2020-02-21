import Plugin from './Plugin';
import { DrawEventPramas } from '../type';
import PointUtil from '../tools/PointUtil';
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
        const { layer, imageLayer, stage, dragNode } = drawEventPramas;
        const { height, width } = stage.size();
        const pos = PointUtil.getCenterPos(dragNode, stage);
        const scale = stage.scale();
        stage.setSize({ width: height, height: width });
        const childs = imageLayer.getChildren();
        childs.map((child: any) => this.rotate(child, height, width, scale));
        const otherchilds = layer.getChildren();
        otherchilds.map((child: any) => this.rotate(child, height, width, scale));
        imageLayer.draw();
        layer.draw();
        const newPos = PointUtil.getCenterPos(dragNode, stage);
        dragNode.resetPos({
            x: newPos.x - pos.x,
            y: newPos.y - pos.y
        });
    }
}