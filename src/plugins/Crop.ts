import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas } from '../type'
import { transformerStyle } from '../constants'
import { uuid } from '../utils'
import PointUtil from '../tools/PointUtil'
import ZoomUtil from '../tools/ZoomUtil'
import ImageUtil from '../tools/ImageUtil'

const toolbarWidth = 275
const toolbarHeight = 40

export default class Crop extends Plugin {
  name = 'crop'
  iconfont = 'iconfont icon-cut'
  title = '图片裁剪'
  params = []

  isPaint = false
  virtualLayer: any = null
  rect: any = null
  transformer: any = null
  toolbarId = 'react-img-editor-crop-toolbar' + uuid()

  // 一直为正数
  getRectWidth = () => {
    return this.rect ? this.rect.getClientRect({ skipTransform: false }).width : 0
  }

  // 一直为正数
  getRectHeight = () => {
    return this.rect ? this.rect.getClientRect({ skipTransform: false }).height : 0
  }

  getRectX = () => {
    return this.rect ? this.rect.getClientRect({ skipTransform: false }).x : 0
  }

  getRectY = () => {
    return this.rect ? this.rect.getClientRect({ skipTransform: false }).y : 0
  }

  adjustToolbarPosition = (stage: any) => {
    // 需要考虑宽和高为负数的情况
    const $toolbar = document.getElementById(this.toolbarId)
    if (!$toolbar) return

    let left: number
    let top: number

    if (this.getRectWidth() >= 0) {
      left = this.getRectX()
    } else {
      left = this.getRectX() - toolbarWidth
    }

    if (this.getRectHeight() >= 0) {
      top = this.getRectHeight() + this.getRectY() + 20
    } else {
      top = this.getRectY() + 20
    }

    if (left < 0) left = 0
    if (left > stage.width() - toolbarWidth) left = stage.width() - toolbarWidth
    if (top < 0) top = 0
    if (top > stage.height()) top = stage.height()

    $toolbar.style.left = `${left}px`
    $toolbar.style.top = `${top}px`
  }

  createCropToolbar = (stage: any, sureBtnEvent: () => void, cancelBtnEvent: () => void) => {
    if (document.getElementById(this.toolbarId)) return

    const fragment = new DocumentFragment()

    // 创建截图工具栏
    const $cropToolbar = document.createElement('div')
    $cropToolbar.setAttribute('id', this.toolbarId)
    const cropToolbarStyle = 'position: absolute; z-index: 1000; box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);' +
      `background: #FFF; width: ${toolbarWidth}px; height: ${toolbarHeight}px; display: flex; align-items: center; padding: 0 12px;` +
      'font-size: 14px;'
    $cropToolbar.setAttribute('style', cropToolbarStyle)
    fragment.appendChild($cropToolbar)

    // 创建文本
    const $textNode = document.createTextNode('拖动边框调整图片显示范围')
    $cropToolbar.appendChild($textNode)

    const btnStyle = 'display: inline-block; width: 32px; height: 24px; border: 1px solid #C9C9D0;' +
      'border-radius: 2px; text-align: center; cursor: pointer; line-height: 24px;'

    // 创建取消按钮
    const $cancelBtn = document.createElement('span')
    $cancelBtn.setAttribute('style', btnStyle + 'background: #FFF; margin: 0 8px 0 10px;')
    $cancelBtn.onclick = cancelBtnEvent
    $cropToolbar.appendChild($cancelBtn)

    // 创建取消按钮图标
    const $closeIcon = document.createElement('i')
    $closeIcon.setAttribute('class', 'iconfont icon-close')
    $closeIcon.setAttribute('style', 'font-size: 12px;')
    $cancelBtn.appendChild($closeIcon)

    // 创建确认按钮
    const $sureBtn = document.createElement('span')
    $sureBtn.setAttribute('style', btnStyle + 'background: #007AFF; color: #FFF;')
    $sureBtn.onclick = sureBtnEvent
    $cropToolbar.appendChild($sureBtn)

    // 创建确认按钮图标
    const $checkIcon = document.createElement('i')
    $checkIcon.setAttribute('class', 'iconfont icon-check')
    $checkIcon.setAttribute('style', 'font-size: 12px;')
    $sureBtn.appendChild($checkIcon)

    stage.container().appendChild(fragment)
  }

  reset = (stage: any) => {
    const $toolbar = document.getElementById(this.toolbarId)
    $toolbar && stage.container().removeChild($toolbar)
    this.virtualLayer && this.virtualLayer.remove()
    if (this.rect) {
      this.rect.off('mouseenter')
      this.rect.off('mouseleave')
    }
  }

  onEnter = (drawEventPramas: DrawEventPramas) => {
    const { stage } = drawEventPramas
    const img = ImageUtil.getImage(stage);
    img.on("mouseenter", () => stage.container().style.cursor = 'crosshair');
    img.on("mouseleave", () => stage.container().style.cursor = 'default');
  }

  onDrawStart = (drawEventPramas: DrawEventPramas) => {
    // 当鼠标移出 stage 时，不会触发 mouseup，重新回到 stage 时，会重新触发 onDrawStart，这里就是为了防止重新触发 onDrawStart
    if (this.isPaint) return

    const { stage } = drawEventPramas

    if (document.getElementById(this.toolbarId)) return
    const startPos = PointUtil.getPointPos(stage);
    if (!PointUtil.isPointInImage(startPos, ImageUtil.getImage(stage))) return;
    this.isPaint = true


    this.virtualLayer = new Konva.Layer()
    stage.add(this.virtualLayer)
    this.virtualLayer.setZIndex(2)

    // 绘制透明黑色遮罩
    const zoom = ZoomUtil.getZoomConfig(drawEventPramas.zoom);
    const img = ImageUtil.getImage(drawEventPramas.stage);
    const config = zoom.innerzoom ? {
      x: img.x(),
      y: img.y(),
      width: img.width(),
      height: img.height(),
    } : {
        x: 0,
        y: 0,
        width: stage.width() / stage.scale().x,
        height: stage.height() / stage.scale().y,
      };
    const maskRect = new Konva.Rect({
      globalCompositeOperation: 'source-over',
      ...config,
      fill: 'rgba(0, 0, 0, .6)',
    })

    this.virtualLayer.add(maskRect)

    this.rect = new Konva.Rect({
      x: startPos.x,
      y: startPos.y,
      fill: '#FFF',
      draggable: true,
      globalCompositeOperation: 'destination-out'
    })
    this.rect.on('mouseenter', function () {
      stage.container().style.cursor = 'move'
    })
    this.rect.on('mouseleave', function () {
      stage.container().style.cursor = 'default'
    })

    this.virtualLayer.add(this.rect)

    this.virtualLayer.draw()
  }

  onDraw = (drawEventPramas: DrawEventPramas) => {
    if (!this.isPaint) return
    if (document.getElementById(this.toolbarId)) return

    const { stage } = drawEventPramas;
    let endPos = PointUtil.getPointPos(stage);
    // 绘制初始裁剪区域
    const startPos = PointUtil.getPointPos(stage, { x: this.getRectX(), y: this.getRectY() });
    const img = ImageUtil.getImage(stage);
    endPos = {
      x: PointUtil.boundpos(endPos.x, [0, 0], [img.x(), img.x() + img.width()]),
      y: PointUtil.boundpos(endPos.y, [0, 0], [img.y(), img.y() + img.height()]),
    };
    // 限制大小
    this.rect.width((endPos.x - startPos.x));
    this.rect.height(endPos.y - startPos.y);
    // 拖拽范围
    this.rect.dragBoundFunc((pos: any) => {
      pos = PointUtil.getPointPos(stage, pos);

      this.adjustToolbarPosition(stage)
      const { x, y } = pos;
      const trans = this.transformer;
      const point = {
        x: PointUtil.boundpos(x, [0, trans.width()], [img.x(), img.x() + img.width()]),
        y: PointUtil.boundpos(y, [0, trans.height()], [img.y(), img.y() + img.height()])
      };
      // 映射回原值
      return PointUtil.getOriPos(stage, point);
    })

    this.virtualLayer.draw()
  }

  onDrawEnd = (drawEventPramas: DrawEventPramas) => {
    const { stage, pixelRatio, reload } = drawEventPramas

    if (!this.isPaint) {
      this.isPaint = false
      return
    }

    this.isPaint = false

    // 允许改变裁剪区域
    this.transformer = new Konva.Transformer({
      node: this.rect,
      ...transformerStyle,
      boundBoxFunc: (oldBox: any, newBox: any) => {
        let x = newBox.x
        let y = newBox.y
        let width = newBox.width
        let height = newBox.height
        // 把位置点和对角点的范围限制在bound内
        const img = ImageUtil.getImage(stage);
        let start = { x: newBox.x, y: newBox.y };
        let end = { x: newBox.x + newBox.width, y: newBox.y + newBox.height };
        start = {
          x: PointUtil.boundpos(start.x, [0, 0], [img.x(), img.x() + img.width()]),
          y: PointUtil.boundpos(start.y, [0, 0], [img.y(), img.y() + img.height()]),
        };
        end = {
          x: PointUtil.boundpos(end.x, [0, 0], [img.x(), img.x() + img.width()]),
          y: PointUtil.boundpos(end.y, [0, 0], [img.y(), img.y() + img.height()]),
        };
        this.adjustToolbarPosition(stage)
        return { x: start.x, y: start.y, width: end.x - start.x, height: end.y - start.y } as any
      },
    })
    this.virtualLayer.add(this.transformer)
    this.virtualLayer.draw()

    this.createCropToolbar(stage, () => {
      // 裁剪区域太小不允许裁剪
      if (this.getRectWidth() < 2 || this.getRectHeight() < 2) return

      // 提前清除拉伸框
      this.virtualLayer.remove(this.transformer)
      const dataURL = stage.toDataURL({
        x: this.getRectX(),
        y: this.getRectY(),
        width: this.getRectWidth(),
        height: this.getRectHeight(),
        pixelRatio,
        mimeType: 'image/jpeg',
      })
      const imageObj = new Image()
      imageObj.onload = () => {
        /**@todo zoomin模式的图片裁剪：保持canvas size,保持图片位置，不要黑框 */
        reload(imageObj, this.getRectWidth(), this.getRectHeight())
        this.reset(stage)
      }
      imageObj.src = dataURL
      stage.container().style.cursor = 'crosshair'
    }, () => {
      this.reset(stage)
      stage.container().style.cursor = 'crosshair'
    })
    this.adjustToolbarPosition(stage)
  }

  onLeave = (drawEventPramas: DrawEventPramas) => {
    const { stage } = drawEventPramas
    this.reset(stage)
    const img = ImageUtil.getImage(stage);
    if (img) {
      img.off('mouseenter')
      img.off('mouseleave')
    }
    stage.container().style.cursor = 'default'
    this.isPaint = false
  }
}