//Global Object
function createGuestAlias() {
	let guestAliasNum = 9452;
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

class GameDetail {
	constructor () {
		this.orderNum = 0;
		this.correctClients = [];
		this.correct = 0;
		this.gameStatus = "wait";
		this.currentDraw = "";
		// this.drawTimerId = null;
	}
}

class Ranking {
	constructor (socketId, userId) {
		this.socketId = socketId;
		this.score = 0;
		this.userId = userId;
	}
}

class RoomDetail {
	constructor (roomId) {
		this.roomId = roomId;
		this.clients = [];
		this.gameDetail = new GameDetail();
		this.rankingList = [];
	}
}

const rooms = {
	room_1: new RoomDetail("room_1")
};

class ClientDetail {
	constructor (socketId, roomId, userId) {
		this.socketId = socketId;
		this.room = roomId;
		this.userId = userId || guestAlias();
	}
}
const clients = {};

const topic = ["蘋果", "香蕉", "鳳梨", "芭樂", "草莓", "椰子", "檸檬", "柳橙", "柚子", "荔枝", "葡萄"];

const timerId = {};

module.exports = {
    guestAlias: guestAlias,
    GameDetail: GameDetail,
    Ranking: Ranking,
    RoomDetail: RoomDetail,
    rooms: rooms,
    ClientDetail: ClientDetail,
    clients: clients,
	topic: topic,
	timerId: timerId
};