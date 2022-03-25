// SeedData ------------------------------------------------------------------

// Mock data for the unit tests using mock service workers.

// Internal Modules ----------------------------------------------------------

import Facility from "../models/Facility";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

// ----- Common Identifiers --------------------------------------------------

export const FACILITY_0_NAME = "Facility 0";
export const FACILITY_1_NAME = "Facility 1";
export const FACILITY_2_NAME = "Facility 2";

export const FACILITY_SCOPE = "test";

// ----- Facilities ---------------------------------------------------------

export const FACILITIES: Facility[] = [
    new Facility({
        active: true,
        name: FACILITY_0_NAME,
        scope: FACILITY_SCOPE
    }),
    new Facility({
        active: false,
        name: FACILITY_1_NAME,
        scope: FACILITY_SCOPE
    }),
    new Facility({
        active: true,
        name: FACILITY_2_NAME,
        scope: FACILITY_SCOPE
    }),
];

// ----- Users --------------------------------------------------------------

export const USER_SCOPE_ADMIN = `${FACILITY_SCOPE}:admin`;
export const USER_SCOPE_REGULAR = `${FACILITY_SCOPE}:regular`;
export const USER_SCOPE_SUPERUSER = `superuser`;

export const USER_USERNAME_ADMIN = "testadmin";
export const USER_USERNAME_REGULAR = "testregular";
export const USER_USERNAME_SUPERUSER = "testsuperuser";

// Must populate id field.

export const USERS: User[] = [
    new User({
        active: true,
        name: "Test Admin User",
        password: USER_USERNAME_ADMIN,
        scope: USER_SCOPE_ADMIN,
        username: USER_USERNAME_ADMIN,
    }),
    new User({
        active: false,
        name: "Test Regular User",
        password: USER_USERNAME_REGULAR,
        scope: USER_SCOPE_REGULAR,
        username: USER_USERNAME_REGULAR,
    }),
    new User({
        active: true,
        name: "Test Superuser User",
        password: USER_USERNAME_SUPERUSER,
        scope: USER_SCOPE_SUPERUSER,
        username: USER_USERNAME_SUPERUSER,
    }),
];

