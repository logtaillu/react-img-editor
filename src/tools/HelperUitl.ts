export function getComputedStyle(node: HTMLElement): any {
    return node && node.ownerDocument && node.ownerDocument.defaultView &&
        node.ownerDocument.defaultView.getComputedStyle &&
        node.ownerDocument.defaultView.getComputedStyle(node) || {};
}
// copy from react-draggable

export function isNum(num: any): boolean {
    return typeof num === 'number' && !isNaN(num);
}

export function int(a: string): number {
    return parseInt(a, 10);
}

export function outerHeight(node: HTMLElement): number {
    // This is deliberately excluding margin for our calculations, since we are using
    // offsetTop which is including margin. See getBoundPosition
    let height = node.clientHeight;
    const computedStyle = getComputedStyle(node);
    height += int(computedStyle.borderTopWidth);
    height += int(computedStyle.borderBottomWidth);
    return height;
}

export function outerWidth(node: HTMLElement): number {
    // This is deliberately excluding margin for our calculations, since we are using
    // offsetLeft which is including margin. See getBoundPosition
    let width = node.clientWidth;
    const computedStyle = getComputedStyle(node);
    width += int(computedStyle.borderLeftWidth);
    width += int(computedStyle.borderRightWidth);
    return width;
}
export function innerHeight(node: HTMLElement): number {
    let height = node.clientHeight;
    const computedStyle = getComputedStyle(node);
    height -= int(computedStyle.paddingTop);
    height -= int(computedStyle.paddingBottom);
    return height;
}

export function innerWidth(node: HTMLElement): number {
    let width = node.clientWidth;
    const computedStyle = getComputedStyle(node);
    width -= int(computedStyle.paddingLeft);
    width -= int(computedStyle.paddingRight);
    return width;
}

export function blobTest() {
    if (!HTMLCanvasElement.prototype.toBlob) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
            value: function (callback: any, type: any, quality: any) {
                var canvas = this;
                setTimeout(function () {
                    var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
                    var len = binStr.length;
                    var arr = new Uint8Array(len);

                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }

                    callback(new Blob([arr], { type: type || 'image/png' }));
                });
            }
        });
    }
}