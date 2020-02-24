
import { DrawEventPramas } from '../type'
import Plugin from './Plugin'
import { blobTest } from "../tools/HelperUitl";

export default class Download extends Plugin {
  name = 'download'
  iconfont = 'iconfont icon-download'
  title = '下载图片'

  onEnter = (drawEventPramas: DrawEventPramas) => {
    const { stage, pixelRatio } = drawEventPramas
    let canvas = stage.toCanvas({ pixelRatio })
    blobTest();
    canvas.toBlob(function (blob: any) {
      const link = document.createElement('a')
      link.download = "image.jpg";
      link.href = URL.createObjectURL(blob);
      link.click()
      link.remove();
    }, "image/jpeg");
    canvas = null;
  }
}