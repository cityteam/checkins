// SortOrders ----------------------------------------------------------------

// Standard "order" values for each defined Model

// External Modules ----------------------------------------------------------

import {Order} from "sequelize";

// Public Objects ------------------------------------------------------------

export const ACCESS_TOKENS: Order = [
    [ "userId", "ASC" ],
    [ "token", "ASC" ],
];

export const BANS: Order = [
    [ "facilityId", "ASC" ],
    [ "guestId", "ASC" ],
    [ "fromDate", "ASC" ],
]

export const CHECKINS: Order = [
    [ "facilityId", "ASC" ],
    [ "checkinDate", "ASC" ],
    [ "matNumber", "ASC" ],
]

export const FACILITIES: Order = [
    [ "name", "ASC" ],
]

export const GUESTS: Order = [
    [ "facilityId", "ASC" ],
    [ "lastName", "ASC" ],
    [ "firstName", "ASC" ],
]

export const REFRESH_TOKENS: Order = [
    [ "userId", "ASC" ],
    [ "token", "ASC" ],
];

export const TEMPLATES: Order = [
    [ "facilityId", "ASC" ],
    [ "name", "ASC" ],
];

export const USERS: Order = [
    [ "username", "ASC" ],
];

