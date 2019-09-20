
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
                send: (sendData) => {
                    for (const websocket of websockets) {
                        if (websocket.readyState === WebSocket.OPEN && websocket.onmessage) {
                            websocket.onmessage({
                                data: sendData
                            });
                            return;
                        }
                    }
                }
            });
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
    const socket = {
        readyState: WebSocket.OPEN,
        send: (data) => {
            if (socket.readyState !== WebSocket.OPEN) {
                throw new Error('Socket is closed');
            }
            
            for (let i = (mockWebSockets.length - 1); i >= 0; i--) {
                const mock = mockWebSockets[i];

                if (mock.isListening(socketUri)) {
                    mock.receive({ data });
                    return;
                }
            }
        },
        close: () => {
            socket.readyState = WebSocket.CLOSED;
        }
    };

    websockets.push(socket);

    setTimeout(() => {
        if (socket.onopen) {
            socket.onopen();
        }
    });

    return socket;
}

SyncWebSocket.OPEN = WebSocket.OPEN;
SyncWebSocket.CLOSED = WebSocket.CLOSED;

export function patchWebSocket() {
    window.WebSocket = SyncWebSocket;
}
