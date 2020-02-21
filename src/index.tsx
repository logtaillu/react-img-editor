import Plugin from './plugins/Plugin'
import PluginFactory from './plugins/PluginFactory'
import Palette from './components/Palette'
import React, { useEffect, useState } from 'react'
import Toolbar from './components/Toolbar'
import { PluginParamValue } from './type'
interface ReactImageEditorProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  plugins?: Plugin[];
  toolbar?: {
    items: string[];
  };
  src: string;
  getStage?: (stage: any) => void;
  defaultPluginName?: string;
  stageEvents?: string[];//启用默认的几个stage事件
}

export default function ReactImageEditor(props: ReactImageEditorProps) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const image = new Image()
    image.onload = () => {
      setImageObj(image)
    }
    image.crossOrigin = 'anonymous'
    image.src = props.src
  }, [props.src])

  const pluginFactory = new PluginFactory()
  const plugins = [...pluginFactory.plugins, ...props.plugins!]
  let defaultPlugin = null
  let defalutParamValue = {}
  for (let i = 0; i < plugins.length; i++) {
    if (props.defaultPluginName && props.toolbar && plugins[i].name === props.defaultPluginName) {
      defaultPlugin = plugins[i]

      if (defaultPlugin.defalutParamValue) {
        defalutParamValue = defaultPlugin.defalutParamValue
      }

      break
    }
  }

  const [currentPlugin, setCurrentPlugin] = useState<Plugin | null>(defaultPlugin)
  const [currentPluginParamValue, setCurrentPluginParamValue] = useState<PluginParamValue>(defalutParamValue)

  function handlePluginChange(plugin: Plugin) {
    if (currentPlugin && plugin.name === currentPlugin.name) {
      setCurrentPlugin(null);
    } else {
      setCurrentPlugin(plugin)
      plugin.defalutParamValue && setCurrentPluginParamValue(plugin.defalutParamValue)
      if (!plugin.params) {
        setTimeout(() => {
          setCurrentPlugin(null)
        })
      }
    }
  }

  function handlePluginParamValueChange(value: PluginParamValue) {
    setCurrentPluginParamValue(value)
  }

  const style = {
    width: props.width + 'px',
    height: props.height + 'px',
    ...props.style,
  }

  return (
    <div className="react-img-editor" style={style}>
      {
        imageObj ? (
          <div className="offset-bound">
            <Palette
              width={props.width!}
              height={props.height! - 42}
              imageObj={imageObj}
              plugins={plugins!}
              currentPlugin={currentPlugin}
              currentPluginParamValue={currentPluginParamValue}
              getStage={props.getStage}
              handlePluginChange={handlePluginChange}
              stageEvents={props.stageEvents}
            />
            <Toolbar width={props.width!}
              plugins={plugins!}
              toolbar={props.toolbar!}
              currentPlugin={currentPlugin}
              currentPluginParamValue={currentPluginParamValue}
              handlePluginChange={handlePluginChange}
              handlePluginParamValueChange={handlePluginParamValueChange}
            />
          </div>
        ) : null
      }
    </div >
  )
}

ReactImageEditor.defaultProps = {
  width: 700,
  height: 500,
  style: {},
  plugins: [],
  stageEvents: [],
  toolbar: {
    items: ['pen', 'eraser', 'line', 'arrow', 'rect', 'circle', 'mosaic', 'text', 'repeal', 'download', 'crop', 'rotate', 'zoomin', 'zoomout'],
  },
} as Partial<ReactImageEditorProps>