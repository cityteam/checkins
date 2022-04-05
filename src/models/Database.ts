// Database ------------------------------------------------------------------

// Database integration and configured Sequelize object.

// External Modules ----------------------------------------------------------

require("custom-env").env(true);
import {Sequelize} from "sequelize-typescript";

// Internal Modules ----------------------------------------------------------

import AccessToken from "./AccessToken";
import Ban from "./Ban";
import Checkin from "./Checkin";
import Facility from "./Facility";
import Guest from "./Guest";
import RefreshToken from "./RefreshToken";
import Template from "./Template";
import User from "./User";
import logger from "../util/ServerLogger";

// Configure Database Instance ----------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : "test";

export const Database = new Sequelize(DATABASE_URL, {
    logging: false,
    pool: {
        acquire: 30000,
        idle: 10000,
        max: 5,
        min: 0
    }
});

Database.addModels([
    AccessToken,
    Ban,
    Checkin,
    Facility,
    Guest,
    RefreshToken,
    Template,
    User,
]);

logger.info({
    context: "Startup",
    msg: "Sequelize models initialized",
    dialect: `${Database.getDialect()}`,
    name: `${Database.getDatabaseName()}`,
});

export default Database;
