// UserServices --------------------------------------------------------------

// Services implementation for User models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op, ValidationError} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractParentServices from "./AbstractParentServices";
import AccessToken from "../models/AccessToken";
import RefreshToken from "../models/RefreshToken";
import User from "../models/User";
import {hashPassword} from "../oauth/OAuthUtils";
import {BadRequest, NotFound, ServerError} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrders";

// Public Objects ------------------------------------------------------------

class UserServices extends AbstractParentServices<User> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<User[]> {
        const options: FindOptions = this.appendMatchOptions({
            order: SortOrder.USERS,
        }, query);
        const results = await User.findAll(options);
        results.forEach(result => {
            result.password = "";
        });
        return results;
    }

    public async find(userId: number, query?: any): Promise<User> {
        const options: FindOptions = this.appendIncludeOptions({
            where: { id: userId }
        }, query);
        const result = await User.findByPk(userId, options);
        if (result) {
            result.password = "";
            return result;
        } else {
            throw new NotFound(
                `userId: Missing User ${userId}`,
                "UserServices.find"
            );
        }
    }

    public async insert(user: any): Promise<User> {
        if (!user.password) {
            throw new BadRequest(
                `password: Is required`,
                "UserServices.insert"
            );
        }
        user.password = await hashPassword(user.password); // NOTE - leaked back to caller
        try {
            const inserted = await User.create(user, {
                fields: FIELDS,
            });
            inserted.password = "";
            return inserted;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "UserServices.insert"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "UserServices.insert"
                );
            }
        }
    }

    public async remove(userId: number): Promise<User> {
        const removed = await User.findByPk(userId);
        if (!removed) {
            throw new NotFound(
                `userId: Missing User ${userId}`,
                "UserServices.remove"
            );
        }
        removed.password = "";
        await User.destroy({
            where: { id: userId }
        })
        return removed;
    }

    public async update(userId: number, user: any): Promise<User> {
        if (user.password && (user.password.length > 0)) {
            user.password = await hashPassword(user.password); // NOTE - leaked back to caller
        } else {
            delete user.password;
        }
        try {
            const found = await User.findByPk(userId);
            if (!found) {
                throw new NotFound(`userId: Missing User ${userId}`);
            }
            user.id = userId; // No cheating
            await User.update(user, {
                fields: FIELDS_WITH_ID,
                where: { id: userId }
            });
            return await this.find(userId);
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            } else if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "UserServices.update"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "UserServices.update"
                );
            }
        }
    }

    // Model-Specific Methods ------------------------------------------------

    public async accessTokens(userId: number, query?: any): Promise<AccessToken[]> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFound(
                `userId: Missing User ${userId}`,
                "UserServices.accessTokens"
            );
        }
        const options: FindOptions = this.appendAccessTokenMatchOptions({
            order: SortOrder.ACCESS_TOKENS,
            where: { userId: userId },
        }, query);
        return user.$get("accessTokens", options);
    }

    public async exact(username: string, query?: any): Promise<User> {
        const options = this.appendIncludeOptions({
            where: {
                username: username,
            }
        }, query);
        const results = await User.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `username: Missing User '${username}'`,
                "UserServices.exact"
            );
        }
        results[0].password = "";
        return results[0];
    }

    public async refreshTokens(userId: number, query?: any): Promise<RefreshToken[]> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFound(
                `userId: Missing User ${userId}`,
                "UserServices.accessTokens"
            );
        }
        const options: FindOptions = this.appendRefreshTokenMatchOptions({
            order: SortOrder.REFRESH_TOKENS,
            where: { userId: userId },
        }, query);
        return user.$get("refreshTokens", options);
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withAccessTokens               Include child AccessTokens
     * * withRefreshTokens              Include child RefreshTokens
     */
    public appendIncludeOptions(options: FindOptions, query?: any): FindOptions {
        if (!query) {
            return options;
        }
        options = appendPaginationOptions(options, query);
        const include: any = options.include ? options.include : [];
        if ("" === query.withAccessTokens) {
            include.push(AccessToken);
        }
        if ("" === query.withRefreshTokens) {
            include.push(RefreshToken);
        }
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /*
     * Supported match query parameters:
     * * active                         Select active Users
     * * username=pattern               Select usernames matching pattern
     */
    public appendMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = this.appendIncludeOptions(options, query);
        if (!query) {
            return options;
        }
        const where: any = options.where ? options.where : {};
        if ("" === query.active) {
            where.active = true;
        }
        if (query.username) {
            where.username = {[Op.iLike]: `%${query.username}%`}
        }
        if (Object.keys(where).length > 0) {
            options.where = where;
        }
        return options;
    }

    // Private Helpers -------------------------------------------------------

    /**
     * Supported include query parameters for AccessTokens:
     * * withUser                       Include parent User
     */
    public appendAccessTokenIncludeOptions(options: FindOptions, query?: any): FindOptions {
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
     * Supported match query parameters for AccessTokens:
     * * active                         Select unexpired tokens
     */
    public appendAccessTokenMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = this.appendAccessTokenIncludeOptions(options, query);
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

    /**
     * Supported include query parameters for RefreshTokens:
     * * withUser                       Include parent User
     */
    public appendRefreshTokenIncludeOptions(options: FindOptions, query?: any): FindOptions {
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
     * Supported match query parameters for RefreshTokens:
     * * active                         Select unexpired tokens
     */
    public appendRefreshTokenMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = this.appendRefreshTokenIncludeOptions(options, query);
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

export default new UserServices();

// Private Objects -----------------------------------------------------------

const FIELDS = [
    "active",
    "name",
    "password",
    "scope",
    "username",
];

const FIELDS_WITH_ID = [
    ...FIELDS,
    "id",
];

