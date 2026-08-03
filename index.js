require("dotenv").config();

const express = require("express");
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("ESP32 Notification Server is Running!");
});

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
        const response = await admin.messaging().send(message);
        console.log("Notification sent:", response);
        res.status(200).json({
            success: true,
            message: response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});