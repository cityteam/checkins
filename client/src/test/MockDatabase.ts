// MockDatabase --------------------------------------------------------------

// Manage the overall set of mock database services for client side tests.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import * as MockFacilityServices from "./MockFacilityServices";
import * as MockUserServices from "./MockUserServices";
import * as SeedData from "./SeedData";
import Facility from "../models/Facility";
import User from "../models/User";

// Public Functions ----------------------------------------------------------

/**
 * Reset database data and reload from SeedData.  Calling this ensures that
 * all tests start with exactly the same initial "database" contents.
 */
export const reset = (): void => {

    // Reset model collections
    MockFacilityServices.reset();
    MockUserServices.reset();

    // Load model data, with Users and Facilities first
    loadUsers(SeedData.USERS);
    loadFacilities(SeedData.FACILITIES);

}

// Private Methods -----------------------------------------------------------

const loadFacilities = (facilities: Facility[]): void => {
    facilities.forEach(facility => {
        MockFacilityServices.insert(facility);
    })
}

const loadUsers = (users: User[]): void => {
    users.forEach(user => {
        MockUserServices.insert(user);
    });
}
