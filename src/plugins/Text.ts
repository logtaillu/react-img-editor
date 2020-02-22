import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas, PluginParamValue, PluginParamName } from '../type'
import { transformerStyle } from '../constants'
import { uuid } from '../utils'
import PointUtil from '../tools/PointUtil'

export default class Text extends Plugin {
  name = 'text'
  iconfont = 'iconfont icon-text'
  title = '插入文字'
  params = ['fontSize', 'color'] as PluginParamName[]
  defalutParamValue = {
    fontSize: 14,
    color: '#F5222D',
  } as PluginParamValue
  shapeName = 'text'

  transformer: any = null
  selectedNode: any = null

  removeTextareaBlurModal = () => {
    const textareaBlurModal = document.getElementById('textareaBlurModal')
    if (textareaBlurModal) {
      textareaBlurModal.removeEventListener('click', this.removeTextareaBlurModal)
      document.body.removeChild(textareaBlurModal)
    }
  }

  // 防止 textarea blur 时触发 stage click 事件
  addTextareaBlurModal = (stage: any) => {
    if (document.getElementById('textareaBlurModal')) return

    const container = stage.container().getBoundingClientRect()
    const textareaBlurModal = document.createElement('div')
    textareaBlurModal.id = 'textareaBlurModal'
    textareaBlurModal.style.position = 'fixed'
    textareaBlurModal.style.left = container.left + 'px'
    textareaBlurModal.style.top = container.top + 'px'
    textareaBlurModal.style.width = container.width + 'px'
    textareaBlurModal.style.height = container.height + 'px'
    textareaBlurModal.style.zIndex = '999'

    document.body.appendChild(textareaBlurModal)

    textareaBlurModal.addEventListener('click', this.removeTextareaBlurModal)
  }

  createTextarea = (stage: any, layer: any, transformer: any, textNode: any, historyStack: any) => {
    const textarea = document.createElement('textarea')
    const scale = stage.getScale();
    textarea.value = textNode.text()
    textarea.style.position = 'absolute'
    textarea.style.left = (textNode.x()*scale.x) + 'px'
    textarea.style.top = (textNode.y()*scale.y) + 'px'
    textarea.style.width = "100%";
    textarea.style.overflow="auto";
    textarea.style.wordBreak="break-all";
    textarea.style.height = (textNode.height()*scale.y) + 'px'
    textarea.style.lineHeight = String(textNode.lineHeight())
    textarea.style.padding = textNode.padding() + 'px'
    textarea.style.margin = '0px'
    textarea.style.fontSize = (textNode.fontSize()*scale.x) + 'px'
    textarea.style.color = textNode.fill()
    textarea.style.fontFamily = textNode.fontFamily()
    textarea.style.border = 'none'
    textarea.style.outline = 'none'
    textarea.style.overflow = 'hidden'
    textarea.style.background = 'none'
    textarea.style.resize = 'none'
    textarea.style.zIndex = '1000'
    textarea.style.boxSizing = 'content-box'
    textarea.addEventListener('keyup', (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      textNode.text(e.target.value)
      layer.draw()
      // textarea.style.width = ((textNode.width())*scale.x) + 'px'
      textarea.style.height = (textNode.height()*scale.y) + 'px'
    })

    textarea.addEventListener('blur', () => {
      if (textarea.value !== '') {
        textNode.text(textarea.value)
        transformer.hide()
        textNode.show()
      } else {
        textNode.destroy()
        transformer.destroy()
      }

      textarea.parentNode!.removeChild(textarea)
      layer.draw()
      this.removeTextareaBlurModal()
      historyStack.push(textNode.toObject())
    })

    return textarea
  }

  enableTransform = (drawEventPramas: DrawEventPramas, node: any) => {
    const {stage, layer} = drawEventPramas

    if (!this.transformer) {
      this.transformer = new Konva.Transformer({ ...transformerStyle, enabledAnchors: [], padding: 2 })
      layer.add(this.transformer)
      this.transformer.attachTo(node)
      node.on('mouseenter', function() {
        stage.container().style.cursor = 'move'
      })
      node.on('mouseleave', function() {
        stage.container().style.cursor = 'text'
      })
      stage.container().style.cursor = 'move'
    }

    node && node.draggable(true)
    layer.draw()
  }

  disableTransform = (drawEventPramas: DrawEventPramas, node: any, remove?: boolean) => {
    const {stage, layer, historyStack} = drawEventPramas

    if (this.transformer) {
      this.transformer.remove()
      this.transformer = null
    }

    if (node) {
      node.draggable(false)
      node.off('mouseenter')
      node.off('mouseleave')
      stage.container().style.cursor = 'text'

      if (remove) {
        node.hide()
        // 使用隐藏节点占位并覆盖堆栈中已有节点
        historyStack.push(node.toObject())
        node.remove()
        node.remove()
      }
    }

    this.selectedNode = null
    layer.draw()
  }

  onEnter = (drawEventPramas: DrawEventPramas) => {
    const {stage, layer} = drawEventPramas
    const container = stage.container()
    container.style.cursor = 'text'
    container.tabIndex = 1 // make it focusable
    container.focus()
    container.addEventListener('keyup', (e: any) => {
      if (e.key === 'Backspace' && this.selectedNode) {
        this.disableTransform(drawEventPramas, this.selectedNode, true)
        layer.draw()
      }
    })
  }

  onClick = (drawEventPramas: DrawEventPramas) => {
    const {event, stage, layer, paramValue, historyStack} = drawEventPramas

    if (event.target.name && event.target.name() === 'text') {
      // 之前没有选中节点或者在相同节点之间切换点击
      if (!this.selectedNode || this.selectedNode._id !== event.target._id) {
        this.selectedNode && this.disableTransform(drawEventPramas, this.selectedNode)
        this.enableTransform(drawEventPramas, event.target)
        this.selectedNode = event.target
      }
      return
    } else if (this.selectedNode) {
      this.disableTransform(drawEventPramas, this.selectedNode)
      return
    }

    const fontSize = (paramValue && paramValue.fontSize) ? paramValue.fontSize : this.defalutParamValue.fontSize
    const color = (paramValue && paramValue.color) ? paramValue.color : this.defalutParamValue.color
    const startPos = PointUtil.getPointPos(stage);
    const textNode = new Konva.Text({
      id: uuid(),
      name: 'text',
      x: startPos.x,
      y: startPos.y - 10, // fix konvajs incorrect position of text
      fontSize,
      fill: color,
      padding: 3,
      lineHeight: 1.1,
    })
    textNode.on('dragend', function() {
      historyStack.push(this.toObject())
    })

    // 由于 konvajs 的文本渲染和浏览器渲染的样式不一致，所以使用 Transformer 的边框来代替 textarea 自身的边框
    const textareaTransformer = new Konva.Transformer({
      node: textNode as any,
      enabledAnchors: [],
      rotateEnabled: false,
      borderStroke: color,
    })

    layer.add(textNode)
    layer.add(textareaTransformer)
    textNode.hide()
    layer.draw()

    const textarea = this.createTextarea(stage, layer, textareaTransformer, textNode, historyStack)
    stage.container().appendChild(textarea)
    textarea.focus()
    this.addTextareaBlurModal(stage)

    textNode.on('dblclick dbltap', (e) => {
      // dblclick 前会触发两次 onClick 事件，因此要清楚 onClick 事件里的状态
      this.disableTransform(drawEventPramas, this.selectedNode)

      e.cancelBubble = true
      const textarea = this.createTextarea(stage, layer, textareaTransformer, textNode, historyStack)
      stage.container().appendChild(textarea)
      textarea.focus()
      textNode.hide()
      textareaTransformer.show()
      layer.draw()
      this.addTextareaBlurModal(stage)
    })
  }

  onLeave = (drawEventPramas: DrawEventPramas) => {
    const {stage} = drawEventPramas
    stage.container().style.cursor = 'default'
    this.removeTextareaBlurModal()
    this.disableTransform(drawEventPramas, this.selectedNode)
  }

  onNodeRecreate = (drawEventPramas: DrawEventPramas, node: any) => {
    const {historyStack} = drawEventPramas
    node.on('dragend', function() {
      historyStack.push(this.toObject())
    })
  }
}