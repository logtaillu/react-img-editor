import Konva from 'konva'
import Plugin from '../plugins/Plugin'
import React, { useEffect, useRef, useState } from 'react'
import { PluginParamValue, DrawEventPramas, IZoomConfig } from '../type'
import { prefixCls } from '../constants'
import { uuid } from '../utils'
import { defaultStageEvents } from "../tools/stageEvents/StageEventType";
import DragWrapper from './DragWrapper'
import PointUtil from '../tools/PointUtil'
import ZoomUtil from '../tools/ZoomUtil'
import ImageUtil from "../tools/ImageUtil";
import { ZoomByScale } from "../tools/stageEvents/ZoomOnWheel";
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
  activeResize?: boolean;
  closePlugin?: any;
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
    const maphandle = (handle: Function) => (props.stageEvents || []).map(eventname => {
      if (defaultStageEvents[eventname]) {
        const curevents = defaultStageEvents[eventname] || [];
        curevents.map(curevent => {
          handle(curevent);
          stageRef.current.off(curevent.eventName);
          stageRef.current.on(curevent.eventName, (e: any) => curevent.handle(getDrawEventPramas(e), e));
        })
      }
    });
    maphandle((curevent: any) => stageRef.current.off(curevent.eventName));
    maphandle((curevent: any) => stageRef.current.on(curevent.eventName, (e: any) => curevent.handle(getDrawEventPramas(e), e)));
  }

  function getDragInfo() {
    const zoomconfig = ZoomUtil.getZoomConfig(props.zoom);
    return {
      draggable: zoomconfig.innerzoom && zoomconfig.dragTarget === "stage",
      // 限制在四边内
      dragBoundFunc: zoomconfig.innerzoom ? (pos: { x: number, y: number }) => {
        const stage = stageRef && stageRef.current;
        const img = ImageUtil.getImage(stage);
        if (!stage || !img) {
          return pos;
        }
        const { x, y } = pos;
        const info = ImageUtil.getImageInfo(stage);
        // height: [info.y,info.y+info.height]=>[0,stage.height()]
        return {
          x: PointUtil.boundpos(x, [info.x, info.x + info.width], [0, stage.width()]),
          y: PointUtil.boundpos(y, [info.y, info.y + info.height], [0, stage.height()])
        };
      } : undefined
    };
  }

  function initPalette() {
    const zoomconfig = ZoomUtil.getZoomConfig(props.zoom);
    const size = zoomconfig.innerzoom ? style : { width: canvasWidth, height: canvasHeight };
    stageRef.current = new Konva.Stage({
      container: containerIdRef.current,
      ...size,
      ...getDragInfo()
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
    const target = ZoomUtil.getZoomConfig(props.zoom).dragTarget === "stage" ? stageRef.current :
      ImageUtil.getImage(stageRef.current);
    if (target) {
      target.on("mouseenter touchstart", (e: any) => {
        const touches = e.evt && e.evt.touches || [];
        if (!currentPlugin && touches.length < 2) {
          stageRef.current.draggable(true);
          stageRef.current.container().style.cursor = 'move';
        }
      });
      target.on("mouseleave touchend", (e: any) => {
        const touches = e.evt && e.evt.touches || [];
        if (!currentPlugin && touches.length < 2) {
          stageRef.current.draggable(false);
          stageRef.current.container().style.cursor = 'default';
        }
      });
    }
  }

  function removeEvents() {
    if (!stageRef.current) return

    stageRef.current.off('click tap')
    stageRef.current.off('mousedown touchstart')
    stageRef.current.off('mousemove touchmove')
    stageRef.current.off('mouseup touchend')
    const target = ZoomUtil.getZoomConfig(props.zoom).dragTarget === "stage" ? stageRef.current :
      ImageUtil.getImage(stageRef.current);
    if (target) {
      target.off('mouseenter touchstart')
      target.off('mouseleave touchend')
    }
  }

  function reload(imgObj: any, width: number, height: number, imgInfo?: any) {
    removeEvents()
    historyStack.current = []
    stageRef.current = new Konva.Stage({
      container: containerIdRef.current,
      width: width,
      height: height,
      ...getDragInfo()
    })
    stageRef.current._pixelRatio = pixelRatio
    props.getStage && props.getStage(stageRef.current)
    if (imgInfo) {
      imgInfo.x = (width - imgInfo.width) / 2;
      imgInfo.y = (height - imgInfo.height) / 2;
    }
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
    if (dragRef && dragRef.current && !ZoomUtil.getZoomConfig(props.zoom).innerzoom) {
      const dragNode = dragRef.current;
      const center = PointUtil.getCenterPos(dragNode);
      dragNode.setPos({ x: center.x, y: center.y });
    }
  }

  useEffect(() => {
    initPalette()
    drawImage()
    layerRef.current = new Konva.Layer()
    stageRef.current.add(layerRef.current)
    if (props.closePlugin) {
      props.closePlugin(closePlugin.bind(this));
    }

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
  const [saveSize, setSaveSize] = useState<{ width: number, height: number } | null>(null);

  // 范围改变
  useEffect(() => {
    if (stageRef && stageRef.current) {
      if (props.active) {
        stageRef.current.size({ width: props.width, height: props.height });
      }
      const func = stageRef.current.getDragBoundFunc();
      const pos = stageRef.current.position();
      if (ZoomUtil.getZoomConfig(props.zoom).innerzoom) {
        setSaveSize({ width: props.width, height: props.height });
        const img = ImageUtil.getImage(stageRef.current);
        if (img) {
          const oldpos = img.position();
          img.position({ x: (props.width - img.width()) / 2, y: (props.height - img.height()) / 2 });
          const newpos = img.position();
          stageRef.current.position({ x: stageRef.current.x() + oldpos.x - newpos.x, y: stageRef.current.y() + oldpos.y - newpos.y });
        }
      }
      if (func) {
        stageRef.current.position(func(pos));
        stageRef.current.batchDraw();
      }
    }
  }, [props.width, props.height]);

  useEffect(() => {
    if (stageRef && stageRef.current) {
      if (!props.active) {
        if (props.activeResize) {
          // 重置缩放
          ZoomByScale(getDrawEventPramas(null), 1 / stageRef.current.scaleX(), true);
          // 归位
          if (ZoomUtil.getZoomConfig(props.zoom).innerzoom) {
            // 当前中点相对于[0,0]的位置
            const now = PointUtil.getInnerCenter(stageRef && stageRef.current);
            // 初始中点(stage.position(0,0)时)的中点位置
            const stage = stageRef.current;
            const ori = { x: stage.width() * stage.scaleX() / 2, y: stage.height() * stage.scaleY() / 2 }
            const newPos = { x: ori.x - now.x + stage.x(), y: ori.y - now.y + stage.y() };
            const func = stageRef.current.getDragBoundFunc();
            stageRef.current.position(func ? func(newPos) : newPos);
          } else {
            stageRef.current.position({ x: 0, y: 0 });
            if (dragRef && dragRef.current) {
              const dragNode = dragRef.current;
              const center = PointUtil.getCenterPos(dragNode);
              dragNode.setPos({ x: center.x, y: center.y });
            }
          }
        }
        setSaveSize(stageRef.current.size());
        stageRef.current.size({ width: 0, height: 0 });
        stageRef.current.batchDraw();
        // stageRef.current.clear();
      } else if (saveSize) {
        stageRef.current.size(saveSize);
        stageRef.current.batchDraw();
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

  function closePlugin() {
    if (props.currentPlugin && props.currentPlugin.onLeave) {
      props.currentPlugin.onLeave(getDrawEventPramas(null));
    }
    props.handlePluginChange({} as any);
  }

  const config = ZoomUtil.getZoomConfig(props.zoom);
  // innerzoom时不使用draggable,disable掉
  return (
    <div className="offset-bound" style={style}>
      <DragWrapper ref={node => dragRef.current = node} disabled={(!!props.currentPlugin) || config.innerzoom}>
        <div className={`${prefixCls}-palette`}>
          <div id={containerIdRef.current} className={`${prefixCls}-container`} />
        </div>
      </DragWrapper>
    </div>
  )
}