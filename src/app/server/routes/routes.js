import express from "express";
import {
    getSummaries,
    saveComment,
    summarizeComments,
} from "../controllers/comments";

const app = express();
const router = app.router();

export const commentsRouter = () => {
    router.get("/getSummaries", (req, res) => {
        return getSummaries(req, res);
    });

    router.post("/saveComment,", (req, res) => {
        return saveComment(req, res);
    });

    router.post("/summarize", (req, res) => {
        return summarizeComments(req, res);
    });
};
