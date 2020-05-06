import ZoomUtil from "./ZoomUtil";
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
    getImageInfo(stage: Stage) {
        const rotate = stage.rotation();
        const img = ImageUtil.getImage(stage);
        const newsize = {
            x: img.width() * stage.scaleX(),
            y: img.height() * stage.scaleY()
        };
        // 图片原点相对于实际原点的偏移
        const gap = {
            x: img.x() * stage.scaleX(),
            y: img.y() * stage.scaleY()
        }
        const rotateSize = PointUtil.rotatePointRightAngle(newsize, rotate);
        const rotateGap = PointUtil.rotatePointRightAngle(gap, rotate);
        return { ...rotateGap, width: rotateSize.x, height: rotateSize.y };
    },
    // 获取图片区域
    getStageArea(stage: any) {
        const rotation = stage.rotation();
        const num = Math.floor(rotation / 90);
        const img = ImageUtil.getImage(stage);
        const size = img.size();
        const gap = img.position();
        const pos = stage.position();
        const configs = [
            { ...size, x: pos.x + gap.x, y: pos.y + gap.y },
            { x: pos.x - size.height - gap.y, y: pos.y + gap.x, width: size.height, height: size.width },
            { x: pos.x - size.width - gap.x, y: pos.y - size.height - gap.y, ...size },
            { x: pos.x + gap.y, y: pos.y - size.width - gap.x, width: size.height, height: size.width }
        ];
        return configs[num];
    },
    // 获取下载用canvas
    getImageCanvas(params: { stage: any, zoom?: IZoomConfig }) {
        const { stage } = params;
        const zoomin = ZoomUtil.getZoomConfig(params.zoom).innerzoom;
        // 缩放回原始大小
        const scale = stage.scale();
        stage.scale({ x: 1, y: 1 });
        let canvas = zoomin ?
            stage.toCanvas({ pixelRatio: stage.pixelRatio, ...ImageUtil.getStageArea(stage) }) :
            stage.toCanvas({
                pixelRatio: stage.pixelRatio, ...stage.position(),
                width: stage.width() / scale.x,
                height: stage.height() / scale.y
            });
        stage.scale(scale);
        return canvas;
    }
}
export default ImageUtil;