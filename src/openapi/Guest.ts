// Guest ---------------------------------------------------------------------

// OpenAPI Builder declarations for Guest model objects.

// External Modules ----------------------------------------------------------

import * as ob from "@craigmcc/openapi-builders";
const pluralize = require("pluralize");

// Internal Modules ----------------------------------------------------------

import {
    activeSchema, allOperation, childrenOperation, commentsSchema,
    facilityIdSchema, findOperation, idSchema,
    insertOperation, others, parameterRef, pathItemChildCollection,
    pathItemChildDetail, pathParam,
    removeOperation, responseRef, schemaRef, updateOperation
} from "./Common";
import {
    ACTIVE, API_PREFIX, BAD_REQUEST, BAN, CHECKIN, COMMENTS,
    FACILITY, FACILITY_ID, FAVORITE,
    FIRST_NAME, FROM_GUEST_ID, GUEST, GUEST_ID,
    ID, LAST_NAME, MATCH_ACTIVE, MATCH_NAME, NOT_FOUND, NOT_UNIQUE, OK,
    REQUIRE_ADMIN, REQUIRE_REGULAR, REQUIRE_SUPERUSER, TO_GUEST_ID,
    WITH_BANS, WITH_FACILITY
} from "./Constants";
import * as Ban from "./Ban";
import * as Checkin from "./Checkin";

// Public Objects ------------------------------------------------------------

// ***** Operations *****

export function all(): ob.OperationObject {
    return allOperation(GUEST, REQUIRE_REGULAR, includes, matches);
}

export function bans(): ob.OperationObject {
    return childrenOperation(GUEST, BAN, REQUIRE_REGULAR, Ban.includes, Ban.matches);
}

export function checkins(): ob.OperationObject {
    return childrenOperation(GUEST, CHECKIN, REQUIRE_REGULAR, Checkin.includes, Checkin.matches);
}

export function find(): ob.OperationObject {
    return findOperation(GUEST, REQUIRE_REGULAR, includes);
}

export function insert(): ob.OperationObject {
    return insertOperation(GUEST, REQUIRE_REGULAR);
}

export function merge(): ob.OperationObject {
    const builder = new ob.OperationObjectBuilder()
        .description("Merge Checkins for fromGuestId into toGuestId, then remove fromGuest")
        .parameters(others())
        .response(BAD_REQUEST, responseRef(BAD_REQUEST))
        .response(OK, responseRef(GUEST))
        .response(NOT_FOUND, responseRef(NOT_FOUND))
        .response(NOT_UNIQUE, responseRef(NOT_UNIQUE))
        .summary("The updated destination Guest")
        .tag(REQUIRE_ADMIN)
    ;
    return builder.build();
}

export function remove(): ob.OperationObject {
    return removeOperation(GUEST, REQUIRE_SUPERUSER);
}

export function update(): ob.OperationObject {
    return updateOperation(GUEST, REQUIRE_REGULAR);
}

// ***** Parameters *****

export function includes(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[WITH_BANS] = parameterRef(WITH_BANS);
    parameters[WITH_FACILITY] = parameterRef(WITH_FACILITY);
    return parameters;
}

export function matches(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[MATCH_ACTIVE] = parameterRef(MATCH_ACTIVE);
    parameters[MATCH_NAME] = parameterRef(MATCH_NAME);
    return parameters;
}

// ***** Paths *****

export function paths(): ob.PathsObject {
    const thePaths: ob.PathsObject = {};
    thePaths[API_PREFIX + "/" + pluralize(GUEST.toLowerCase())
    + "/" + pathParam(FACILITY_ID)]
        = pathItemChildCollection(GUEST, FACILITY_ID, all, insert);
    thePaths[API_PREFIX + "/" + pluralize(GUEST.toLowerCase())
    + "/" + pathParam(FACILITY_ID) + "/" + pathParam(GUEST_ID)]
        = pathItemChildDetail(GUEST, GUEST_ID, FACILITY_ID, find, remove, update);
    thePaths[`${API_PREFIX}/${pluralize(GUEST.toLowerCase())}`
    + `/${pathParam(FACILITY_ID)}/${pathParam(GUEST_ID)}/${pluralize(BAN.toLowerCase())}`]
        = pathItemChildDetail(GUEST, GUEST_ID, FACILITY_ID, bans);
    thePaths[`${API_PREFIX}/${pluralize(GUEST.toLowerCase())}`
    + `/${pathParam(FACILITY_ID)}/${pathParam(GUEST_ID)}/${pluralize(CHECKIN.toLowerCase())}`]
        = pathItemChildDetail(GUEST, GUEST_ID, FACILITY_ID, checkins);
    thePaths[API_PREFIX + "/" + pluralize(GUEST.toLowerCase())
    + "/" + pathParam(FACILITY_ID)
    + "/" + pathParam(TO_GUEST_ID) + "/merge"
    + "/" + pathParam(FROM_GUEST_ID)]
        = mergePath();
    return thePaths;
}

// ***** Schemas *****

export function schema(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .property(ID, idSchema(GUEST))
        .property(ACTIVE, activeSchema(GUEST))
        .property(pluralize(CHECKIN.toLowerCase()), schemaRef(pluralize(CHECKIN)))
        .property(COMMENTS, commentsSchema(GUEST))
        .property(FACILITY.toLowerCase(), schemaRef(FACILITY))
        .property(FACILITY_ID, facilityIdSchema(GUEST))
        .property(FAVORITE, new ob.SchemaObjectBuilder(
            "string",
            "Favorite mat or location",
            true).build())
        .property(FIRST_NAME, new ob.SchemaObjectBuilder(
            "string",
            "First Name of this Guest",
            false).build())
        .property(LAST_NAME, new ob.SchemaObjectBuilder(
            "string",
            "Last Name of this Guest",
            false).build())
        .build();
}

export function schemas(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .description("Guests associated with this Facility")
        .items(schemaRef(GUEST))
        .type("array")
        .build();
}

// Private Objects -----------------------------------------------------------

function mergePath(): ob.PathItemObject {
    return new ob.PathItemObjectBuilder()
        .parameter(parameterRef(FACILITY_ID))
        .parameter(parameterRef(FROM_GUEST_ID))
        .parameter(parameterRef(TO_GUEST_ID))
        .post(merge())
        .build();
}

