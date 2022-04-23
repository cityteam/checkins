// DatabaseServices ----------------------------------------------------------

// Database administration services.

// External Modules ----------------------------------------------------------

import util from "util";
const exec = util.promisify(require("child_process").exec);
const {execSync} = require("child_process");
const fs = require("fs");
const path = require("path");
import {Op} from "sequelize";
import {Timestamps} from "@craigmcc/shared-utils";

// Internal Modules ----------------------------------------------------------

import AccessToken from "../models/AccessToken";
import RefreshToken from "../models/RefreshToken";
import logger from "../util/ServerLogger";

// Public Objects ------------------------------------------------------------

const BACKUP_DIRECTORY = "backup";
const COMMAND = "pg_dump";
const DATABASE_URL = process.env.DATABASE_URL ? process.env.DATABASE_URL : "";
const PURGE_BEFORE_MS = 24 * 60 * 60 * 1000; // 24 hours (in milliseconds)

class DatabaseServices {

    // Public Methods --------------------------------------------------------

    /**
     * Cause the contents of our database to be recorded (via pg_dump)
     * in a local file (with a timestamped name) in the specified
     * backup directory.
     */
    public async backup(): Promise<object> {

        if (!fs.existsSync(BACKUP_DIRECTORY)) {
            fs.mkdirSync(BACKUP_DIRECTORY);
        }
        const FILENAME = `${this.databaseName()}-${Timestamps.local()}.sql`;
        const PATHNAME = path.resolve(BACKUP_DIRECTORY, FILENAME);
        const THE_COMMAND = `pg_dump ${DATABASE_URL} > ${PATHNAME}`;

        let output = "";
        try {
            output = execSync(THE_COMMAND).toString();
            const result = {
                context: "DatabaseServices.backup",
                msg: "Successful database backup",
                pathname: PATHNAME,
                output: output,
            }
            logger.info(result);
            return result;
        } catch (error) {
            const result = {
                context: "DatabaseServices.backup",
                msg: "Error performing database backup",
                pathname: PATHNAME,
                output: output,
                error: error
            }
            logger.error(result);
            return result;
        }

    }

    /**
     * Cause the contents of our database to be recorded (via pg_dump),
     * which will be returned as a string (which should then be treated
     * as text/plain content).
     */
    public async dump(): Promise<string> {

        const {stdout, stderr} = await exec(`${COMMAND} ${DATABASE_URL}`);
        logger.info({
            context: "DatabaseServices.dump",
            length: stdout.length,
        });
        if (stderr.length > 0) {
            logger.error({
                context: "DatabaseServices.dump",
                msg: "Dump returned stderr output",
                stderr: stderr,
            });
        }
        return stdout;
    }

    /**
     * Purge access_tokens and refresh_tokens that have been expired
     * for long enough to no longer be needed.
     */
    public async purge(): Promise<object> {

        const purgeBefore = new Date((new Date().getTime()) - PURGE_BEFORE_MS);
        const accessTokensPurged = await AccessToken.destroy({
            where: { expires: { [Op.lte]: purgeBefore }}
        });
        const refreshTokensPurged = await RefreshToken.destroy({
            where: { expires: { [Op.lte]: purgeBefore }}
        });

        const results = {
            purgeBefore: purgeBefore.toLocaleString(),
            accessTokensPurged: accessTokensPurged,
            refreshTokensPurged: refreshTokensPurged,
        }
        logger.info({
            context: "DatabaseServices.purge",
            results: results,
        })
        return results;

    }

    // Private Methods -------------------------------------------------------

    private databaseName = (): string => {
        const splits = DATABASE_URL.split("/");
        return splits[splits.length - 1];
    }

    private leftPad = (input: string | number, size: number): string => {
        let output = String(input);
        while (output.length < size) {
            output = "0" + output;
        }
        return output;
    }

    private timestamp = () => {
        const date = new Date();
        return date.getFullYear()
            + this.leftPad(date.getMonth() + 1, 2)
            + this.leftPad(date.getDate(), 2)
            + "-"
            + this.leftPad(date.getHours(), 2)
            + this.leftPad(date.getMinutes(), 2)
            + this.leftPad(date.getSeconds(), 2);

    }

}

export default new DatabaseServices();
