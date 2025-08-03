import express, {type  Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import { config } from "./config";
import connectDB from "./db/connectDb";
import articleRoutes from "./routes/articleRoutes";

export class App {
    private _app: Application;
    constructor() {
        this._app = express();
        this._setupMiddlewares();
        this._setupRoutes();
    }

    private _setupMiddlewares() {
        this._app.use(
            cors({
                origin: config.frondEndUrl,
                credentials: true
            })
        )
        this._app.use(express.json());
        this._app.use(express.urlencoded({extended: true}));
        this._app.use(cookieParser());
    }

    private _setupRoutes() {
        this._app.use("/api/", authRoutes);
        this._app.use("/api/", articleRoutes);
    }

    public listen(port: number): void {
        this._app.listen(port, () => {
            connectDB();
            console.log(`Server started on port ${port}`);
        })
    }
}