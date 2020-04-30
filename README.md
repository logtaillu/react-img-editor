## fork过来的，根据自己的项目需要做些修改

## 备注
1. 缩放位置：还原中点位置=>2.还原当前点位置（保持某个点位置不变）
2. ie兼容： 可以加mdn-polyfills，缺什么引什么

## todo
1. zoominner下的裁剪、文本框位置有误
2. 原图不一定占满=>初始就让它居中，缩放、旋转、拖拽可以以stage为基准，但是download/dragBound要注意，跟image大小与stage大小有关[ok]
3. 初始缩放的倍率应该用于zoom判断[ok]

2. crop范围（zoom情况下)
3. 文字块:字先出来，先这样吧