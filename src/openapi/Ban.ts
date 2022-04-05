// Ban -----------------------------------------------------------------------

// OpenAPI Builder declarations for Ban model objects.

import * as ob from "@craigmcc/openapi-builders";
const pluralize = require("pluralize");

// Internal Modules ----------------------------------------------------------

import {
    activeSchema, allOperation, commentsSchema,
    facilityIdSchema, findOperation, guestIdSchema, idSchema,
    insertOperation, parameterRef, pathItemChildCollection,
    pathItemChildDetail, pathParam,
    removeOperation, schemaRef, updateOperation
} from "./Common";
import {
    ACTIVE, API_PREFIX, BAN, BAN_ID, COMMENTS,
    FACILITY, FACILITY_ID,
    FROM_DATE, GUEST, GUEST_ID,
    ID, MATCH_ACTIVE, MATCH_FROM_DATE, MATCH_TO_DATE,
    REQUIRE_ADMIN, REQUIRE_REGULAR, STAFF, TO_DATE, WITH_FACILITY, WITH_GUEST
} from "./Constants";

// Public Objects ------------------------------------------------------------

// ***** Operations *****

export function all(): ob.OperationObject {
    return allOperation(BAN, REQUIRE_REGULAR, includes, matches);
}

export function find(): ob.OperationObject {
    return findOperation(BAN, REQUIRE_REGULAR, includes);
}

export function insert(): ob.OperationObject {
    return insertOperation(BAN, REQUIRE_ADMIN);
}

export function remove(): ob.OperationObject {
    return removeOperation(BAN, REQUIRE_ADMIN);
}

export function update(): ob.OperationObject {
    return updateOperation(BAN, REQUIRE_ADMIN);
}

// ***** Parameters *****

export function includes(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[WITH_FACILITY] = parameterRef(WITH_FACILITY);
    parameters[WITH_GUEST] = parameterRef(WITH_GUEST);
    return parameters;
}

export function matches(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[MATCH_ACTIVE] = parameterRef(MATCH_ACTIVE);
    parameters[MATCH_FROM_DATE] = parameterRef(MATCH_FROM_DATE);
    parameters[MATCH_TO_DATE] = parameterRef(MATCH_TO_DATE);
    return parameters;
}

// ***** Paths *****

export function paths(): ob.PathsObject {
    const thePaths: ob.PathsObject = {};
    thePaths[API_PREFIX + "/" + pluralize(BAN.toLowerCase())
    + "/" + pathParam(FACILITY_ID)]
        = pathItemChildCollection(BAN, FACILITY_ID, all, insert);
    thePaths[API_PREFIX + "/" + pluralize(BAN.toLowerCase())
    + "/" + pathParam(FACILITY_ID) + "/" + pathParam(BAN_ID)]
        = pathItemChildDetail(BAN, BAN_ID, FACILITY_ID, find, remove, update);
    return thePaths;
}

// ***** Schemas *****

export function schema(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .property(ID, idSchema(BAN))
        .property(ACTIVE, activeSchema(BAN))
        .property(COMMENTS, commentsSchema(BAN))
        .property(FACILITY.toLowerCase(), schemaRef(FACILITY))
        .property(FACILITY_ID, facilityIdSchema(BAN))
        .property(FROM_DATE, new ob.SchemaObjectBuilder(
            "string",
            "Earliest (inclusive) date of the Ban",
            false).build())
        .property(GUEST.toLowerCase(), schemaRef(GUEST))
        .property(GUEST_ID, guestIdSchema(BAN))
        .property(STAFF.toLowerCase(), new ob.SchemaObjectBuilder(
            "string",
            "Name or initials of the staff person who declared this Ban",
            true).build())
        .property(TO_DATE, new ob.SchemaObjectBuilder(
            "string",
            "Latest (inclusive) date of the Ban",
            false).build())
        .build();
}

export function schemas(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .description("Bans associated with this Facility and Guest")
        .items(schemaRef(BAN))
        .type("array")
        .build();
}

