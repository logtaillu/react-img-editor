import Plugin from './plugins/Plugin'

export interface DrawEventPramas {
  stage: any;
  imageLayer: any;
  layer: any;
  paramValue: PluginParamValue | null;
  imageData: ImageData;
  reload: (imageObj: any, rectWidth: number, rectHeigh: number, imginfo?: any) => void;
  historyStack: any[];
  pixelRatio: number;
  event?: any;
  plugins: Plugin[];
  dragNode: any;
  currentPluginRef?: any;
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
  innerzoom?: boolean;
  dragTarget?: "img" | "stage"
}