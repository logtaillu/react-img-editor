
import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas, PluginParamValue, PluginParamName } from '../type'
import { uuid } from '../utils'
import PointUtil from '../tools/PointUtil'
import ImageUtil from '../tools/ImageUtil'

const tileHeight = 5
const tileWidth = 5

export default class Mosaic extends Plugin {
  name = 'mosaic'
  iconfont = 'iconfont icon-mosaic'
  title = '马赛克'
  params = ['strokeWidth'] as PluginParamName[]
  defalutParamValue = {
    strokeWidth: 2,
  } as PluginParamValue

  isPaint = false
  tiles: any = []
  tileRowSize = 0
  tileColumnSize = 0
  width = 0
  height = 0
  rectGroup: any = null

  drawTile = (tiles: any, drawEventPramas) => {
    const { layer, stage } = drawEventPramas;
    tiles = [].concat(tiles)
    tiles.forEach((tile: any) => {
      if (tile.isFilled) {
        return
      }

      if (!tile.color) {
        const dataLen = tile.data.length
        let r = 0, g = 0, b = 0, a = 0
        for (let i = 0; i < dataLen; i += 4) {
          r += tile.data[i]
          g += tile.data[i + 1]
          b += tile.data[i + 2]
          a += tile.data[i + 3]
        }

        // Set tile color.
        const pixelLen = dataLen / 4
        tile.color = {
          r: Math.round(r / pixelLen),
          g: Math.round(g / pixelLen),
          b: Math.round(b / pixelLen),
          a: Math.round(a / pixelLen),
        }
      }

      const color = tile.color
      const img = ImageUtil.getImage(stage);
      const x = tile.column * tileWidth + img.x()
      const y = tile.row * tileHeight + img.y()
      const w = tile.pixelWidth
      const h = tile.pixelHeight

      const rect = new Konva.Rect({
        globalCompositeOperation: 'source-over',
        x,
        y,
        width: w,
        height: h,
        fill: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`,
      })
      this.rectGroup.add(rect)

      tile.isFilled = true
    })

    layer.add(this.rectGroup)
    layer.draw()
  }

  getTilesByPoint = (x: number, y: number, strokeWidth: number) => {
    const ts: any = []
    let startRow = Math.max(0, Math.floor(y / tileHeight) - Math.floor(strokeWidth / 2))
    const startColumn = Math.max(0, Math.floor(x / tileWidth) - Math.floor(strokeWidth / 2))
    const endRow = Math.min(this.tileRowSize, startRow + strokeWidth)
    const endColumn = Math.min(this.tileColumnSize, startColumn + strokeWidth)

    while (startRow < endRow) {
      let column = startColumn
      while (column < endColumn) {
        ts.push(this.tiles[startRow * this.tileColumnSize + column])
        column += 1
      }
      startRow += 1
    }

    return ts
  }

  onDrawStart = (drawEventPramas: DrawEventPramas) => {
    const { stage, imageData } = drawEventPramas
    this.tiles = []
    const img = ImageUtil.getImage(stage);
    this.width = img.width();
    this.height = img.height();
    // 总是渲染在图片右边了
    this.tileRowSize = Math.ceil(this.height / tileHeight)
    this.tileColumnSize = Math.ceil(this.width / tileWidth)

    this.rectGroup = new Konva.Group({ id: uuid() })

    // 将图片切分成一个个大一点的贴片
    for (let i = 0; i < this.tileRowSize; i++) {
      for (let j = 0; j < this.tileColumnSize; j++) {
        const tile = {
          row: i,
          column: j,
          pixelWidth: tileWidth,
          pixelHeight: tileHeight,
          data: [],
        }

        let data: any = []
        // 转换为像素图形下，起始像素位置
        const pixelPosition = (this.width * tileHeight * tile.row + tile.column * tileWidth) * 4
        // 转换为像素图形下，包含多少行
        const pixelRowAmount = tile.pixelHeight
        // 计算，转换为像素图形使，一个贴片所包含的所有像素数据。先遍历贴片范围内的每一列，每一列中再单独统计行的像素数量
        for (let i = 0; i < pixelRowAmount; i++) {
          // 当前列的起始像素位置
          const position = pixelPosition + this.width * 4 * i
          // 贴片范围内一行的像素数据，等于贴片宽度 * 4
          data = [...data, ...imageData.data.slice(position, position + tile.pixelWidth * 4)]
        }
        tile.data = data
        this.tiles.push(tile)
      }
    }

    this.isPaint = true
  }

  onDraw = (drawEventPramas: DrawEventPramas) => {
    if (!this.isPaint) return

    const { stage, paramValue } = drawEventPramas
    let strokeWidth = (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defalutParamValue.strokeWidth;
    strokeWidth = strokeWidth * stage.scaleX();
    let pos = PointUtil.getPointPos(stage);
    const img = ImageUtil.getImage(stage);
    const imgpos = img.position();
    // 图片范围内draw
    if (PointUtil.isPointInImage(pos, img)) {
      this.drawTile(this.getTilesByPoint(pos.x - imgpos.x, pos.y - imgpos.y, strokeWidth!), drawEventPramas)
    }
  }

  onDrawEnd = (drawEventPramas: DrawEventPramas) => {
    const { historyStack } = drawEventPramas
    this.isPaint = false
    historyStack.push(this.rectGroup.toObject())
  }

  onLeave = () => {
    this.isPaint = false
  }
}