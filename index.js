const express = require("express");
const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

// ==========================
// Firebase
// ==========================
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// ==========================
// Telegram
// ==========================
const BOT_TOKEN = "8968729641:AAFZjjFZo55YiTLE1tk6cLNZ0YsyE5Gf-l0"; 
const CHAT_ID = "5279773215";

async function sendTelegram(message) {
    try {
        await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                chat_id: CHAT_ID,
                text: message,
            }
        );

        console.log("Telegram message sent.");
    } catch (err) {
        console.error("Telegram Error:");
        console.error(err.response?.data || err.message);
    }
}

// ==========================
// Home
// ==========================
app.get("/", (req, res) => {
    res.send("ESP32 Notification Server is Running!");
});

// ==========================
// Flutter Notification Test
// ==========================
app.get("/test", async (req, res) => {

    const message = {
        notification: {
            title: "Alert",
            body: "Battery is low! Saving mode enabled.",
        },
        topic: "esp32_alerts",
    };

    try {

        const response = await admin.messaging().send(message);

        console.log(response);

        res.send("Flutter notification sent!");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.message);

    }

});

// ==========================
// Telegram Test
// ==========================
app.get("/telegram", async (req, res) => {

    await sendTelegram("🚀 Telegram test from Render!");

    res.send("Telegram message sent!");

});

// ==========================
// Flutter + Telegram Test
// ==========================
app.get("/alert", async (req, res) => {

    const message = {
        notification: {
            title: "ESP32 Alert",
            body: "This is a combined Flutter + Telegram notification.",
        },
        topic: "esp32_alerts",
    };

    try {

        await admin.messaging().send(message);

        await sendTelegram(
            "🚨 ESP32 Alert\nThis is a combined Flutter + Telegram notification."
        );

        res.send("Flutter + Telegram notification sent!");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.message);

    }

});

// ==========================
// ESP32 Endpoint
// ==========================
app.post("/notify", async (req, res) => {

    const { title, body } = req.body;

    const message = {
        notification: {
            title,
            body,
        },
        topic: "esp32_alerts",
    };

    try {

        await admin.messaging().send(message);

        await sendTelegram(`📢 ${title}\n\n${body}`);

        res.send("Notification sent.");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.message);

    }

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});