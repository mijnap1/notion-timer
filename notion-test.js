import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const notionIntegrationToken = process.env.NOTION_TOKEN || "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";
const databaseId = process.env.NOTION_DATABASE_ID || "16fc761a07d88087a7a6f60fe800053e";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Ensure this route handles only POST requests to "/"
app.post("/", async (req, res) => {
    const { task, startTime, stopTime } = req.body;

    if (!task || !startTime || !stopTime) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const notionUrl = "https://api.notion.com/v1/pages";
    const data = {
        parent: { database_id: databaseId },
        properties: {
            Name: { title: [{ text: { content: task } }] },
            Date: {
                date: {
                    start: new Date(startTime).toISOString(),
                    end: new Date(stopTime).toISOString(),
                },
            },
        },
    };

    try {
        const response = await fetch(notionUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${notionIntegrationToken}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            res.status(200).json({ message: "Task saved successfully." });
        } else {
            const errorDetails = await response.json();
            res.status(500).json({ error: "Failed to save task to Notion.", details: errorDetails });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

// Catch-all route for frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
