// TestUtils -----------------------------------------------------------------

// Generic utility methods for tests.

// External Modules ----------------------------------------------------------

import {Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import {NotFound} from "./HttpErrors";
import * as SeedData from "./SeedData";
import AccessToken from "../models/AccessToken";
import Checkin from "../models/Checkin";
import Database from "../models/Database";
import Guest from "../models/Guest";
import RefreshToken from "../models/RefreshToken";
import User from "../models/User";
import Facility from "../models/Facility";
import Template from "../models/Template";
import {hashPassword} from "../oauth/OAuthUtils";

// Public Objects ------------------------------------------------------------

export const lookupFacility = async (name: string): Promise<Facility> => {
    const result = await Facility.findOne({
        where: { name: name }
    });
    if (result) {
        return result;
    } else {
        throw new NotFound(`name: Should have found Facility for '${name}'`);
    }
}

export const lookupGuest = async (facilityId: number, firstName: string, lastName: string): Promise<Guest> => {
    const result = await Guest.findOne({
        where: {
            facilityId: facilityId,
            firstName: firstName,
            lastName: lastName,
        }
    });
    if (result) {
        return result;
    } else {
        throw new NotFound(`firstName/lastName: Should have found Guest for '${firstName} ${lastName}`);
    }
}

export const lookupTemplate = async (facilityId: number, name: string): Promise<Template> => {
    const result = await Template.findOne({
        where: {
            facilityId: facilityId,
            name: name,
        }
    });
    if (result) {
        return result;
    } else {
        throw new NotFound(`name: Should have found Template for '${name}'`);
    }
}

export const lookupUser = async (username: string): Promise<User> => {
    const result = await User.findOne({
        where: { username: username }
    });
    if (result) {
        return result;
    } else {
        throw new NotFound(`username:  Should have found User for '${username}'`);
    }
}

export type OPTIONS = {
    withAccessTokens: boolean,
    withCheckins: boolean,
    withFacilities: boolean,
    withGuests: boolean,
    withRefreshTokens: boolean,
    withTemplates: boolean,
    withUsers: boolean,
}

export const loadTestData = async (options: Partial<OPTIONS> = {}): Promise<void> => {

    // Create tables (if necessary), and erase current contents
    await Database.sync({
        force: true,
    });

    // Load OAuth Related Tables (top-down order)
    if (options.withUsers) {
        await loadUsers(SeedData.USERS);
        const userSuperuser = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
        if (options.withAccessTokens) {
            await loadAccessTokens(userSuperuser, SeedData.ACCESS_TOKENS_SUPERUSER);
        }
        if (options.withRefreshTokens) {
            await loadRefreshTokens(userSuperuser, SeedData.REFRESH_TOKENS_SUPERUSER);
        }
    }

    // Load Facility Related Tables (top-down order)
    if (options.withFacilities) {
        await loadFacilities(SeedData.FACILITIES);
        const facilityFirst = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
        const facilitySecond = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
        const facilityThird = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
        if (options.withGuests) {
            const guestsFirst = await loadGuests(facilityFirst, SeedData.GUESTS);
            const guestsSecond = await loadGuests(facilitySecond, SeedData.GUESTS);
            const guestsThird = await loadGuests(facilityThird, SeedData.GUESTS);
            if (options.withCheckins) {
                loadCheckins(facilityFirst, guestsFirst);
                loadCheckins(facilitySecond, guestsSecond);
                loadCheckins(facilityThird, guestsThird);
            }
        }
        if (options.withTemplates) {
            await loadTemplates(facilityFirst, SeedData.TEMPLATES);
            await loadTemplates(facilitySecond, SeedData.TEMPLATES);
            await loadTemplates(facilityThird, SeedData.TEMPLATES);
        }
        // TODO - other child data
    }

}

// Private Objects -----------------------------------------------------------

const loadAccessTokens
    = async (user: User, accessTokens: Partial<AccessToken>[]): Promise<AccessToken[]> => {
    accessTokens.forEach(accessToken => {
        accessToken.userId = user.id;
    });
    let results: AccessToken[] = [];
    try {
        results = await AccessToken.bulkCreate(accessTokens);
        return results;
    } catch (error) {
        console.info(`  Reloading AccessTokens for User '${user.username}' ERROR`, error);
        throw error;
    }
}

const loadCheckins = async (facility: Facility, guests: Guest[]): Promise<Checkin[]> => {
    const ones = await Checkin.bulkCreate([
        {
            checkinDate: SeedData.CHECKIN_DATE_ONE,
            facilityId: facility.id,
            guestId: guests[0].id,
            matNumber: 1,
            paymentAmount: 5.00,
            paymentType: "$$",
        },
        {
            checkinDate: SeedData.CHECKIN_DATE_ONE,
            facilityId: facility.id,
            matNumber: 2,
        },
        {
            checkinDate: SeedData.CHECKIN_DATE_ONE,
            facilityId: facility.id,
            guestId: guests[2].id,
            matNumber: 3,
            paymentType: "SW",
        },
        {
            checkinDate: SeedData.CHECKIN_DATE_ONE,
            facilityId: facility.id,
            matNumber: 4,
        },
    ]);
    const twos = await Checkin.bulkCreate([
        {
            checkinDate: SeedData.CHECKIN_DATE_TWO,
            facilityId: facility.id,
            matNumber: 1,
        },
        {
            checkinDate: SeedData.CHECKIN_DATE_TWO,
            facilityId: facility.id,
            guestId: guests[1].id,
            matNumber: 2,
            paymentType: "AG",
        },
        {
            checkinDate: SeedData.CHECKIN_DATE_TWO,
            facilityId: facility.id,
            matNumber: 3,
        },
        {
            checkinDate: SeedData.CHECKIN_DATE_TWO,
            facilityId: facility.id,
            guestId: guests[3].id,
            matNumber: 4,
            paymentAmount: 5.00,
            paymentType: "$$",
        },
    ]);
    return [
        ...ones,
        ...twos,
    ];
}

const loadFacilities = async (facilities: Partial<Facility>[]) => {
    let results: Facility[] = [];
    try {
        results = await Facility.bulkCreate(facilities);
    } catch (error) {
        console.info("  Reloading Facilities ERROR", error);
        throw error;
    }
    return results;
}

const loadRefreshTokens
    = async (user: User, refreshTokens: Partial<RefreshToken>[]): Promise<RefreshToken[]> => {
    refreshTokens.forEach(refreshToken => {
        refreshToken.userId = user.id;
    });
    let results: RefreshToken[] = [];
    try {
        results = await RefreshToken.bulkCreate(refreshTokens);
        return results;
    } catch (error) {
        console.info(`  Reloading RefreshTokens for User '${user.username}' ERROR`, error);
        throw error;
    }
}

const loadGuests
    = async (facility: Facility, guests: Partial<Guest>[]): Promise<Guest[]> =>
{
    guests.forEach(guest => {
        guest.facilityId = facility.id;
    });
    try {
        const results = await Guest.bulkCreate(guests);
        return results;
    } catch (error) {
        console.info(`  Reloading Guests for Facility '${facility.name}' ERROR`, error);
        throw error;
    }
}

const loadTemplates
    = async (facility: Facility, templates: Partial<Template>[]): Promise<Template[]> =>
{
    templates.forEach(template => {
        template.facilityId = facility.id;
    });
    try {
        const results = await Template.bulkCreate(templates);
        return results;
    } catch (error) {
        console.info(`  Reloading Templates for Facility '${facility.name}' ERROR`, error);
        throw error;
    }
}

const loadUsers = async (users: Partial<User>[]): Promise<User[]> => {
    users.forEach(async user => {
        await hashPassword(user.password ? user.password : "password");
    })
    let results: User[] = [];
    try {
        results = await User.bulkCreate(users);
    } catch (error) {
        console.info("  Reloading Users ERROR", error);
        throw error;
    }
    return results;
}

