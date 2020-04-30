import PubSub from './PubSub'
import { EditorContextProps } from '../components/EditorContext'
import { Stage } from 'konva/types/Stage'
import { Layer } from 'konva/types/Layer'

export interface DrawEventParams extends EditorContextProps {
  event?: any;
  stage: Stage;
  imageLayer: Layer;
  drawLayer: Layer;
  imageData: ImageData;
  reload: (imageObj: any, rectWidth: number, rectHeigh: number) => void;
  historyStack: any[];
  pixelRatio: number;
  pubSub: InstanceType<typeof PubSub>;
  dragNode: any;
  zoom?: IZoomConfig;
}
export type PluginParamName = 'strokeWidth' | 'color' | 'fontSize' | 'lineType'
export interface PluginParamValue {
  strokeWidth?: number;
  color?: string;
  fontSize?: number;
  lineType?: 'solid' | 'dash';
}

export interface IZoomConfig {
  rate?: number;
  maxrate?: number;
  maxsize?: number;
  minrate?: number;
  minsize?: number;
  period?: number;
  wheelrate?: number;
}