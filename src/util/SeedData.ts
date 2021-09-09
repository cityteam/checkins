// SeedData ------------------------------------------------------------------

// Seed data for tests.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import AccessToken from "../models/AccessToken";
import RefreshToken from "../models/RefreshToken";
import User from "../models/User";
import Facility from "../models/Facility";
import Template from "../models/Template";

// Seed Data -----------------------------------------------------------------

const ONE_DAY = 24 * 60 * 60 * 1000;    // One day (milliseconds)

// *** Access Tokens ***

export const ACCESS_TOKENS_SUPERUSER: Partial<AccessToken>[] = [
    {
        expires: new Date(new Date().getTime() + ONE_DAY),
        scope: "superuser",
        token: "superuser_access_1",
        // userId must be seeded
    },
    {
        expires: new Date(new Date().getTime() - ONE_DAY),
        scope: "superuser",
        token: "superuser_access_2",
        // userId must be seeded
    },
];

// *** Facilities ***

export const FACILITY_NAME_FIRST = "First Facility"
export const FACILITY_NAME_SECOND = "Second Facility";
export const FACILITY_NAME_THIRD = "Third Facility";
export const FACILITY_SCOPE_FIRST = "first";
export const FACILITY_SCOPE_SECOND = "second";
export const FACILITY_SCOPE_THIRD = "third";

export const FACILITY_NAMES = [
    FACILITY_NAME_FIRST, FACILITY_NAME_SECOND, FACILITY_NAME_THIRD
];

export const FACILITIES: Partial<Facility>[] = [
    {
        name: FACILITY_NAME_FIRST,
        scope: FACILITY_SCOPE_FIRST,
    },
    {
        active: false,
        name: FACILITY_NAME_SECOND,
        scope: FACILITY_SCOPE_SECOND,
    },
    {
        name: FACILITY_NAME_THIRD,
        scope: FACILITY_SCOPE_THIRD,
    },
];

// *** Refresh Tokens ***

export const REFRESH_TOKENS_SUPERUSER: Partial<RefreshToken>[] = [
    {
        accessToken: "superuser_access_1",
        expires: new Date(new Date().getTime() + ONE_DAY),
        token: "superuser_refresh_1",
        // userId must be seeded
    },
    {
        accessToken: "superuser_access_2",
        expires: new Date(new Date().getTime() - ONE_DAY),
        token: "superuser_refresh_2",
        // userId must be seeded
    },
];

// *** Templates ***

export const TEMPLATE_NAME_FIRST = "First Template";
export const TEMPLATE_NAME_SECOND = "Second Template";
export const TEMPLATE_NAME_THIRD = "Third Template";

// Will be repeated for each Facility
export const TEMPLATES: Partial<Template>[] = [
    {
        active: true,
        allMats:  "1-24",
        // facilityId must be seeded
        name: TEMPLATE_NAME_FIRST,
    },
    {
        active: false,
        allMats: "2,4,6,8",
        // facilityId must be seeded
        name: TEMPLATE_NAME_SECOND,
    },
    {
        active: true,
        allMats: "1-12",
        // facilityId must be seeded
        handicapMats: "5,7,9",
        name: TEMPLATE_NAME_THIRD,
        socketMats: "2,4,6",
        workMats: "8,10,12",
    },
];

// *** Users ***

export const USER_USERNAME_SUPERUSER = "superuser";
export const USER_USERNAME_FIRST_ADMIN = "firstadmin";
export const USER_USERNAME_FIRST_REGULAR = "firstregular";
export const USER_USERNAME_SECOND_ADMIN = "secondadmin";
export const USER_USERNAME_SECOND_REGULAR = "secondregular";

export const USERS: Partial<User>[] = [
    {
        active: true,
        name: "First Facility Admin",
        password: "firstadminpass",
        scope: "first:admin",
        username: USER_USERNAME_FIRST_ADMIN,
    },
    {
        active: true,
        name: "First Facility Regular",
        password: "firstregularpass",
        scope: "first:regular",
        username: USER_USERNAME_FIRST_REGULAR,
    },
    {
        active: false,
        name: "Second Facility Admin",
        password: "secondadminpass",
        scope: "second:admin",
        username: USER_USERNAME_SECOND_ADMIN,
    },
    {
        active: false,
        name: "Second Facility Regular",
        password: "secondregularpass",
        scope: "second:regular",
        username: USER_USERNAME_SECOND_REGULAR,
    },
    {
        active: true,
        name: "Superuser User",
        password: "superuser",
        scope: "superuser",
        username: USER_USERNAME_SUPERUSER,
    }
];

