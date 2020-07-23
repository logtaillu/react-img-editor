## Forked from [YaoKaiLun/react-img-editor](https://github.com/YaoKaiLun/react-img-editor)
1. 添加缩放和旋转功能
2. 根据自己项目需求修改了样式、字体等配置，处理canvas释放
3. 背景图去除了，可以用`className="mosic"`加上(innerzoom下)
4. 下载时默认jpg以减小图片大小，会按照原始尺寸下载（ignore zoom）

### todo
1. 具体那个修改释放了canvas?

### 备注
1. 缩放位置：1.还原中点位置=>2.还原当前点位置（保持某个点位置不变）
2. ie兼容： 可以加mdn-polyfills，缺什么引什么
3. 内部zoom:stage维度操作，空白处也可以触发滚动缩放

***
# react-img-editor · 图像编辑器

react-img-editor 是一个图像编辑器 react 组件，支持对图片进行裁剪、涂鸦、文字编辑、马赛克处理等操作，同时支持自定义插件和灵活的样式配置。

![示例](https://s2.ax1x.com/2020/02/16/39gZcD.png)

## ✨ 特性

- 支持自由画笔、矩形、圆形、箭头、文字、马赛克的绘制
- 支持橡皮擦、撤销操作、截图和图片下载
- 支持自定义插件和工具栏配置
- 支持矩形、圆形、箭头、文字等节点的拉伸、拖拽和删除
- 支持同一页面多个组件同时存在

## 📦 下载

```
npm install react-img-editor -S
```

## 🔨 引入和使用

```
import ReactImgEditor from 'react-img-editor'
import 'react-img-editor/assets/index.css'

<ReactImgEditor src="https://www.w3schools.com/html/img_girl.jpg" />
```

## API（补充自定义量）

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片 url | string | - |
| width | 画板宽度 | number? | 700 |
| height | 画板高度 | number? | 500 |
| style | 画板样式 | React.CSSProperties | - |
| plugins | 自定义的插件 | Plugin[] | [] |
| toolbar | 工具栏配置 | { items: string[] } | {items: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text', 'repeal', 'download', 'crop','zoomin','zoomout','rotate']} |
| getStage | 获取 KonvaJS 的 [Stage](https://konvajs.org/api/Konva.Stage.html) 对象，可用于下载图片等操作 | (stage: any) => void |
| defaultPluginName | 默认选中的插件名称 | string? | - |
|closePlugin|获取关闭plugin的函数，例如如果下载按钮在外部，可以在下载前关闭plugin的辅助线框|func=>void|-|
|stageEvents|启用的stage事件列表，目前有`zoomOnWheel` `zoomOnWheel`|string[\]|[]|
|active|是否显示，图片列表防止canvas过多占用内存用|boolean|true
|loadingComponent|加载中组件|React.ReactNode|-|
|zoom|缩放配置|object|详情见下|
|activeResize|active=false时是否重置回原始大小|boolean|false|
|className|样式类名|string|-|

zoom
| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
|rate|toolbar的缩放单次比例|number|1.1|
|maxrate|最大缩放比例|number|2|
|maxsize|单边最大缩放大小(px),0代表不限制|number|0|
|minrate|最小缩放比例|number|0.5|
|minsize|单边最小缩放大小(px),0代表不限制|number|0|
|period|缩放事件触发间隔(period内最多触发一次),0代表不限制|number|0|
|wheelrate|鼠标滚动缩放单次比例|number|1.1|
|innerzoom|true代表固定stage大小的缩放模式，false代表canvas缩放模式|boolean|true|
|dragTarget|拖拽对象，代表了拖拽触发范围,innerzoom时有效|`img` &vert; `stage`| `stage`|
