import React from "react";
import Draggable from 'react-draggable';
import { isNum, int, innerWidth, innerHeight, outerWidth, outerHeight } from "../tools/HelperUitl";
export default class DragWrapper extends React.Component<any, any>{
    constructor(props: any) {
        super(props);
        this.state = {
            x: 0,
            y: 0
        };
    }

    setPos(pos: { x: number, y: number }) {
        this.setState(pos);
    }

    resetPos(pos: { x?: number, y?: number }, reset: boolean = false) {
        const newpos = {
            x: this.state.x + (pos.x || 0),
            y: this.state.y + (pos.y || 0)
        };
        if (reset) {
            this.dragMove(null, { ...newpos, node: this.dragref });
        } else {
            this.setState(newpos);
        }
    }

    getBounds(node: any) {
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
        return parentBounds;
    }

    dragMove(e: any, data: any): void | false {
        // 参照react-draggable获取父元素边界
        const { x, y, node } = data; // 当前位置
        const parentBounds = this.getBounds(node);
        // 该边界是否在parent内[可能有right>left的情形]
        const getNewPos = (val: number, boda: number, bodb: number) => {
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
    dragref = null;
    render() {
        const { x, y } = this.state;
        const dragcls = this.props.disabled ? "nodarg" : "candrag";
        return (
            <Draggable onDrag={this.dragMove.bind(this)} disabled={this.props.disabled} position={{ x, y }}>
                <div className={`react-img-editor-dragbox ${dragcls}`} ref={(c: any) => this.dragref = c}>
                    {this.props.children}
                </div>
            </Draggable>
        );
    }
}