// RouterMiddleware ----------------------------------------------------------

// Application specific middleware.

// External Modules ----------------------------------------------------------

import {NextFunction, Request, RequestHandler, Response} from "express";

// Internal Modules ----------------------------------------------------------

// Public Functions ----------------------------------------------------------

/**
 * Disable caching for the response to this route.
 */
export const noCache: RequestHandler =
    async (req: Request, res: Response, next: NextFunction) => {
        res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
        res.header("Expires", "-1");
        res.header("Pragma", "no-cache");
        next();
    }
