// AccessTokenServices -------------------------------------------------------

// Services implementation for AccessToken models.

// External Modules ----------------------------------------------------------

import {FindOptions, Includeable, Op, ValidationError} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractServices from "./AbstractServices";
import AccessToken from "../models/AccessToken";
import User from "../models/User";
import {BadRequest, NotFound, ServerError} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrders";

// Public Objects ------------------------------------------------------------

class AccessTokenServices extends AbstractServices<AccessToken> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<AccessToken[]> {
        const options: FindOptions = this.appendMatchOptions({
            order: SortOrder.ACCESS_TOKENS,
        }, query);
        return await AccessToken.findAll(options);
    }

    public async find(tokenId: number, query?: any): Promise<AccessToken> {
        const options: FindOptions = appendIncludeOptions({
            where: { id: tokenId }
        }, query);
        const results = await AccessToken.findAll(options);
        if (results.length === 1) {
            return results[0];
        } else {
            throw new NotFound(
                `tokenId: Missing AccessToken ${tokenId}`,
                "AccessTokenServices.find"
            );
        }
    }

    public async insert(accessToken: Partial<AccessToken>): Promise<AccessToken> {
        try {
            return await AccessToken.create(accessToken, {
                fields: FIELDS,
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "AccessTokenServices.insert"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "AccessTokenServices.insert"
                );
            }
        }
    }

    public async remove(tokenId: number): Promise<AccessToken> {
        const removed = await AccessToken.findByPk(tokenId);
        if (!removed) {
            throw new NotFound(
                `tokenId: Missing AccessToken ${tokenId}`,
                "AccessTokenServices.remove"
            );
        }
        await AccessToken.destroy({
            where: { id: tokenId }
        })
        return removed;
    }

    public async update(tokenId: number, accessToken: Partial<AccessToken>): Promise<AccessToken> {
        try {
            accessToken.id = tokenId; // No cheating
            const result = await AccessToken.update(accessToken, {
                fields: FIELDS_WITH_ID,
                where: { id: tokenId }
            });
            if (result[0] < 1) {
                throw new NotFound(
                    `tokenId: Missing AccessToken ${tokenId}`,
                    "AccessTokenServices.update"
                );
            }
            return this.find(tokenId);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "AccessTokenServices.update"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "AccessTokenServices.update"
                );
            }
        }
    }

    // Model-Specific Methods ------------------------------------------------

    public async exact(token: string, query?: any): Promise<AccessToken> {
        const options = appendIncludeOptions({
            where: {
                token: token,
            }
        }, query);
        const results = await AccessToken.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `token: Missing AccessToken '${token}'`,
                "AccessTokenServices.exact"
            );
        }
        return results[0];
    }

    public async purge(): Promise<object> {
        const purgeBefore = new Date((new Date().getTime()) - PURGE_BEFORE_MS);
        const purgeCount = await AccessToken.destroy({
            where: { expires: { [Op.lte]: purgeBefore }}
        });
        return {
            purgeBefore: purgeBefore.toLocaleString(),
            purgeCount: purgeCount,
        }
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported match query parameters:
     * * active                         Select unexpired tokens
     */
    public appendMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = appendIncludeOptions(options, query);
        if (!query) {
            return options;
        }
        const where: any = options.where ? options.where : {};
        if ("" === query.active) {
            where.expires = {[Op.gte]: Date.now()};
        }
        return options;
    }

}

export default new AccessTokenServices();

// Private Objects -----------------------------------------------------------

const appendIncludeOptions = (options: FindOptions, query?: any): FindOptions => {
    if (!query) {
        return options;
    }
    options = appendPaginationOptions(options, query);
    const include: Includeable[] = [];
    if ("" === query.withUser) {
        include.push(User);
    }
    if (include.length > 0) {
        options.include = include;
    }
    return options;
}

const FIELDS = [
    "expires",
    "scope",
    "token",
    "userId",
];

const FIELDS_WITH_ID = [
    ...FIELDS,
    "id",
];

const PURGE_BEFORE_MS = 24 * 60 * 60 * 1000; // 24 hours (in milliseconds)
