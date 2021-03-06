const express = require("express");
const fs = require("fs");
const path = require("path");

// eslint-disable-next-line new-cap
const router = express.Router();

/* router.get("/", (req, res) => {
    let html = fs.readFileSync("./public/html/index.html", "utf8");
    res.send(html);
}); */

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/index.html"));
});

/* router.get("/", (req, res) => {
    res.render("index.pug");
}); */

router.get("/draw-board", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/draw-board.html"));
});

router.get("/image-change", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/image-change.html"));
});

router.get("/draw-board-test", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/draw-board-test.html"));
});

router.get("/test-board", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/game-room.html"));
});


module.exports = router;
