const express = require("express");
const globalCst = require("../util/global.js");
const router = express.Router();

router.get("/rooms-detail", (req, res) => {
    res.send(globalCst.rooms);
});

module.exports = router;