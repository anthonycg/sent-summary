import OpenAI from "openai";

const pool = new Pool({
    connectionString: process.env.DB_URL,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const saveComment = async (req, res) => {
    const { district, text, tag } = req.body;

    if (!district || !text) {
        return res
            .status(400)
            .json({ error: "district and text are required." });
    }

    try {
        await pool.query(
            "INSERT INTO comments (district, text, tag) VALUES ($1, $2, $3)",
            [district, text, tag]
        );

        res.status(201).json({ message: "Comment saved!" });
    } catch (error) {
        console.log("DB query error:", error);
        res.status(500).json({ error: "Failed to save comment." });
    }
};

export const summarizeComments = async (req, res) => {
    const district = req.query.district;

    if (!district) {
        return res.status(400).json({ error: "district is required" });
    }

    try {
        // select all comments from specific dist
        const { rows } = await pool.query(
            `SELECT text FROM comments WHERE district = $1 ORDER BY created_at DESC LIMIT 50`,
            [district]
        );

        // setup prompt with openai
        const texts = rows.map((comment) => comment.text);
        const prompt = `You are summarizing civic feedback from District ${district} in Austin, TX. Below are comments from residents:
        ${texts.map((t) => `- ${t}`).join("\n")}
        Summarize the top concerns, praises, and overall sentiment in less than 150 words. Be concise, neutral, and helpful for a political candidate.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const summary = completion.choices[0].message.content?.trim();

        pool.query(
            `INSERT INTO summaries (district, summary, last_updated) VALUES ($1, $2, now())
            ON CONFLICT (district) DO UPDATE
            SET summary = $2, last_updated = now() `,
            [district, summary]
        );

        res.json({ district, summary });
    } catch (error) {
        console.log("OpenAI Summary Error", error);
        res.status(500).json({ error: "Failed to summarize comments" });
    }
};

export const getSummaries = async (req, res) => {
    try {
        await pool.query("SELECT * FROM summaries"); //TODO: may update this query
        res.status(200).json({ message: "Retrieved summaries!" });
    } catch (error) {
        console.log("Get summaries error:", error);
        res.status(500).json({ error: "Error getting summaries." });
    }
};

export default router;
