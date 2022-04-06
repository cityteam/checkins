// Sorters -------------------------------------------------------------------

// Utility functions to sort arrays of objects into the preferred order.

// Internal Modules ----------------------------------------------------------

import AccessToken from "../models/AccessToken";
import Ban from "../models/Ban";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import RefreshToken from "../models/RefreshToken";
import Template from "../models/Template";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const ACCESS_TOKENS = (accessTokens: AccessToken[]): AccessToken[] => {
    return accessTokens.sort(function (a, b) {
        if (a.expires > b.expires) {
            return 1;
        } else if (a.expires < b.expires) {
            return -1;
        } else {
            return 0;
        }
    })
}

export const BANS = (bans: Ban[]): Ban[] => {
    return bans.sort(function (a, b) {
        if (a.facilityId > b.facilityId) {
            return 1;
        } else if (a.facilityId < b.facilityId) {
            return -1;
        } else {
            if (a.guestId > b.guestId) {
                return 1;
            } else if (a.guestId < b.guestId) {
                return -1;
            } else {
                if (a.fromDate > b.fromDate) {
                    return 1;
                } else if (a.fromDate < b.fromDate) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    });
}

export const CHECKINS = (checkins: Checkin[]): Checkin[] => {
    return checkins.sort(function (a, b) {
        if (a.checkinDate > b.checkinDate) {
            return 1;
        } else if (a.checkinDate < b.checkinDate) {
            return -1;
        } else {
            if (a.matNumber > b.matNumber) {
                return 1;
            } else if (a.matNumber < b.matNumber) {
                return -1;
            } else {
                return 0;
            }
        }
    });
}

export const FACILITIES = (facilities: Facility[]): Facility[] => {
    return facilities.sort(function (a, b) {
        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        } else {
            return 0;
        }
    });
}

export const GUESTS = (guests: Guest[]): Guest[] => {
    return guests.sort(function (a, b) {
        if (a.lastName > b.lastName) {
            return 1;
        } else if (a.lastName < b.lastName) {
            return -1;
        } else {
            if (a.firstName > b.firstName) {
                return 1;
            } else if (a.firstName < b.firstName) {
                return -1;
            } else {
                return 0;
            }
        }
    });
}

export const REFRESH_TOKENS = (refreshTokens: RefreshToken[]): RefreshToken[] => {
    return refreshTokens.sort(function (a, b) {
        if (a.expires > b.expires) {
            return 1;
        } else if (a.expires < b.expires) {
            return -1;
        } else {
            return 0;
        }
    })
}

export const TEMPLATES = (templates: Template[]): Template[] => {
    return templates.sort(function (a, b) {
        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        } else {
            return 0;
        }
    });
}

export const USERS = (users: User[]): User[] => {
    return users.sort(function (a, b) {
        if (a.username > b.username) {
            return 1;
        } else if (a.username < b.username) {
            return -1;
        } else {
            return 0;
        }
    });
}

