//server side socket.io
function mainSocket (io) {
    let onlineCount = 0;
    io.on("connection", (socket) => {
        onlineCount ++;
        io.emit("online", onlineCount);
        console.log("a user connected.");
        
        socket.on("disconnect", () => {
            console.log('user disconnected.');
            if (onlineCount > 0) {
                onlineCount -= 1;
            }
            io.emit("online", onlineCount);
        });
        
        socket.on("hello", (msg) => {
            socket.emit("hi", msg);
        });
        
        socket.on("send", (msg) => {
            //console.log(msg);
            io.emit("msg",msg);
        });
    });
}

module.exports = mainSocket;