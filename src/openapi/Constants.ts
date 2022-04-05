// Constants -----------------------------------------------------------------

// Manifest Constants for OpenAPI Builder modules.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

// ***** Miscellaneous Constants *****

export const API_PREFIX = "/api";
export const APPLICATION_JSON = "application/json";

// ***** Model Names *****

export const ACCESS_TOKEN = "AccessToken";
export const ASSIGN = "Assign";
export const BAN = "Ban";
export const CHECKIN = "Checkin";
export const ERROR = "Error";
export const FACILITY = "Facility";
export const GUEST = "Guest";
export const REFRESH_TOKEN = "RefreshToken";
export const STRING = "String";
export const TEMPLATE = "Template";
export const USER = "User";

export const MODELS = [
//    ACCESS_TOKEN,
    ASSIGN,
    BAN,
    CHECKIN,
    FACILITY,
    GUEST,
//    REFRESH_TOKEN,
    TEMPLATE,
    USER,
];

// ***** Model Properties *****

export const ACTIVE = "active";
export const BAN_ID = "banId";
export const CHECKIN_DATE = "checkinDate";
export const CHECKIN_ID = "checkinId";
export const COMMENTS = "comments";
export const EXPIRES = "expires";
export const FACILITY_ID = "facilityId";
export const FAVORITE = "favorite";
export const FEATURES = "features";
export const FIRST_NAME = "firstName";
export const FROM_DATE = "fromDate";
export const GUEST_ID = "guestId";
export const ID = "id";
export const LAST_NAME = "lastName";
export const MAT_NUMBER = "matNumber";
export const NAME = "name";
export const PAYMENT_AMOUNT = "paymentAmount";
export const PAYMENT_TYPE = "paymentType";
export const SCOPE = "scope";
export const SHOWER_TIME = "showerTime";
export const STAFF = "staff";
export const TEMPLATE_ID = "templateId";
export const TO_DATE = "toDate";
export const TOKEN = "token";
export const USER_ID = "userId";
export const WAKEUP_TIME = "wakeupTime";

// ***** Parameter Names (Includes) *****

export const WITH_BANS = "withBans";
export const WITH_CHECKINS = "withCheckins";
export const WITH_FACILITY = "withFacility";
export const WITH_GUEST = "withGuest";
export const WITH_GUESTS = "withGuests";
export const WITH_TEMPLATES = "withTemplates";

// ***** Parameter Names (Matches) *****

export const MATCH_ACTIVE = "active";
export const MATCH_AVAILABLE = "available";
export const MATCH_DATE = "date";
export const MATCH_FROM_DATE = "fromDate";
export const MATCH_GUEST_ID = "guestId";
export const MATCH_NAME = "name";
export const MATCH_SCOPE = "scope";
export const MATCH_TO_DATE = "toDate";

// ***** Parameter Names (Other) *****

export const FROM_GUEST_ID = "fromGuestId";
export const TO_GUEST_ID = "toGuestId";

// ***** Parameter Names (Pagination) *****

export const LIMIT = "limit";
export const OFFSET = "offset";

// ***** Response Status Codes *****

export const OK = "200";
export const CREATED = "201";
export const BAD_REQUEST = "400";
export const UNAUTHORIZED = "401";
export const FORBIDDEN = "403";
export const NOT_FOUND = "404";
export const NOT_UNIQUE = "409";
export const SERVER_ERROR = "500";

// ***** Tag Names *****

export const REQUIRE_ADMIN = "requireAdmin";
export const REQUIRE_ANY = "requireAny";
export const REQUIRE_REGULAR = "requireRegular";
export const REQUIRE_SUPERUSER = "requireSuperuser";

