// ExpressApplication --------------------------------------------------------

// Overall Express application.

// External Modules ----------------------------------------------------------

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
const rfs = require("rotating-file-stream");

// Internal Modules ----------------------------------------------------------

import ApiRouter from "./ApiRouter";
import OpenApiRouter from "./OpenApiRouter";
import OAuthTokenRouter from "../oauth/OAuthTokenRouter";
import {handleOAuthError} from "../oauth/OAuthMiddleware";
import {handleHttpError, handleServerError, handleValidationError} from "../util/Middleware";
import logger from "../util/ServerLogger";
import {toLocalISO} from "../util/Timestamps";

// Public Objects ------------------------------------------------------------

const app = express();

// Configure global middleware
app.use(cors({
    origin: "*",
}));
app.disable("x-powered-by");

// Configure Helmet application security.  For more information:
// https://helmetjs.github.io
app.use(helmet.contentSecurityPolicy());                // TODO ???
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy({ policy: "same-origin" }));
app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));
app.use(helmet.dnsPrefetchControl({ allow: true }));
app.use(helmet.expectCt());                             // TODO ???
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());                                 // TODO: ??
app.use(helmet.ieNoOpen());                             // TODO ???
app.use(helmet.noSniff());                              // TODO ???
app.use(helmet.permittedCrossDomainPolicies());         // TODO ???
app.use(helmet.referrerPolicy());                       // TODO ???
app.use(helmet.xssFilter());                            // TODO ???

// Configure access log management
const ACCESS_LOG = process.env.ACCESS_LOG ? process.env.ACCESS_LOG : "stderr";
morgan.token("date", (req, res): string => {
    return toLocalISO(new Date());
});
const REMOTE_USER_HEADER = "x-ct-username";
morgan.token("remote-user", (req, res): string => {
    let username = "-";
    const header: string | string[] | undefined = req.headers[REMOTE_USER_HEADER];
    if (typeof header === "string") {
        username = header;
    }
    return username;
})
if ((ACCESS_LOG === "stderr") || (ACCESS_LOG === "stdout")) {
    app.use(morgan("combined", {
        skip: function (req, res) {
            return req.path === "/clientLog";
        },
        stream: (ACCESS_LOG === "stderr") ? process.stderr : process.stdout,
    }));
} else {
    app.use(morgan("combined", {
        skip: function (req, res) {
            return req.path === "/clientLog";
        },
        stream: rfs.createStream(ACCESS_LOG, {
            interval: "1d",
            path: "log",
        }),
    }))
}

// Configure body handling middleware
app.use(bodyParser.json({
}));
app.use(bodyParser.text({
    limit: "2mb",
    type: "text/csv",
}));
app.use(bodyParser.urlencoded({
    extended: true,
}));

// Configure static file routing
const CLIENT_BASE = path.resolve("./") + "/client/build";
logger.info({
    context: "Startup",
    msg: "Static File Path",
    path: CLIENT_BASE,
});
app.use(express.static(CLIENT_BASE));

// Configure application-specific routing
app.use("/openapi.json", OpenApiRouter);
app.use("/api", ApiRouter);
app.use("/oauth/token", OAuthTokenRouter);

// Configure error handling (must be last)
app.use(handleHttpError);
app.use(handleValidationError);
app.use(handleOAuthError);
app.use(handleServerError); // The last of the last :-)

// Configure unknown mappings back to the client
app.get("*", (req, res) => {
    res.sendFile(CLIENT_BASE + "/index.html");
});

export default app;
