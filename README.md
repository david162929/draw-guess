# Godoodle
Godoodle 是一個多人即時的繪畫互動遊戲平台，透過 Node.js 建構在 AWS EC2 之上。核心技術使用 Socket.IO 來實現即時的遊戲互動機制，繪畫則以 Canvas 來模擬畫布行為。

[https://davidadm.com](https://davidadm.com)


## 特點
- 可任意創建遊戲房間
- 支援多人遊玩
- Real-time 呈現個別玩家的動作
- 藉由繪圖與對話聊天室進行遊戲互動
- 支援玩家中途加入遊戲
- 限時回合制
- Server-side 進行遊戲機制與邏輯處理，Client-side 進行繪圖處理，防止 Client-side 的 hack

## 開始使用
### 創建遊戲房
進入 [https://davidadm.com](https://davidadm.com) 首頁，左側 `PLAYER INFO` 輸入任意玩家名稱與任意的房間名稱，點選 Play 即可創建遊戲房。

### 加入遊戲房
首頁右側 `JOIN ROOM` 會出現當前已存的遊戲房間，可點選該遊戲房直接加入，或是在左側 `PLAYER INFO` 輸入 Room name 並點選 Play 來加入該房間。

### 開始遊戲
第一位創建房間的玩家可以等待所有玩家進房後，點擊 `Game start` 開始遊戲，遊戲開始後會在上方出現本回合題目，該回合玩家需要在畫布上畫出題目，供其他玩家猜測。
右側為聊天室，其他玩家在聊天室當中輸入本回合猜測的答案，若答對就會得分，答錯仍然可繼續猜測，越快猜對分數越高。

## Socket.IO
### Namespace 命名空間
- `/`：用於整個網站相關的資訊傳遞，如網站在線總人數。
- `/draw`：用於遊戲進行時的相關資訊傳遞，如繪圖指令。

### Front-End 事件監聽列表
- #### 整體遊戲功能
  - update-index-room-list
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

### Backend 事件監聽列表
- ####
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