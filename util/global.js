/* ----- Global Object ----- */

/**
 * 自動生成用戶編號，編號會在 1001 ~ 9999 之間循環
 * @return {function} 自動生成用戶編號
 */
function createGuestAlias() {
    let guestAliasNum = 9452;
    /**
     * 編號 +1
     * @return {string} 自動生成用戶編號
     */
    function addOne() {
        if (guestAliasNum === 9999) {
            guestAliasNum = 1000;
        }
        guestAliasNum++;
        return "guest "+guestAliasNum;
    }
    return addOne;
}
const guestAlias = createGuestAlias();

/**
 * 遊戲狀態詳細資訊
 */
class GameDetail {
    /**
     * 遊戲狀態詳細資訊
     */
    constructor() {
        this.orderNum = 0;
        this.correctClients = [];
        this.correct = 0;
        this.gameStatus = "wait";
        this.currentDraw = "";
        // this.drawTimerId = null;
    }
}


/**
 * 得分
 */
class Ranking {
    /**
     * @param {string} socketId 該名使用者的 socket.id
     * @param {*} userId 該名使用者的遊戲 id
     */
    constructor(socketId, userId) {
        this.socketId = socketId;
        this.score = 0;
        this.userId = userId;
    }
}

/**
 * 各房間的詳細資訊
 */
class RoomDetail {
    /**
     * @param {string} roomId 房間 id
     */
    constructor(roomId) {
        this.roomId = roomId;
        this.clients = [];
        this.gameDetail = new GameDetail();
        this.rankingList = [];
    }
}

const rooms = {
    room_1: new RoomDetail("room_1")
};

/**
 * 使用者詳細資訊
 */
class ClientDetail {
    /**
     * @param {string} socketId 該名使用者的 socket.id
     * @param {string} roomId 該名使用者的房間 id
     * @param {string} userId 該名使用者的遊戲 id
     */
    constructor(socketId, roomId, userId) {
        this.socketId = socketId;
        this.room = roomId;
        this.userId = userId || guestAlias();
    }
}
const clients = {};


const topic = ["蘋果", "香蕉", "鳳梨", "芭樂", "草莓", "椰子", "檸檬", "柳橙", "柚子", "荔枝", "葡萄"];
const topic2 = ["鋼琴", "相機", "床", "襯衫", "檯燈", "吊扇", "馬桶", "滑鼠", "長椅", "毛巾", "拖鞋", "洋裝", "枕頭", "蓮蓬頭", "花瓶", "雨傘", "燈泡", "牙刷", "投影機"];

const timerId = {};

module.exports = {
    guestAlias: guestAlias,
    GameDetail: GameDetail,
    Ranking: Ranking,
    RoomDetail: RoomDetail,
    rooms: rooms,
    ClientDetail: ClientDetail,
    clients: clients,
    topic: topic2,
    timerId: timerId
};
