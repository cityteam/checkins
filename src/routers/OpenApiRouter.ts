// OpenApiRouter -------------------------------------------------------------

// Express endpoint to generate an openapi.json response describing the REST
// APIs supported by this application.

// External Modules ----------------------------------------------------------

import {Request, Response, Router} from "express";
import {assembly} from "../openapi/Assembly";

// Public Objects ------------------------------------------------------------

export const OpenApiRouter = Router({
    strict: true,
});

export default OpenApiRouter;

// Open API Routes ----------------------------------------------------------

OpenApiRouter.get("/", (req: Request, res: Response) => {
    res.header("Content-Type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .send(assembly());
})
