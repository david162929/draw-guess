/* global describe it before after beforeEach afterEach */
const expect = require("chai").expect;
const http = require("http");
const ioS = require("socket.io");
const ioC = require("socket.io-client");
const drawSocket = require("./../socket_io/draw.js");

// 讓全域的遊戲相關變數可以存取
const globalCst = require("../util/global.js");
const guestAlias = globalCst.guestAlias;
const rooms = globalCst.rooms;
const topic = globalCst.topic;
// const GameDetail = globalCst.GameDetail;
const clients = globalCst.clients;
const ClientDetail = globalCst.ClientDetail;
const RoomDetail = globalCst.RoomDetail;
const Ranking = globalCst.Ranking;
const timerId = globalCst.timerId;

let client1;
let client2;
let client3;
let httpServer;
let ioServer;
const host = "http://localhost";
const port = 4000;
const namespace = "/draw";


/**
 * 建立 server 端
 * @return {Promise} 回傳成功連線訊息提示
 */
function createServer() {
    return new Promise((reso, rej) => {
        try {
            drawSocket(ioServer);
            reso("創建 socket server 成功!");
        } catch (err) {
            rej(err);
        }
    });
}

/**
 * 建立 client 端
 * @return {Promise} 回傳成功連線的 socket client 端
 */
function createClient() {
    return new Promise((reso, rej) => {
        try {
            const socket = ioC.connect(`${host}:${port}${namespace}`, {
                "reconnection delay": 0,
                "reopen delay": 0,
                "force new connection": true,
                "transports": ["websocket"]
            });
            socket.on("connect", () => {
                reso(socket);
            });
        } catch (err) {
            rej(err);
        }
    });
}


/**
 * 創建 http server 與 掛上 socket.io server side
 */
before((done) => {
    console.log(">>> 創建 socket server...");
    httpServer = http.Server().listen(port);
    ioServer = ioS(httpServer);

    createServer().then((res) => {
        console.log(res);
        console.log(">>> 建立 socket.io client 端...");

        client1 = createClient();
        client2 = createClient();
        client3 = createClient();

        Promise.all([client1, client2, client3]).then((array) => {
            client1 = array[0];
            client2 = array[1];
            client3 = array[2];
            console.log("建立 socket.io client 端成功!");
            done();
        }).catch((e) => {
            console.log(e);
        });
    }).catch((e) => {
        console.log(e);
    });
});

/**
 *  測試完畢關閉 server
 */
after((done) => {
    console.log(">>> 測試完畢關閉 socket.io client 端");
    if (client1.connected) {
        client1.close();
    }
    if (client2.connected) {
        client2.close();
    }
    if (client3.connected) {
        client3.close();
    }

    console.log(">>> 測試完畢關閉 server");
    ioServer.close();
    httpServer.close();

    done();
});

/**
 * 建立 socket.io client 端
 */
/* beforeEach((done) => {

}); */

/**
 * 測試完畢關閉 socket.io client 端
 */
/* afterEach((done) => {

}); */

describe("開始測試 socket.io server 端...", () => {
    it("測試所有 client 連線成功", (done) => {
        expect(rooms).to.have.property("room_1");
        expect(rooms["room_1"].clients).to.have.lengthOf(3);
        done();
    });
    it("改使用者 ID 事件 change-user-id 測行為", (done) => {
        client1.emit("change-user-id", "Neo");
        client1.once("send-user-id", (userId) => {
            expect(userId).to.equal("Neo");
            expect(clients[client1.id].userId).to.equal("Neo");
            done();
        });
    });
    it("改使用者 ID 事件 change-user-id 多參數", (done) => {
        client1.emit("change-user-id", "Neo", "Morpheus");
        client1.once("send-user-id", (userId) => {
            expect(userId).to.equal("Neo");
            expect(clients[client1.id].userId).to.equal("Neo");
            done();
        });
    });
    it("改使用者 ID 事件 change-user-id 測空字串", (done) => {
        client1.emit("change-user-id", "");
        client1.once("send-user-id", (userId) => {
            let str = guestAlias();
            str = str.slice(0, 9) + (parseInt(str.charAt(9))-1);
            expect(userId).to.equal(str);
            expect(clients[client1.id].userId).to.equal(str);
            done();
        });
    });
    it("改使用者 ID 事件 change-user-id 不輸入", (done) => {
        client1.emit("change-user-id");
        client1.once("send-user-id", (userId) => {
            let str = guestAlias();
            str = str.slice(0, 9) + (parseInt(str.charAt(9))-1);
            expect(userId).to.equal(str);
            expect(clients[client1.id].userId).to.equal(str);
            done();
        });
    });
    it("改使用者 ID 事件 change-user-id 奇怪輸入", (done) => {
        client1.emit("change-user-id", "true");
        client1.once("send-user-id", (userId) => {
            expect(userId).to.equal("true");
            expect(clients[client1.id].userId).to.equal("true");
            done();
        });
    });
});
