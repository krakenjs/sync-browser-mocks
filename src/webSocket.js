
const mockWebSockets = [];

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
        receive: ({ data: receiveData, socket }) => {
            hasCalls = true;

            handler({
                data: receiveData,
                send: (sendData) => {
                    if (socket.onmessage) {
                        socket.onmessage({
                            data: sendData
                        });
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
                    mock.receive({ data, socket });
                    return;
                }
            }
        },
        close: () => {
            socket.readyState === WebSocket.CLOSED;
        }
    };

    setTimeout(() => {
        if (socket.onopen) {
            socket.onopen();
        }
    });

    return socket;
}

export function patchWebSocket() {
    window.WebSocket = SyncWebSocket;
}
