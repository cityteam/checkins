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
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import RefreshToken from "../models/RefreshToken";
import Template from "../models/Template";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const validateAccessTokenTokenUnique
    = async (accessToken: AccessToken): Promise<boolean> =>
{
    if (accessToken && accessToken.token) {
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

export const validateCheckinGuestUnique
    = async (facilityId: number, checkinId: number | null, checkinDate: Date, guestId: number) =>
{
    let options: any = {
        where: {
            checkinDate: checkinDate,
            facilityId: facilityId,
            guestId: guestId,
        }
    };
    if (checkinId) {
        options.where.id = { [Op.ne]: checkinId }
    }
    const results = await Checkin.findAll(options);
    return (results.length === 0);
}

export const validateCheckinKeyUnique
    = async (checkin: Checkin): Promise<boolean> =>
{
    if (checkin && checkin.checkinDate && checkin.facilityId && checkin.matNumber) {
        let options: any = {
            where: {
                checkinDate: checkin.checkinDate,
                facilityId: checkin.facilityId,
                matNumber: checkin.matNumber,
            }
        }
        if (checkin.id) {
            options.where.id = { [Op.ne]: checkin.id }
        }
        const results = await Checkin.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateFacilityId = async (facilityId: number): Promise<boolean> => {
    if (facilityId) {
        const facility = await Facility.findByPk(facilityId);
        return (facility !== null);
    } else {
        return true;
    }
}

export const validateFacilityNameUnique
    = async (facility: Facility): Promise<boolean> =>
{
    if (facility && facility.name) {
        let options: any = {
            where: {
                name: facility.name,
            }
        }
        if (facility.id && (facility.id > 0)) {
            options.where.id = { [Op.ne]: facility.id }
        }
        const results = await Facility.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateFacilityScopeUnique
    = async (facility: Facility): Promise<boolean> =>
{
    if (facility && facility.scope) {
        let options: any = {
            where: {
                scope: facility.scope,
            }
        }
        if (facility.id && (facility.id > 0)) {
            options.where.id = { [Op.ne]: facility.id }
        }
        const results = await Facility.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateGuestId = async (facilityId: number, guestId: number | undefined): Promise<boolean> => {
    if (guestId) {
        const guest = await Guest.findByPk(guestId);
        if (!guest) {
            return false;
        } else {
            return guest.facilityId === facilityId;
        }
    } else {
        return true;
    }
}

export const validateGuestNameUnique = async (guest: Guest): Promise<boolean> => {
    if (guest && guest.facilityId && guest.firstName && guest.lastName) {
        let options: any = {
            where: {
                facilityId: guest.facilityId,
                firstName: guest.firstName,
                lastName: guest.lastName,
            }
        }
        if (guest.id) {
            options.where.id = {[Op.ne]: guest.id}
        }
        const results = await Guest.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateRefreshTokenTokenUnique
    = async (refreshToken: RefreshToken): Promise<boolean> =>
{
    if (refreshToken && refreshToken.token) {
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

export const validateTemplateNameUnique = async (template: Template): Promise<boolean> => {
    if (template && template.facilityId && template.name) {
        let options: any = {
            where: {
                facilityId: template.facilityId,
                name: template.name,
            }
        }
        if (template.id) {
            options.where.id = {[Op.ne]: template.id}
        }
        const results = await Template.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateUserUsernameUnique
    = async (user: User): Promise<boolean> =>
{
    if (user && user.username) {
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

