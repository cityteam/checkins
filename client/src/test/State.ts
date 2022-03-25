// State ---------------------------------------------------------------------

// Utility functions to return preconfigured state values for various
// React Context implementations.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import * as MockFacilityServices from "./MockFacilityServices";
import {State as FacilityContextState} from "../components/facilities/FacilityContext";
import {State as LoginContextState} from "../components/login/LoginContext";
import Facility from "../models/Facility";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

/**
 * Return a preconfigured State value for a FacilityContext, based on whether
 * the specified User (if any) is considered logged in or not.
 *
 * @param user                          Logged in User [not logged in]
 * @param facility                      Selected Facility [none selected]
 */
export const facilityContext = (user: User | null, facility: Facility | null): FacilityContextState => {
    return {
        facilities: (user) ? MockFacilityServices.all({}) : [],
        facility: (facility) ? facility : new Facility(),
        handleRefresh: jest.fn(),
        handleSelect: jest.fn(),
    }
}

/**
 * Return a preconfigured State value for a LoginContext, based on whether
 * the specified User (if any) is to be considered logged in or not.
 *
 * @param user                          User to be logged in [not logged in]
 */
export const loginContext = (user: User | null): LoginContextState => {
    return {
        data: {
            accessToken: (user) ? "accesstoken" : null,
            expires: (user) ? new Date() : null,
            loggedIn: (user) ? true : false,
            refreshToken: (user) ? "refreshtoken" : null,
            scope: (user) ? user.scope : null,
            username: (user) ? user.username : null,
        },
        handleLogin: jest.fn(),
        handleLogout: jest.fn(),
        validateFacility: jest.fn(),
        validateScope: jest.fn(),
    }
}

