// RefreshTokenServices ------------------------------------------------------

// Services implementation for RefreshToken models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op, ValidationError} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractParentServices from "./AbstractParentServices";
import RefreshToken from "../models/RefreshToken";
import User from "../models/User";
import {BadRequest, NotFound, ServerError} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrders";

// Public Objects ------------------------------------------------------------

class RefreshTokenServices extends AbstractParentServices<RefreshToken> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<RefreshToken[]> {
        const options: FindOptions = this.appendMatchOptions({
            order: SortOrder.REFRESH_TOKENS,
        }, query);
        return RefreshToken.findAll(options);
    }

    public async find(tokenId: number, query?: any): Promise<RefreshToken> {
        const options: FindOptions = this.appendIncludeOptions({
            where: { id: tokenId }
        }, query);
        const results = await RefreshToken.findAll(options);
        if (results.length === 1) {
            return results[0];
        } else {
            throw new NotFound(
                `tokenId: Missing RefreshToken ${tokenId}`,
                "RefreshTokenServices.find"
            );
        }
    }

    public async insert(refreshToken: any): Promise<RefreshToken> {
        try {
            return await RefreshToken.create(refreshToken,{
                fields: FIELDS,
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "RefreshTokenServices.insert"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "RefreshTokenServices.insert"
                );
            }
        }
    }

    public async remove(tokenId: number): Promise<RefreshToken> {
        const removed = await RefreshToken.findByPk(tokenId);
        if (!removed) {
            throw new NotFound(
                `tokenId: Missing RefreshToken ${tokenId}`,
                "RefreshTokenServices.remove"
            );
        }
        await RefreshToken.destroy({
            where: { id: tokenId }
        })
        return removed;
    }

    public async update(tokenId: number, refreshToken: any): Promise<RefreshToken> {
        try {
            refreshToken.id = tokenId; // No cheating
            const result = await RefreshToken.update(refreshToken, {
                fields: FIELDS_WITH_ID,
                where: { id: tokenId }
            });
            if (result[0] < 1) {
                throw new NotFound(
                    `tokenId: Missing RefreshToken ${tokenId}`,
                    "RefreshTokenServices.update"
                );
            }
            return this.find(tokenId);
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            } else if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "RefreshTokenServices.update"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "RefreshTokenServices.update"
                );
            }
        }
    }

    // Model-Specific Methods ------------------------------------------------

    public async exact(token: string, query?: any): Promise<RefreshToken> {
        const options = this.appendIncludeOptions({
            where: {
                token: token,
            }
        }, query);
        const results = await RefreshToken.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `token: Missing RefreshToken '${token}'`,
                "RefreshTokenServices.exact"
            );
        }
        return results[0];
    }

    public async purge(): Promise<object> {
        const purgeBefore = new Date((new Date().getTime()) - PURGE_BEFORE_MS);
        const purgeCount = await RefreshToken.destroy({
            where: { expires: { [Op.lte]: purgeBefore }}
        });
        return {
            purgeBefore: purgeBefore.toLocaleString(),
            purgeCount: purgeCount,
        }
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withUser                       Include parent User
     */
    public appendIncludeOptions(options: FindOptions, query?: any): FindOptions {
        if (!query) {
            return options;
        }
        options = appendPaginationOptions(options, query);
        const include: any = options.include ? options.include : [];
        if ("" === query.withUser) {
            include.push(User);
        }
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /**
     * Supported match query parameters:
     * * active                         Select unexpired tokens
     */
    public appendMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = this.appendIncludeOptions(options, query);
        if (!query) {
            return options;
        }
        const where: any = options.where ? options.where : {};
        if ("" === query.active) {
            where.expires = {[Op.gte]: Date.now()};
        }
        if (Object.keys(where).length > 0) {
            options.where = where;
        }
        return options;
    }


}

export default new RefreshTokenServices();

// Private Objects -----------------------------------------------------------

const FIELDS = [
    "accessToken",
    "expires",
    "token",
    "userId",
];

const FIELDS_WITH_ID = [
    ...FIELDS,
    "id",
];

const PURGE_BEFORE_MS = 24 * 60 * 60 * 1000; // 24 hours (in milliseconds)
