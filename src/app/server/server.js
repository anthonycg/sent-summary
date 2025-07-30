import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { commentsRouter } from "./routes/routes";

dotenv.config();

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

app.use("/", commentsRouter);

app.listen(port, () => {
    console.log(`Listening on PORT:${port}`);
});
