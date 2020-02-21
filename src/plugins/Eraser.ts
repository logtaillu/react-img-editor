import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas, PluginParamName, PluginParamValue } from '../type'
import { uuid } from '../utils'
import PointUtil from '../tools/PointUtil'

export default class Eraser extends Plugin {
  name = 'eraser'
  iconfont = 'iconfont icon-eraser'
  title = '擦除'
  params = ['strokeWidth'] as PluginParamName[]
  defalutParamValue = {
    strokeWidth: 2,
  } as PluginParamValue

  lastLine: any = null
  isPaint = false

  onDrawStart = (drawEventPramas: DrawEventPramas) => {
    const {stage, layer, paramValue} = drawEventPramas
    const pos = PointUtil.getPointPos(stage);
    this.isPaint = true
    this.lastLine = new Konva.Line({
      id: uuid(),
      stroke: '#df4b26',
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defalutParamValue.strokeWidth,
      globalCompositeOperation: 'destination-out',
      points: [pos.x, pos.y],
    })
    layer.add(this.lastLine)
  }

  onDraw = (drawEventPramas: DrawEventPramas) => {
    if (!this.isPaint) return

    const {stage, layer} = drawEventPramas
    const pos = PointUtil.getPointPos(stage);
    const newPoints = this.lastLine.points().concat([pos.x, pos.y])
    this.lastLine.points(newPoints)
    layer.batchDraw()
  }

  onDrawEnd = (drawEventPramas: DrawEventPramas) => {
    const {historyStack} = drawEventPramas
    this.isPaint = false
    historyStack.push(this.lastLine.toObject())
  }

  onLeave = () => {
    this.isPaint = false
  }
}