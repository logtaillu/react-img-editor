import ZoomUtil from "./ZoomUtil";
import { IZoomConfig } from "../type";

// 获取原始图片大小的canvas
const ImageUtil = {
    getStageArea(stage: any) {
        const rotation = stage.rotation();
        const num = Math.floor(rotation / 90);
        const img = stage.getLayers()[0].children[0];
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