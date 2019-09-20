
const OriginalWebSocket = window.WebSocket;

const mockWebSockets = [];
const websockets = [];

export function mockWebSocket({ uri, handler }) {
    let listening = false;
    let hasCalls = false;

    const mock = {
        isListening: (mockUri) => {
            return (listening && mockUri === uri);
        },
        listen: () => {
            listening = true;
            return {
                cancel: () => {
                    listening = false;
                }
            };
        },
        receive: ({ data: receiveData }) => {
            hasCalls = true;

            handler({
                data: receiveData,
                respond: (sendData) => mock.send(sendData)
            });
        },
        send: (sendData) => {
            for (const websocket of websockets) {
                if (websocket.readyState === WebSocket.OPEN && websocket.onmessage) {
                    websocket.onmessage({
                        data: sendData
                    });
                    return;
                }
            }
        },
        expect: () => {
            listening = true;
            return {
                done: () => {
                    listening = false;
                    if (!hasCalls) {
                        throw new Error('Expected websocket calls');
                    }
                }
            };
        }
    };

    mockWebSockets.push(mock);

    return mock;
}

function SyncWebSocket(socketUri) {

    const getListeningMock = () => {
        for (let i = (mockWebSockets.length - 1); i >= 0; i--) {
            const mock = mockWebSockets[i];

            if (mock.isListening(socketUri)) {
                return mock;
            }
        }
    };

    const socket = {
        readyState: WebSocket.OPEN,
        send: (data) => {
            if (socket.readyState !== WebSocket.OPEN) {
                throw new Error('Socket is closed');
            }

            const mock = getListeningMock();
            if (mock) {
                mock.receive({ data });
                return;
            }
        },
        close: () => {
            socket.readyState = WebSocket.CLOSED;
            if (socket.onclose) {
                socket.onclose();
            }
        },
        get onopen() {
            return socket._onopen;
        },
        set onopen(value) {
            socket._onopen = value;
            if (getListeningMock()) {
                socket._onopen();
            }
        },
        get onerror() {
            return socket._onerror;
        },
        set onerror(value) {
            socket._onerror = value;
            if (!getListeningMock()) {
                socket._onerror(new Error(`No socket server found`));
            }
        },
        get onclose() {
            return socket._onclose;
        },
        set onclose(value) {
            socket._onclose = value;
            if (!getListeningMock()) {
                socket._onclose();
            }
        }
    };

    websockets.push(socket);

    return socket;
}

SyncWebSocket.OPEN = WebSocket.OPEN;
SyncWebSocket.CLOSED = WebSocket.CLOSED;

export function patchWebSocket() {
    window.WebSocket = SyncWebSocket;
}
