// Abridgers -----------------------------------------------------------------

// Return abridged versions of model objects for use in log events.

// Internal Modules ----------------------------------------------------------

import Facility from "../models/Facility";
import Model from "../models/Model";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const ANY = (model: Model): object => {
    if (model instanceof Facility) {
        return FACILITY(model);
    } else if (model instanceof User) {
        return USER(model);
    } else {
        return model;
    }
}

export const FACILITY = (facility: Facility): object => {
    return {
        id: facility.id,
        name: facility.name,
    };
}

export const FACILITIES = (facilities: Facility[]): object[] => {
    const results: object[] = [];
    facilities.forEach(facility => {
        results.push(FACILITY(facility));
    });
    return results;
}

export const USER = (user: User): object => {
    return {
        id: user.id,
        username: user.username,
    };
}

export const USERS = (users: User[]): object[] => {
    const results: object[] = [];
    users.forEach(user => {
        results.push(USER(user));
    });
    return results;
}
