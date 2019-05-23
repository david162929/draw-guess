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
  如果是創房者，提供前端 Game start 按鈕觸發`game-start`事件

#### toGetUpdateDataURL
- 動作：
  進房者要求當前畫布內容，向 Server 端發出 `reqDataURL` 事件

#### freeze
- 動作：
  凍結用戶端繪圖操作，啟動計時動畫。

#### game-run
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| topic | String | 當前的題目 |

- 動作：
  顯示題目，啟動計時動畫。

#### next-turn
- 動作：
  進入下一回合，移除 topic。

#### your-turn
- 動作：
  發送 `game-start` 事件。

#### updateCurrentUser
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| usr | String | 當前回合繪畫者 |

- 動作：
  更新當前回合繪畫者。

#### send-gameStatus
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| gStatus | String | 當前回合狀態 |

- 動作：
  如果當前狀態是遊戲進行中，則發送`join-after-game-start`事件。

#### send-user-id
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| userId | String | 使用者 ID |

- 動作：
  更新使用者名稱。

#### rankingList-update
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| rankingList | Array | 排名列表 |

- 動作：
  更新排行榜。

#### wait-next-turn
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| gStatus | String | 當前回合狀態 |
| userName | String | 繪畫使用者名稱 |
| topic | String | 題目 |

- 動作：
  啟動計時動畫，回合狀態重置，印出提示訊息。

#### provide-timer-process
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| id | String | 要求來源的使用者 `socket.id` |

- 動作：
  擷取當前計時狀態，發送`return-timer-process`事件。

#### update-timer-process
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| width | String | 計時動畫長度 |
| color | String | 計時動畫顏色 |

- 動作：
  更新計時進程。

#### freeze-only
- 動作：
  凍結使用者。

#### provide-draw-status
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| id | String | 要求來源的使用者 `socket.id` |

- 動作：
  提供繪圖樣式指令，發送 `return-draw-status`事件。

#### update-draw-status
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| style | Object | 繪圖樣式 |

- 動作：
  更新繪圖樣式。

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


#### change-user-id
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| userName | String | 使用者 ID |

- 動作：
  若使用者 ID 為空，則自動生成訪客 ID，發送`send-user-id`事件。

#### join-room
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| lastRoomId | String | 上個房間 ID |
| roomId | String | 當前房間 ID |

- 動作：
  - 離開上個房間(`leave-succeed`)，更新使用者與房間的狀態
  - 清除上個遊戲畫面與計時器(`clearBoard`)
  - 加入房間，更新使用者與房間的狀態
  - 更新遊戲狀態
  - 對單一使用者發送：`room-owner-status`、`toGetUpdateDataURL`、`send-gameStatus`
  - 對房內所有使用者發送：`join-succeed`
  - 對所有使用者發送：`update-index-room-list`

#### send-chat-message
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 當前房間 ID |
| userName | String | 使用者 ID |
| msg | String | 聊天室訊息 |

- 動作：對房內所有使用者發送：`send-chat-message`

#### game-start
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 當前房間 ID |
| userName | String | 使用者 ID |

- 動作：
  - 驗證使用者身分跟狀態
  - 重置遊戲狀態
  - 對單一使用者發送：`game-run`
  - 對房內所有使用者發送：`freeze`、`clearBoard`、`updateCurrentUser`
  - 啟動計時器

#### send-answer-message
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 當前房間 ID |
| userName | String | 使用者 ID |
| msg | String | 聊天室訊息 |

- 動作：
  - 檢查使用者猜題狀態、當前遊戲狀態
  - 沒猜中，對所有使用者發送：`send-chat-message`
  - 猜中，依據遊戲狀態發送事件：`send-chat-message`、`hit-correct-message`
  - 若全員猜中，自動進入下一回合：`wait-next-turn`
  - 清除計時器

#### join-after-game-start
- 動作：
  - 中途加入遊戲
  - 對單一使用者發送：`clearBoard`、`freeze-only`
  - 對房內使用者發送：`provide-timer-process`、`provide-draw-status`

#### return-timer-process
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| id | String | 要求來源的使用者 `socket.id` |
| width | String | 計時動畫長度 |
| color | String | 計時動畫顏色 |

- 動作：取得當前計時器狀態，對單一使用者發送：`update-timer-process`

#### return-draw-status
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| id | String | 要求來源的使用者 `socket.id` |
| style | Object | 繪圖樣式 |

- 動作：取得當前繪圖狀態，對單一使用者發送：`update-draw-status`

#### disconnect
- 動作：
  - 檢查使用者狀態
  - 清除計時
  - 對上一個房間發送事件：`leave-succeed`
  - 對所有使用者發送：`update-index-room-list`

#### reqDataURL
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 房間 ID |

- 動作：
  回應新加入者的要求，向其他玩家要求當前畫面。

#### resDataURL
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 房間 ID |
| dataURL | String | 當前畫面 |

- 動作：
  所有玩家更新當前畫面。

#### down-draw
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 房間 ID |
| posX | Number | X 軸座標 |
| posY | Number | Y 軸座標 |

- 動作：
  驗證使用者身分與狀態，通過才發送 `down-draw` 事件。

#### move-draw
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 房間 ID |
| posX | Number | X 軸座標 |
| posY | Number | Y 軸座標 |
| lastPosX | Number | 上個瞬間的 X 軸座標 |
| lastPosY | Number | 上個瞬間的 Y 軸座標 |

- 動作：
  驗證使用者身分與狀態，通過才發送 `move-draw` 事件。

#### leave-draw
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 房間 ID |
| posX | Number | X 軸座標 |
| posY | Number | Y 軸座標 |
| lastPosX | Number | 上個瞬間的 X 軸座標 |
| lastPosY | Number | 上個瞬間的 Y 軸座標 |

- 動作：
  驗證使用者身分與狀態，通過才發送 `leave-draw` 事件。

#### enter-draw
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| roomId | String | 房間 ID |
| posX | Number | X 軸座標 |
| posY | Number | Y 軸座標 |
| lastPosX | Number | 上個瞬間的 X 軸座標 |
| lastPosY | Number | 上個瞬間的 Y 軸座標 |

- 動作：
  驗證使用者身分與狀態，通過才發送 `enter-draw` 事件。

#### change-color
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| color | String | 畫筆顏色 |

- 動作：
  驗證使用者身分與狀態，通過才發送 `change-color` 事件。

#### change-line-width
- Parameters：

| Field |  Type  | Description           |
| :---: | :----: | :-------------------- |
| width | String | 畫筆粗細 |

- 動作：
  驗證使用者身分與狀態，通過才發送 `change-line-width` 事件。
