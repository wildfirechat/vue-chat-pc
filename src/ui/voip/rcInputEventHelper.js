/**
 * 主控方注册远程控制/协助相关事件监听
 * @param {CallSession} session 当前音视频通话的 session
 * @param {HTMLVideoElement} remoteScreenVideoElement 渲染对方屏幕共享流的 video 元素
 */
export default function registerRemoteControlEventListener(session, remoteScreenVideoElement) {
    _keydownEventListener = (event) => {
        console.log(`key down: ${event.code}`);
        let options = {
            event: 'wf_rc_event',
            args: {
                e: 'keydown',
                c: event.code
            }
        };
        session.sendRemoteControlInputEvent(options);
    }
    document.addEventListener('keydown', _keydownEventListener);

    _keyupEventListener = (event) => {
        console.log(`key up: ${event.code}`);
        let options = {
            event: 'wf_rc_event',
            args: {
                e: 'keyup',
                c: event.code
            }
        };
        session.sendRemoteControlInputEvent(options);
    }
    document.addEventListener('keyup', _keyupEventListener);
    // click 事件，应当由被控端，自行根据 mousedown and mouseup 触发
    // remoteScreenVideoElement.addEventListener('click', (event) => {
    //     console.log(`Mouse click: ${event.button}, ${event.clientX}, ${event.clientY}`);
    //     let xy = _adjustRCXY(event, remoteScreenVideoElement)
    //     if (!xy) {
    //         return
    //     }
    //         let options = {
    //             event: 'wf_rc_event',
    //             args: {
    //                 e: 'click',
    //                 btn: event.button,
    //                 ...xy
    //             }
    //         };
    //         session.sendRemoteControlInputEvent(options);
    // });
    remoteScreenVideoElement.addEventListener('mousemove', (event) => {
        // console.log(`Mouse position: ${event.clientX}, ${event.clientY}`);
        let xy = _adjustRCXY(event, remoteScreenVideoElement)
        if (!xy) {
            return
        }
        let options = {
            event: 'wf_rc_event',
            args: {
                e: 'mv',
                ...xy
            }
        };
        session.sendRemoteControlInputEvent(options);
    });

    remoteScreenVideoElement.addEventListener('mousedown', (event) => {
        console.log(`Mouse down: ${event.button}, ${event.clientX}, ${event.clientY}`);
        let xy = _adjustRCXY(event, remoteScreenVideoElement)
        if (!xy) {
            return
        }

        let options = {
            event: 'wf_rc_event',
            args: {
                e: 'mousedown',
                btn: event.button,
                ...xy
            }
        };
        session.sendRemoteControlInputEvent(options);
    });

    remoteScreenVideoElement.addEventListener('mouseup', (event) => {
        console.log(`Mouse up: ${event.button}, ${event.clientX}, ${event.clientY}`);
        let xy = _adjustRCXY(event, remoteScreenVideoElement)
        if (!xy) {
            return
        }

        let options = {
            event: 'wf_rc_event',
            args: {
                e: 'mouseup',
                btn: event.button,
                ...xy
            }
        };
        console.log('send mouse up event', options );
        session.sendRemoteControlInputEvent(options);
    });

    remoteScreenVideoElement.addEventListener('wheel', (event) => {
        //deltaMode 0是按像素滚动，1是按行滚动，2是按页滚动。
        //lib只能处理按行滚动，一次事件滚动一行
        console.log(`Mouse wheel before: ${event.deltaX}, ${event.deltaY}, ${event.deltaMode}`);
        _deltaXSum += event.deltaX;
        _deltaYSum += event.deltaY;

        if (Math.abs(_deltaXSum) < 15 && Math.abs(_deltaYSum) < 15) {
            return
        }
        console.log(`Mouse wheel: ${_deltaYSum}, ${_deltaYSum}, ${event.deltaMode}`);
        let delta;
        let axis;
        if (Math.abs(_deltaXSum) > Math.abs(_deltaYSum)) {
            delta = _deltaXSum > 0 ? 1 : -1;
            axis = 0;
        } else {
            delta = _deltaYSum > 0 ? 1 : -1;
            axis = 1;
        }

        _deltaXSum = 0;
        _deltaYSum = 0;

        let options = {
            event: 'wf_rc_event',
            args: {
                e: 'wheel',
                delta: delta,
                axis: axis,
            }
        };
        session.sendRemoteControlInputEvent(options);
    });
}

export function unregisterRemoteControlEventListener() {
    document.removeEventListener('keydown', _keydownEventListener);
    document.removeEventListener('keyup', _keyupEventListener);
}

function _adjustRCXY(event, remoteScreenVideoElement) {
    let x = event.offsetX;
    let y = event.offsetY;
    let rcSW = remoteScreenVideoElement.videoWidth
    let rcSH = remoteScreenVideoElement.videoHeight
    let videoElWidth = remoteScreenVideoElement.clientWidth
    let videoElHeight = remoteScreenVideoElement.clientHeight;
    let scaledVideoWidth = videoElWidth
    let scaledVideoHeight = videoElHeight

    // 保持宽高比缩放
    // object-fit: contain;
    let xMargin = 0
    let yMargin = 0
    if (rcSW / videoElWidth > rcSH / videoElHeight) {
        // 宽度填满，缩放高度
        scaledVideoHeight = rcSH / rcSW * videoElWidth;
        yMargin = (videoElHeight - scaledVideoHeight)
    } else {
        scaledVideoWidth = videoElHeight / rcSH * rcSW
        xMargin = (videoElWidth - scaledVideoWidth)
    }

    if (xMargin > 0 && (x < xMargin / 2 || x > xMargin / 2 + scaledVideoWidth)) {
        return undefined
    }

    if (yMargin > 0 && (y < yMargin / 2 || y > yMargin / 2 + scaledVideoHeight)) {
        return undefined
    }

    x = x - xMargin / 2
    y = y - yMargin / 2

    return {
        x: x * rcSW / scaledVideoWidth,
        y: y * rcSH / scaledVideoHeight
    }
}

let _deltaXSum = 0;
let _deltaYSum = 0;

let _keydownEventListener = null;
let _keyupEventListener = null;
