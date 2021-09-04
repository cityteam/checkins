// AsyncValidators -----------------------------------------------------------

// Custom (to this application) validation methods that can only be used by
// server side applications, because they interact directly with the database.
// In all cases, a "true" return indicates that the proposed value is valid,
// while "false" means it is not.  If a field is required, that must be
// validated separately.

// External Modules ----------------------------------------------------------

import {Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AccessToken from "../models/AccessToken";
import RefreshToken from "../models/RefreshToken";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const validateAccessTokenTokenUnique
    = async (accessToken: AccessToken): Promise<boolean> =>
{
    if (accessToken) {
        let options: any = {
            where: {
                token: accessToken.token,
            }
        }
        if (accessToken.id && (accessToken.id > 0)) {
            options.where.id = { [Op.ne]: accessToken.id }
        }
        const results = await AccessToken.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateRefreshTokenTokenUnique
    = async (refreshToken: RefreshToken): Promise<boolean> =>
{
    if (refreshToken) {
        let options: any = {
            where: {
                token: refreshToken.token,
            }
        }
        if (refreshToken.id && (refreshToken.id > 0)) {
            options.where.id = { [Op.ne]: refreshToken.id }
        }
        const results = await RefreshToken.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateUserUsernameUnique
    = async (user: User): Promise<boolean> =>
{
    if (user) {
        let options: any = {
            where: {
                username: user.username,
            }
        }
        if (user.id && (user.id > 0)) {
            options.where.id = { [Op.ne]: user.id }
        }
        const results = await User.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

// Private Objects -----------------------------------------------------------

