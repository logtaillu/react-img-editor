
import Konva from 'konva'
import { PluginProps } from '../type'

let lastRect: any = null
let isPaint = false
let startPoint = [0, 0]
const defalutParamValue = {
  strokeWidth: 2,
  color: '#df4b26',
}

export default {
  name: 'rect',
  iconfont: 'iconfont icon-square',
  params: ['strokeWidth', 'lineType', 'color'],
  onDrawStart: ({stage, layer, paramValue}) => {
    isPaint = true

    const pos = stage.getPointerPosition()
    startPoint = [pos.x, pos.y]
    lastRect = new Konva.Rect({
      stroke: (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      x: pos.x,
      y: pos.y,
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
    })
    layer.add(lastRect)
  },

  onDraw: ({stage, layer}) => {
    if (!isPaint) return

    const pos = stage.getPointerPosition()
    lastRect.width(pos.x - startPoint[0])
    lastRect.height(pos.y - startPoint[1])
    layer.batchDraw()
  },

  onDrawEnd: ({historyStack}) => {
    isPaint = false
    historyStack.push(lastRect)
  },
}  as PluginProps