import Arrow from './Arrow'
import Circle from './Circle'
import Crop from './Crop'
import Download from './Download'
import Eraser from './Eraser'
import Mosaic from './Mosaic'
import Pen from './Pen'
import Rect from './Rect'
import Repeal from './Repeal'
import Text from './Text'
import Rotate from "./Rotate";
import Zoomin from "./Zoomin";
import Zoomout from "./Zoomout";
import Line from "./Line";

export default class PluginFactory {
  plugins = [
    new Arrow(),
    new Circle(),
    new Crop(),
    new Download(),
    new Eraser(),
    new Mosaic(),
    new Pen(),
    new Rect(),
    new Repeal(),
    new Text(),
    new Rotate(),
    new Zoomin(),
    new Zoomout(),
    new Line()
  ]
}