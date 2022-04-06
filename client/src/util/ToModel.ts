// ToModelTypes --------------------------------------------------------------

// Convert arbitrary objects or arrays to the specified Model objects.

// Internal Modules ----------------------------------------------------------

import AccessToken from "../models/AccessToken";
import Assign from "../models/Assign";
import Ban from "../models/Ban";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import RefreshToken from "../models/RefreshToken";
import Summary from "../models/Summary";
import Template from "../models/Template";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const ACCESS_TOKEN = (value: object): AccessToken => {
    return new AccessToken(value);
}

export const ACCESS_TOKENS = (values: object[]): AccessToken[] => {
    const results: AccessToken[] = [];
    values.forEach(value => {
        results.push(new AccessToken(value));
    });
    return results;
}

export const ASSIGN = (value: object): Assign => {
    return new Assign(value);
}

export const ASSIGNS = (values: object[]): Assign[] => {
    const results: Assign[] = [];
    values.forEach(value => {
        results.push(new Assign(value));
    });
    return results;
}

export const BAN = (value: object): Ban => {
    return new Ban(value);
}

export const BANS = (values: object[]): Ban[] => {
    const results: Ban[] = [];
    values.forEach(value => {
        results.push(new Ban(value));
    });
    return results;
}

export const CHECKIN = (value: object): Checkin => {
    return new Checkin(value);
}

export const CHECKINS = (values: object[]): Checkin[] => {
    const results: Checkin[] = [];
    values.forEach(value => {
        results.push(new Checkin(value));
    });
    return results;
}

export const FACILITY = (value: object): Facility => {
    return new Facility(value);
}

export const FACILITIES = (values: object[]): Facility[] => {
    const results: Facility[] = [];
    values.forEach(value => {
        results.push(new Facility(value));
    });
    return results;
}

export const GUEST = (value: object): Guest => {
    return new Guest(value);
}

export const GUESTS = (values: object[]): Guest[] => {
    const results: Guest[] = [];
    values.forEach(value => {
        results.push(new Guest(value));
    });
    return results;
}

export const REFRESH_TOKEN = (value: object): RefreshToken => {
    return new RefreshToken(value);
}

export const REFRESH_TOKENS = (values: object[]): RefreshToken[] => {
    const results: RefreshToken[] = [];
    values.forEach(value => {
        results.push(new RefreshToken(value));
    });
    return results;
}

export const SUMMARY = (value: object): Summary => {
    return Summary.clone(value);
}

export const SUMMARIES = (values: object[]): Summary[] => {
    const results: Summary[] = [];
    values.forEach(value => {
        results.push(Summary.clone(value));
    });
    return results;
}

export const TEMPLATE = (value: object): Template => {
    return new Template(value);
}

export const TEMPLATES = (values: object[]): Template[] => {
    const results: Template[] = [];
    values.forEach(value => {
        results.push(new Template(value));
    });
    return results;
}

export const USER = (value: object): User => {
    return new User(value);
}

export const USERS = (values: object[]): User[] => {
    const results: User[] = [];
    values.forEach(value => {
        results.push(new User(value));
    });
    return results;
}

