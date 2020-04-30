import Plugin from './Plugin';
import { DrawEventParams } from '../common/type';
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

    onEnter = (DrawEventParams: DrawEventParams) => {
        const { drawLayer, imageLayer, stage, dragNode } = DrawEventParams;
        const { height, width } = stage.size();
        const pos = PointUtil.getCenterPos(dragNode);
        const scale = stage.scale();
        stage.setSize({ width: height, height: width });
        const childs = imageLayer.getChildren();
        for (let i = 0; i < childs.length; i++){
            this.rotate(childs[i], height, width, scale);
        }
        const otherchilds = drawLayer.getChildren();
        for (let i = 0; i < otherchilds.length; i++){
            this.rotate(otherchilds[i], height, width, scale);
        }
        imageLayer.draw();
        drawLayer.draw();
        const newPos = PointUtil.getCenterPos(dragNode);
        dragNode.resetPos({
            x: newPos.x - pos.x,
            y: newPos.y - pos.y
        });
    }
}