/* ---------------Module--------------- */
const express = require("express");

const app = express();


app.get("/", (req, res) => {
	res.send("Wellcome David's Draw-guess!");
});


/* ---------------Port--------------- */
app.listen(8081, () => {
	console.log("this app is running on port 8081.");
});