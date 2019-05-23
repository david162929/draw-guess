## Game Object
### GameDetail
|     Field      |  Type  | Description |
| :------------: | :----: | :----------- |
|    orderNum    | Number | 當前回合數  |
| correctClients | Array  | 當前回合猜對的所有玩家 `socket.id`    |
|    correct     | Number | 當前回合猜對的玩家數   |
|   gameStatus   | String | 表示當前遊戲狀態：<br>wait / start / no-one-hit / all-correct / part-correct |
|  currentDraw   | String | 當前回合擁有繪圖權玩家的 `socket.id`  |

```javascript
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
    }
}
```
### Ranking
| Field    | Type   | Description                        |
| :--------: | :------: | :---------------------------------- |
| socketId | String | 使用者 `socket.id`                 |
| score    | Number | 目前累積得分 |
| userId   | String | 使用者 ID                          |

```javascript
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
```
### RoomDetail
| Field      | Type   | Description |
| :----------: | :------: | :----------- |
| roomId     | String | 遊戲房間 ID |
| clients    | Array | 加入房間的所有玩家 `socket.id` |
| gameDetail | Object | GameDetail 物件 |
| rankingList | Array | 所有玩家的 Ranking 物件 |

```javascript
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
```
### ClientDetail
| Field      | Type   | Description |
| :----------: | :------: | :----------- |
| socketId     | String | 該使用者的 `socket.id` |
| room    | String | 該使用者所在的房間 |
| userId | String | 使用者 ID，如果沒輸入，則自動生成一個訪客 ID |

```javascript
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
```