# Godoodle
Godoodle 是一個多人即時的繪畫互動遊戲平台，透過 Node.js 建構在 AWS EC2 之上。核心技術使用 [Socket.IO](#socketio) 來實現即時的遊戲互動機制，繪畫則以 Canvas 來模擬畫布行為。

[https://davidadm.com](https://davidadm.com)


## 特點
- 可任意創建遊戲房間
- 支援多人遊玩
- Real-time 呈現個別玩家的動作
- 藉由繪圖與對話聊天室進行遊戲互動
- 支援玩家中途加入遊戲
- 限時回合制
- Server-side 進行遊戲機制與邏輯處理，Client-side 進行繪圖處理，防止 Client-side 的 hack
- Event-driven

## 開始使用
### 創建遊戲房
進入 [https://davidadm.com](https://davidadm.com) 首頁，左側 `PLAYER INFO` 輸入任意玩家名稱與任意的房間名稱，點選 Play 即可創建遊戲房。

### 加入遊戲房
首頁右側 `JOIN ROOM` 會出現當前已存的遊戲房間，可點選該遊戲房直接加入，或是在左側 `PLAYER INFO` 輸入 Room name 並點選 Play 來加入該房間。

### 開始遊戲
第一位創建房間的玩家可以等待所有玩家進房後，點擊 `Game start` 開始遊戲，遊戲開始後會在上方出現本回合題目，該回合玩家需要在畫布上畫出題目，供其他玩家猜測。
右側為聊天室，其他玩家在聊天室當中輸入本回合猜測的答案，若答對就會得分，答錯仍然可繼續猜測，越快猜對分數越高。

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

## Socket.IO
### Namespace 命名空間
- `/`：用於整個網站相關的操作，如網站在線總人數。
- `/draw`：用於與遊戲機制相關的操作，如繪圖指令。


### Client-side Socket Event 列表
- #### 整體遊戲功能
  - [update-index-room-list](#update-index-room-list)
  - online
  - join-succeed
  - send-chat-message
  - hit-correct-message
  - leave-succeed
  - room-owner-status
  - toGetUpdateDataURL
  - freeze
  - game-run
  - next-turn
  - your-turn
  - updateCurrentUser
  - send-gameStatus
  - send-user-id
  - rankingList-update
  - wait-next-turn
  - provide-timer-process
  - update-timer-process
  - freeze-only
  - provide-draw-status
  - update-draw-status
- #### 繪圖功能
  - reqDataURL
  - resDataURL
  - down-draw
  - move-draw
  - leave-draw
  - enter-draw
  - change-color
  - change-line-width
  - clearBoard

### Server-side Socket Event 列表
- #### 整體遊戲功能
  - connection
  - change-user-id
  - join-room
  - send-chat-message
  - game-start
  - send-answer-message
  - join-after-game-start
  - disconnect
- #### 繪圖功能
  - reqDataURL
  - resDataURL
  - down-draw
  - move-draw
  - leave-draw
  - enter-draw
  - change-color
  - change-line-width

## Socket Event Detail
### Client-side

#### update-index-room-list
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| rooms | Object | Server 端的總房間資訊 |

- 動作：
  將傳入的總房間物件進行處理，取出所有現存房間的 ID 與使用者人數，更新到前端。

#### online
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| num | Number | 當前在線人數 |

- 動作：
  取得當前在線總人數，執行初始化，發送 `reqDataURL` 事件。

#### join-succeed
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomUserNum | Number | 當前房間在線人數 |

- 動作：
  有玩家加入，更新當前房間在線總人數。

#### send-chat-message
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| userName | String | 使用者 ID |
| msg | String | 猜對通知 |

- 動作：
  收到猜對玩家的猜對通知，顯示到前端。

#### hit-correct-message
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| userName | String | 使用者 ID |
| msg | String | 該名使用者發送的聊天室訊息 |

- 動作：
  收到其他使用者發送的訊息，顯示到前端。

#### leave-succeed
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomUserNum | Number | 當前房間在線人數 |

- 動作：
  有玩家離開，更新當前房間在線總人數。

#### room-owner-status
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomOwnerResult | Boolean | 是否為創房者 |

- 動作：
  如果是創房者，前端創造 Game start 按鈕

#### toGetUpdateDataURL
#### freeze
#### game-run
#### next-turn
#### your-turn
#### updateCurrentUser
#### send-gameStatus
#### send-user-id
#### rankingList-update
#### wait-next-turn
#### provide-timer-process
#### update-timer-process
#### freeze-only
#### provide-draw-status
#### update-draw-status


#### reqDataURL
#### resDataURL
#### down-draw
#### move-draw
#### leave-draw
#### enter-draw
#### change-color
#### change-line-width
#### clearBoard


### Server-side


#### connection
#### change-user-id
#### join-room
#### send-chat-message
#### game-start
#### send-answer-message
#### join-after-game-start
#### disconnect

#### reqDataURL
#### resDataURL
#### down-draw
#### move-draw
#### leave-draw
#### enter-draw
#### change-color
#### change-line-width

## Unit Test 測試 Socket.IO
