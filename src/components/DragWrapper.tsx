import React from "react";
import Draggable from 'react-draggable';
import { innerWidth, innerHeight, outerWidth, outerHeight } from "react-draggable/build/utils/domFns";
import { isNum, int } from 'react-draggable/build/utils/shims';
export default class DragWrapper extends React.Component<any, any>{
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0
        };
    }

    resetPos(pos) {
        this.setState({
            x: this.state.x + (pos.x || 0),
            y: this.state.y + (pos.y || 0)
        });
    }

    dragMove(e, data): void | false {
        // 参照react-draggable获取父元素边界
        const { x, y, node, lastX, lastY } = data; // 当前位置
        const { ownerDocument } = node;
        const parent = node.parentNode;
        const ownerWindow = ownerDocument.defaultView;
        const nodeStyle = ownerWindow.getComputedStyle(node);
        const boundNodeStyle = ownerWindow.getComputedStyle(parent);
        const parentBounds = {
            left: -node.offsetLeft + int(boundNodeStyle.paddingLeft) + int(nodeStyle.marginLeft),
            top: -node.offsetTop + int(boundNodeStyle.paddingTop) + int(nodeStyle.marginTop),
            right: innerWidth(parent) - outerWidth(node) - node.offsetLeft +
                int(boundNodeStyle.paddingRight) - int(nodeStyle.marginRight),
            bottom: innerHeight(parent) - outerHeight(node) - node.offsetTop +
                int(boundNodeStyle.paddingBottom) - int(nodeStyle.marginBottom)
        };
        // 该边界是否在parent内[可能有right>left的情形]
        const getNewPos = (val, boda, bodb) => {
            if (isNum(boda) && isNum(bodb)) {
                const min = Math.min(boda, bodb);
                const max = Math.max(boda, bodb);
                return Math.max(min, Math.min(val, max));
            } else {
                return val;
            }
        }
        const pos = {
            x: getNewPos(x, parentBounds.left, parentBounds.right),
            y: getNewPos(y, parentBounds.top, parentBounds.bottom)
        };
        this.setState(pos);
    }

    render() {
        const { x, y } = this.state;
        return (
            <Draggable onDrag={this.dragMove.bind(this)} disabled={this.props.disabled} position={{ x, y }}>
                {this.props.children}
            </Draggable>
        );
    }
}