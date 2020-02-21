import Plugin from './Plugin';
import Konva from "konva";
import { DrawEventPramas } from '../type';
import { ZOOM_RATE } from "../constants";
export default class Zoomout extends Plugin {
    name = "zoomout";
    iconfont = 'iconfont icon-plus';
    title = '放大';

    onEnter = (drawEventPramas: DrawEventPramas) => {
        const { layer, historyStack, plugins, imageLayer, stage, dragNode } = drawEventPramas;
        const oldscale = stage.scaleX();
        const pos = {
            x: 0,
            y: stage.height()/2
        }
        const newscale = oldscale * ZOOM_RATE;
        stage.scale({ x: newscale, y: newscale });
        const size = stage.size();
        stage.size({ width: size.width * ZOOM_RATE, height: size.height * ZOOM_RATE });
        stage.batchDraw();
        const newPos = {
            x: pos.x * (1 - ZOOM_RATE),
            y: pos.y * (1 - ZOOM_RATE)
        }
        dragNode.resetPos(newPos);
    }
}