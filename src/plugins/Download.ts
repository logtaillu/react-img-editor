
import { DrawEventPramas } from '../type'
import Plugin from './Plugin'
import ImageUtil from '../tools/ImageUtil'

export default class Download extends Plugin {
  name = 'download'
  iconfont = 'iconfont icon-download'
  title = '下载图片'

  onEnter = (drawEventPramas: DrawEventPramas) => {
    let canvas = ImageUtil.getImageCanvas(drawEventPramas);
    canvas.toBlob(function (blob: any) {
      // if ('msSaveOrOpenBlob' in navigator) {
      //   // Microsoft Edge and Microsoft Internet Explorer 10-11
      //   window.navigator.msSaveOrOpenBlob(blob, "image.jpg");
      // } else {
      const link = document.createElement('a')
      link.download = "image.jpg";
      link.href = URL.createObjectURL(blob);
      link.click()
      link.remove();
      // }
    }, "image/jpeg");
    canvas = null;
  }
}