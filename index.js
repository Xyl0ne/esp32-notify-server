const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Hello");
});

app.listen(8080, "0.0.0.0", () => {
    console.log("Listening on 8080");
});