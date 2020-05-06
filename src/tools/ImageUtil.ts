import { IZoomConfig } from "../type";
import { Stage } from "konva/types/Stage";
import PointUtil from "./PointUtil";

// 获取原始图片大小的canvas
const ImageUtil = {
    // 获取图片元素
    getImage(stage: any) {
        return stage.getLayers()[0].children[0];
    },
    // 获取当前图片信息
    getImageInfo(stage: Stage, eleinfo?: any) {
        const rotate = stage.rotation();
        const img = ImageUtil.getImage(stage);
        const info = eleinfo || { ...img.size(), ...img.position() };
        const newsize = {
            x: info.width * stage.scaleX(),
            y: info.height * stage.scaleY()
        };
        // 图片原点相对于实际原点的偏移
        const gap = {
            x: info.x * stage.scaleX(),
            y: info.y * stage.scaleY()
        }
        const rotateSize = PointUtil.rotatePointRightAngle(newsize, rotate);
        const rotateGap = PointUtil.rotatePointRightAngle(gap, rotate);
        return { ...rotateGap, width: rotateSize.x, height: rotateSize.y };
    },
    // 获取图片区域
    getStageArea(stage: any, eleinfo?: any) {
        const info = ImageUtil.getImageInfo(stage, eleinfo);
        return {
            x: info.x + stage.x() + Math.min(0, info.width),
            y: info.y + stage.y() + Math.min(0, info.height),
            width: Math.abs(info.width),
            height: Math.abs(info.height)
        }
    },
    // 获取下载用canvas
    getImageCanvas(params: { stage: any, zoom?: IZoomConfig }) {
        const { stage } = params;
        // 缩放回原始大小
        const scale = stage.scale();
        stage.scale({ x: 1, y: 1 });
        let canvas = stage.toCanvas({ pixelRatio: stage.pixelRatio, ...ImageUtil.getStageArea(stage) })
        stage.scale(scale);
        return canvas;
    }
}
export default ImageUtil;