// Database Router -----------------------------------------------------------

// Router for database administration tasks.

// External Modules ----------------------------------------------------------

import {Request, Response, Router} from "express";

// Internal Modules ----------------------------------------------------------

import DatabaseServices from "../services/DatabaseServices";
import {requireDatabase} from "../oauth/OAuthMiddleware";

// Public Objects ------------------------------------------------------------

const DatabaseRouter = Router({
    strict: true,
});

DatabaseRouter.post("/backup",
    async (req: Request, res: Response) => {
        res.send(await DatabaseServices.backup());
    });

DatabaseRouter.post("/dump",
    requireDatabase,
    async (req: Request, res: Response) => {
        res.header("Content-Type", "text/plain")
            .send(await DatabaseServices.dump());
    });

DatabaseRouter.delete("/purge",
    requireDatabase,
    async (req: Request, res: Response) => {
        res.send(await DatabaseServices.purge());
    });

export default DatabaseRouter;
