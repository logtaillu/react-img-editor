import Konva from 'konva'
import Plugin from '../plugins/Plugin'
import React, { useEffect, useRef } from 'react'
import { PluginParamValue, DrawEventPramas, IZoomConfig } from '../type'
import { prefixCls } from '../constants'
import { uuid } from '../utils'
import { defaultStageEvents } from "../tools/stageEvents/StageEventType";
import DragWrapper from './DragWrapper'
import PointUtil from '../tools/PointUtil'
import ZoomUtil from '../tools/ZoomUtil'
interface PaletteProps {
  width: number;
  height: number;
  imageObj: HTMLImageElement;
  plugins: Plugin[];
  currentPlugin: Plugin | null;
  currentPluginParamValue: PluginParamValue | null;
  getStage?: (stage: any) => void;
  handlePluginChange: (plugin: Plugin) => void;
  stageEvents: string[];
  active?: boolean;
  zoom?: IZoomConfig;
}

export default function Palette(props: PaletteProps) {
  const style = {
    width: props.width,
    height: props.height,
  }

  const imageNatureWidth = props.imageObj.naturalWidth
  const imageNatureHeight = props.imageObj.naturalHeight
  const wRatio = props.width / imageNatureWidth
  const hRatio = props.height / imageNatureHeight
  const scaleRatio = Math.min(wRatio, hRatio, 1)
  const canvasWidth = Math.round(imageNatureWidth * scaleRatio)
  const canvasHeight = Math.round(imageNatureHeight * scaleRatio)
  const containerIdRef = useRef(prefixCls + uuid())
  const stageRef = useRef<any>(null)
  const imageRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const imageData = useRef<any>(null)
  const historyStack = useRef<any[]>([])
  const pixelRatio = 1 / scaleRatio
  Konva.pixelRatio = pixelRatio
  const currentPluginRef = useRef(props.currentPlugin)
  const dragRef = useRef<any>(null);
  // 有off过程(防止重复绑定)，需要在bindEvents之前
  function bindStageEvents() {
    const maphandle = handle =>(props.stageEvents || []).map(eventname => {
      if (defaultStageEvents[eventname]) {
        const curevents = defaultStageEvents[eventname] || [];
        curevents.map(curevent => {
          handle(curevent);
          stageRef.current.off(curevent.eventName);
          stageRef.current.on(curevent.eventName, (e: any) => curevent.handle(getDrawEventPramas(e), e));
        })
      }
    });
    maphandle(curevent=>stageRef.current.off(curevent.eventName));
    maphandle(curevent=>stageRef.current.on(curevent.eventName, (e: any) => curevent.handle(getDrawEventPramas(e), e)));
  }

  function initPalette() {
    const zoomconfig = ZoomUtil.getZoomConfig(props.zoom);
    const size = zoomconfig.innerzoom ? style : { width: canvasWidth, height: canvasHeight };
    stageRef.current = new Konva.Stage({
      container: containerIdRef.current,
      ...size,
      draggable: zoomconfig.innerzoom,
      // 限制在四边内
      dragBoundFunc: zoomconfig.innerzoom ? pos => {
        const stage = stageRef && stageRef.current;
        const img = imageRef && imageRef.current && imageRef.current.children && imageRef.current.children[0];
        const { x, y } = pos;
        if (!stage || !img) {
          return {
            x: Math.max(x, 0),
            y: Math.max(y, 0)
          }
        }
        // 边界
        const rotation = stage.rotation();
        let size = {
          height: img.height() * stage.scaleY(),
          width: img.width() * stage.scaleX()
        }
        const gap = {
          x: img.x() * stage.scaleX(),
          y: img.y() * stage.scaleY()
        }
        const bounds = [
          { top: -gap.y, bottom: stage.height() - size.height - gap.y, left: -gap.x, right: stage.width() - size.width - gap.x },
          { top: -gap.x, bottom: stage.height() - size.width - gap.x, left: stage.width() + gap.y, right: size.height + gap.y },
          { top: size.height + gap.y, bottom: stage.height() + gap.y, left: stage.width() + gap.x, right: size.width + gap.x },
          { top: size.width + gap.x, bottom: stage.height() + gap.x, left: -gap.y, right: stage.width() - size.height - gap.y }
        ];
        const bound = bounds[rotation / 90];
        return {
          x: PointUtil.boundpos(x, bound.left, bound.right),
          y: PointUtil.boundpos(y, bound.top, bound.bottom)
        };
      } : undefined
    })

    stageRef.current._pixelRatio = pixelRatio;
    bindStageEvents();
    props.getStage && props.getStage(stageRef.current)
    if (dragRef && dragRef.current && !zoomconfig.innerzoom) {
      const dragNode = dragRef.current;
      const center = PointUtil.getCenterPos(dragNode);

      dragNode.setPos({ x: center.x, y: center.y });
    }
  }

  function generateImageData(imgObj: any, width: number, height: number) {
    let canvas: any = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx!.drawImage(imgObj, 0, 0, width, height)
    const data = ctx!.getImageData(0, 0, width, height);
    canvas.remove();
    canvas = null;
    return data;
  }

  function drawImage() {
    const zoomconfig = ZoomUtil.getZoomConfig(props.zoom);
    const size = zoomconfig.innerzoom ? style : { width: canvasWidth, height: canvasHeight };
    const img = new Konva.Image({
      x: (size.width - canvasWidth) / 2,
      y: (size.height - canvasHeight) / 2,
      image: props.imageObj,
      width: canvasWidth,
      height: canvasHeight,
    })

    const imageLayer = new Konva.Layer()
    stageRef.current.add(imageLayer)
    imageLayer.setZIndex(0)
    imageLayer.add(img)
    imageLayer.draw()
    imageRef.current = imageLayer

    imageData.current = generateImageData(props.imageObj, canvasWidth, canvasHeight)
  }

  function getDrawEventPramas(e: any) {
    const drawEventPramas: DrawEventPramas = {
      stage: stageRef.current,
      imageLayer: imageRef.current,
      layer: layerRef.current,
      currentPluginRef: currentPluginRef.current,
      paramValue: props.currentPluginParamValue,
      imageData: imageData.current,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      reload,
      historyStack: historyStack.current,
      pixelRatio,
      event: e,
      plugins: props.plugins,
      dragNode: dragRef.current,
      zoom: props.zoom
    }

    return drawEventPramas
  }

  function bindEvents() {
    if (!stageRef.current) return

    stageRef.current.add(layerRef.current)
    layerRef.current.setZIndex(1)

    const { currentPlugin } = props

    stageRef.current.on('click tap', (e: any) => {
      if (e.target.name && e.target.name()) {
        const name = e.target.name()
        for (let i = 0; i < props.plugins.length; i++) {
          // 点击具体图形，会切到对应的插件去
          if (props.plugins[i].shapeName
            && props.plugins[i].shapeName === name
            && (!currentPlugin || !currentPlugin.shapeName || name !== currentPlugin.shapeName)) {
            (function (event: any) {
              setTimeout(() => {
                props.plugins[i].onClick && props.plugins[i].onClick!(getDrawEventPramas(event))
              })
            })(e)
            props.handlePluginChange(props.plugins[i])
            return
          }
        }
      }

      // 修复 stage 上元素双击事件不起作用
      // if (e.target instanceof Konva.Text) return

      if (currentPlugin && currentPlugin.onClick) {
        currentPlugin.onClick(getDrawEventPramas(e))
      }
    })

    stageRef.current.on('mousedown touchstart', (e: any) => {
      if (currentPlugin && currentPlugin.onDrawStart) {
        currentPlugin.onDrawStart(getDrawEventPramas(e))
      }
    })

    stageRef.current.on('mousemove touchmove', (e: any) => {
      if (currentPlugin && currentPlugin.onDraw) {
        currentPlugin.onDraw(getDrawEventPramas(e))
      }
    })

    stageRef.current.on('mouseup touchend', (e: any) => {
      if (currentPlugin && currentPlugin.onDrawEnd) {
        currentPlugin.onDrawEnd(getDrawEventPramas(e))
      }
    })
  }

  function removeEvents() {
    if (!stageRef.current) return

    stageRef.current.off('click tap')
    stageRef.current.off('mousedown touchstart')
    stageRef.current.off('mousemove touchmove')
    stageRef.current.off('mouseup touchend')
  }

  function reload(imgObj: any, width: number, height: number, imgInfo?: any) {
    removeEvents()
    historyStack.current = []
    stageRef.current = new Konva.Stage({
      container: containerIdRef.current,
      width: width,
      height: height,
    })
    stageRef.current._pixelRatio = pixelRatio
    props.getStage && props.getStage(stageRef.current)

    const img = new Konva.Image({
      image: imgObj,
      ...(imgInfo || {
        x: 0,
        y: 0,
        width: width,
        height: height,
      })
    })

    const imageLayer = new Konva.Layer()
    stageRef.current.add(imageLayer)
    imageLayer.add(img)
    imageLayer.draw()
    imageRef.current = imageLayer
    imageData.current = generateImageData(imgObj, width, height)

    layerRef.current = new Konva.Layer()
    stageRef.current.add(layerRef.current)
    bindStageEvents();
    bindEvents();
  }

  useEffect(() => {
    initPalette()
    drawImage()
    layerRef.current = new Konva.Layer()
    stageRef.current.add(layerRef.current)

    return () => {
      const currentPlugin = currentPluginRef.current
      // unMount 时清除插件数据
      currentPlugin && currentPlugin.onLeave && currentPlugin.onLeave(getDrawEventPramas(null))
      stageRef.current.size({ width: 0, height: 0 });
      stageRef.current.destroy();
    }
  }, [])

  useEffect(() => {
    bindEvents()
    return () => {
      removeEvents()
      bindStageEvents()
    }
  }, [props.imageObj, props.currentPlugin, props.currentPluginParamValue])
  // 临时处理
  useEffect(() => {
    if (!props.active) {
      if (stageRef && stageRef.current) {
        stageRef.current.size({ width: 0, height: 0 });
        stageRef.current.clear();
      }
    }
  }, [props.active]);

  useEffect(() => {
    const prevCurrentPlugin = currentPluginRef.current
    if (props.currentPlugin && prevCurrentPlugin &&
      props.currentPlugin.name !== prevCurrentPlugin.name) {
      prevCurrentPlugin.onLeave && prevCurrentPlugin.onLeave(getDrawEventPramas(null))
    }
    if (prevCurrentPlugin && !props.currentPlugin) {
      prevCurrentPlugin.onLeave && prevCurrentPlugin.onLeave(getDrawEventPramas(null))
    }

    if (props.currentPlugin && props.currentPlugin.onEnter) {
      props.currentPlugin.onEnter(getDrawEventPramas(null))
    }

    currentPluginRef.current = props.currentPlugin;
    if (stageRef && stageRef.current) {
      const zoom = ZoomUtil.getZoomConfig(props.zoom);
      stageRef.current.draggable((!props.currentPlugin) && !!(zoom.innerzoom));
    }
  }, [props.currentPlugin])
  const config = ZoomUtil.getZoomConfig(props.zoom);
  // innerzoom时不使用draggable,disable掉
  return (
    <div className="offset-bound" style={style}>
      <DragWrapper ref={node => dragRef.current = node} disabled={(!!props.currentPlugin) || config.innerzoom}>
        <div className={`${prefixCls}-palette`}>
          <div id={containerIdRef.current} className={`${prefixCls}-container`} style={(!props.currentPlugin) && config.innerzoom ? { cursor: "move" } : {}} />
        </div>
      </DragWrapper>
    </div>
  )
}