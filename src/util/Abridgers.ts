// Abridgers -----------------------------------------------------------------

// Return abridged versions of model objects for use in log events.

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

export const ACCESS_TOKEN  = (accessToken: AccessToken): object => {
    return {
        id: accessToken.id,
        userId: accessToken.userId,
        token: accessToken.token,
    }
}

export const ANY = (model: AccessToken | RefreshToken | User): object => {
    if (model instanceof AccessToken) {
        return ACCESS_TOKEN(model);
    } else if (model instanceof Checkin) {
        return CHECKIN(model);
    } else if (model instanceof Facility) {
        return FACILITY(model);
    } else if (model instanceof Guest) {
        return GUEST(model);
    } else if (model instanceof RefreshToken) {
        return REFRESH_TOKEN(model);
    } else if (model instanceof Template) {
        return TEMPLATE(model);
    } else if (model instanceof User) {
        return USER(model);
    } else {
        return {
            model: typeof model,
        }
    }
}

export const BAN = (ban: Ban): object => {
    return {
        id: ban.id,
        facilityId: ban.facilityId,
        guestId: ban.guestId,
        fromDate: ban.fromDate,
        toDate: ban.toDate,
    }
}

export const CHECKIN = (checkin: Checkin): object => {
    return {
        id: checkin.id,
        checkinDate: checkin.checkinDate,
        facilityId: checkin.facilityId,
        guestId: checkin.guestId,
        matNumber: checkin.matNumber,
    }
}

export const FACILITY = (facility: Facility): object => {
    return {
        id: facility.id,
        name: facility.name,
    }
}

export const GUEST = (guest: Guest): object => {
    return {
        id: guest.id,
        facilityId: guest.facilityId,
        firstName: guest.firstName,
        lastName: guest.lastName,
    }
}

export const REFRESH_TOKEN  = (refreshToken: RefreshToken): object => {
    return {
        id: refreshToken.id,
        userId: refreshToken.userId,
        token: refreshToken.token,
    }
}

export const TEMPLATE = (template: Template): object => {
    return {
        id: template.id,
        facilityId: template.facilityId,
        name: template.name,
    }
}

export const USER = (user: User): object => {
    return {
        id: user.id,
        username: user.username,
        scope: user.scope,
    }
}

