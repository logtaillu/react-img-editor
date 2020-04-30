import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventParams, PluginParamName, PluginParamValue } from '../common/type'
import { transformerStyle } from '../common/constants'
import { uuid } from '../common/utils'
import PointUtil from '../tools/PointUtil'

export default class Line extends Plugin {
  name = 'line'
  iconfont = 'iconfont icon-line2'
  title = '插入直线'
  params = ['strokeWidth', 'lineType', 'color'] as PluginParamName[]
  defalutParamValue = {
    strokeWidth: 2,
    lineType: 'solid',
    color: '#F5222D',
  } as PluginParamValue
  shapeName = 'line'

  lastLine: any = null
  transformer: any = null
  selectedNode: any = null
  isPaint = false
  started = false
  startPoints = [0, 0]

  enableTransform = (DrawEventParams: DrawEventParams, node: any) => {
    const { stage, drawLayer } = DrawEventParams

    if (!this.transformer) {
      this.transformer = new Konva.Transformer({ ...transformerStyle, rotateEnabled: true })
      drawLayer.add(this.transformer)
      this.transformer.attachTo(node)
      node.on('mouseenter', function () {
        stage.container().style.cursor = 'move'
      })
      node.on('mouseleave', function () {
        stage.container().style.cursor = 'default'
      })
      stage.container().style.cursor = 'move'
    }

    node && node.draggable(true)
    drawLayer.draw()
  }

  disableTransform = (DrawEventParams: DrawEventParams, node: any, remove?: boolean) => {
    const { stage, drawLayer, historyStack } = DrawEventParams

    if (this.transformer) {
      this.transformer.remove()
      this.transformer = null
    }

    if (node) {
      node.draggable(false)
      node.off('mouseenter')
      node.off('mouseleave')
      stage.container().style.cursor = 'default'

      if (remove) {
        node.hide()
        // 使用隐藏节点占位并覆盖堆栈中已有节点
        historyStack.push(node.toObject())
        node.remove()
      }
    }

    this.selectedNode = null
    drawLayer.draw()
  }

  onEnter = (DrawEventParams: DrawEventParams) => {
    const { stage, drawLayer } = DrawEventParams
    const container = stage.container()
    container.tabIndex = 1 // make it focusable
    container.focus()
    container.addEventListener('keyup', (e: any) => {
      if (e.key === 'Backspace' && this.selectedNode) {
        this.disableTransform(DrawEventParams, this.selectedNode, true)
        drawLayer.draw()
      }
    })
  }

  onClick = (DrawEventParams: DrawEventParams) => {
    const { event } = DrawEventParams

    if (event.target.name && event.target.name() === 'line') {
      // 之前没有选中节点或者在相同节点之间切换点击
      if (!this.selectedNode || this.selectedNode._id !== event.target._id) {
        this.selectedNode && this.disableTransform(DrawEventParams, this.selectedNode)
        this.enableTransform(DrawEventParams, event.target)
        this.selectedNode = event.target
      }
    } else {
      this.disableTransform(DrawEventParams, this.selectedNode)
    }
  }

  onDrawStart = () => {
    this.isPaint = true
  }

  onDraw = (DrawEventParams: DrawEventParams) => {
    const { stage, drawLayer, paramValue, historyStack } = DrawEventParams

    if (!this.isPaint || this.transformer) return

    if (!this.started) {
      const pos = PointUtil.getPointPos(stage);
      this.startPoints = [pos.x, pos.y]
      const strokeColor = (paramValue && paramValue.color) ? paramValue.color : this.defalutParamValue.color
      this.lastLine = new Konva.Line({
        id: uuid(),
        name: 'line',
        stroke: strokeColor,
        strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defalutParamValue.strokeWidth,
        globalCompositeOperation: 'source-over',
        points: this.startPoints,
        dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
        dash: [8],
        fill: strokeColor,
        strokeScaleEnabled: true,
      })
      this.lastLine.on('transformend', function () {
        historyStack.push(this.toObject())
      })
      this.lastLine.on('dragend', function () {
        historyStack.push(this.toObject())
      })
      drawLayer.add(this.lastLine)
      this.started = true
    }

    const pos = PointUtil.getPointPos(stage);
    this.lastLine.points([this.startPoints[0], this.startPoints[1], pos.x, pos.y])
    drawLayer.batchDraw()
  }

  onDrawEnd = (DrawEventParams: DrawEventParams) => {
    const { historyStack } = DrawEventParams
    // mouseup event is triggered by move event but click event
    if (this.started) {
      this.disableTransform(DrawEventParams, this.selectedNode)
      if (this.lastLine) {
        historyStack.push(this.lastLine.toObject())
      }
    }
    this.isPaint = false
    this.started = false
  }

  onLeave = (DrawEventParams: DrawEventParams) => {
    this.isPaint = false
    this.started = false
    this.disableTransform(DrawEventParams, this.selectedNode)
  }

  onNodeRecreate = (DrawEventParams: DrawEventParams, node: any) => {
    const { historyStack } = DrawEventParams
    node.on('transformend', function () {
      historyStack.push(this.toObject())
    })
    node.on('dragend', function () {
      historyStack.push(this.toObject())
    })
  }
}