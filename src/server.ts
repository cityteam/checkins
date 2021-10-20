// server --------------------------------------------------------------------

// Overall Express server for the CityTeam Checkins application.

// External Modules ----------------------------------------------------------

require("custom-env").env(true);
export const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Internal Modules ----------------------------------------------------------

import Database from "./models/Database";
import ExpressApplication from "./routers/ExpressApplication";
import logger from "./util/ServerLogger";

// Configure Models and Associations -----------------------------------------

Database.getDatabaseName(); // Trigger initialization of Database module

// Configure and Start Server ------------------------------------------------

ExpressApplication.listen(PORT, () => {
    logger.info({
        context: "Startup",
        msg: "Server started",
        mode: NODE_ENV,
        port: PORT,
    });
});
