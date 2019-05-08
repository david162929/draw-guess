// server side socket.io
/**
 * 一般 socket 的連線，namespace 為 "/"
 * @param {*} io 掛在 http server 上的 socket.io
 */
function mainSocket(io) {
    let onlineCount = 0;
    io.on("connection", (socket) => {
        onlineCount ++;
        io.emit("online", onlineCount);
        console.log("a user connected.");


        socket.on("disconnect", () => {
            console.log("user disconnected.");
            if (onlineCount > 0) {
                onlineCount -= 1;
            }
            io.emit("online", onlineCount);
        });
    });
}

module.exports = mainSocket;
