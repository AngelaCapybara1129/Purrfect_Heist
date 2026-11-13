# Purrfect_Heist
喵不可罐：抓開宇宙的縫（Purrfect Heist: Seams of the Universe）

單人第三人稱潛行解謎。依《完整遊戲設計總書 整合版 v3》製作：序章＋四關＋最終關（外圈潛入、三階段 BOSS、月亮消氣逃亡）＋兩種結局與彩蛋。

## 怎麼玩
直接用瀏覽器打開 `index.html`（不需要安裝或架伺服器）。按「開始遊戲」會同時開啟聲音。

| 操作 | 電腦 | 平板 |
|---|---|---|
| 移動／轉視角 | WASD／滑鼠（先點一下畫面），←→ 也能轉 | 左搖桿／右側拖曳 |
| 互動、拿放 | E（有些要按住） | 互動鍵 |
| 畫貓縫 | 按住 F，再按住滑鼠從縫點拖到另一個縫點 | 點「畫縫」後單指拖曳 |
| 形態 | Q 循環；1 普通 2 迷你 3 巨大 4 液體 5 影子 | 形態按鈕 |
| 喵叫／喵聲投射 | 空白鍵／按住 R 瞄準、放開投出 | 喵／投射 |
| 輕腳／探頭／呼嚕 | Shift／按住 C 加 A、D／按住 Z | 對應按鈕 |
| 道具／放下罐罐 | T／G | 道具／放罐 |
| 暫停 | Esc | II |

## 檔案
- `index.html`、`css/game.css`：頁面與 HUD
- `js/core.js`：數值設定（貓縫、狗、BOSS 的測試值都在 `PH.CFG`）與存檔
- `js/world.js`：地圖、碰撞、視線、機關、警戒、檢查點
- `js/seams.js`、`js/player.js`、`js/dogs.js`、`js/boss.js`：貓縫、咪嚕、汪汪秩序局、月亮總督
- `js/levels1.js`、`js/levels2.js`：各關資料（地圖、機關、巡邏路線、提示）
- `js/gfx.js`、`js/models.js`、`js/audio.js`、`js/ui.js`、`js/main.js`：繪圖、模型、聲音、介面、主流程
- `assets/`：配樂（一般關卡、BOSS 戰）；`lib/three.min.js`：Three.js r128
- `tools/validate.js`：`node tools/validate.js --map` 印出每關地圖並檢查路線該通／該擋；`tools/xref.js` 檢查模組間的呼叫
- `index-v1-kitchen.html`、`index-2d.html`：舊版原型，保留備查

除錯：在瀏覽器主控台輸入 `PH.debug.state()` 可看目前狀態；`PH.cheat=true` 會暫時開放所有形態。
