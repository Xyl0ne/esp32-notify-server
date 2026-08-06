const express = require("express");
const admin = require("firebase-admin");
require("dotenv").config();

const axios = require("axios");

const BOT_TOKEN = "8968729641:AAFZjjFZo55YiTLE1tk6cLNZ0YsyE5Gf-l0";
const CHAT_ID = "5279773215";


// If using Render environment variable:
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// If testing locally with service-account.json instead, use:
// const serviceAccount = require("./service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());

async function sendTelegram(message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        await axios.post(url, {
            chat_id: CHAT_ID,
            text: message
        });

        console.log("Telegram message sent!");
    } catch (err) {
        console.error(err.response?.data || err.message);
    }
}


app.get("/telegram", async (req, res) => {

    await sendTelegram("🚀 Telegram test from Render!");

    res.send("Telegram message sent!");
});


// Home page
app.get("/", (req, res) => {
    res.send("ESP32 Notification Server is Running!");
});

// ===== TEST NOTIFICATION =====
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
        console.log("Notification sent:", response);
        res.send("✅ Notification sent!");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// ===== ESP32 ENDPOINT =====
app.post("/notify", async (req, res) => {
    const { title, body } = req.body;

    const message = {
        notification: { title, body },
        topic: "esp32_alerts",
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent:", response);
        res.send("sent");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});