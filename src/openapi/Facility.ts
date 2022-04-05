// Facility ------------------------------------------------------------------

// OpenAPI Builder declarations for Facility model objects.

// External Modules ----------------------------------------------------------

import * as ob from "@craigmcc/openapi-builders"
const pluralize = require("pluralize");

// Internal Modules ----------------------------------------------------------

import {
    activeSchema, allOperation, childrenOperation, findOperation,
    idSchema, insertOperation,
    nameSchema, parameterRef, pathItemParentChildren,
    pathItemParentCollection,
    pathItemParentDetail, pathParam, removeOperation,
    schemaRef, updateOperation,
} from "./Common";
import {
    ACTIVE, API_PREFIX, BAN, CHECKIN,
    FACILITY, FACILITY_ID, GUEST,
    ID, MATCH_ACTIVE, MATCH_NAME, MATCH_SCOPE,
    NAME, REQUIRE_ADMIN, REQUIRE_ANY, REQUIRE_REGULAR,
    REQUIRE_SUPERUSER, TEMPLATE, WITH_BANS,
    WITH_CHECKINS, WITH_GUESTS, WITH_TEMPLATES,
} from "./Constants";
import * as Ban from "./Ban";
import * as Checkin from "./Checkin";
import * as Guest from "./Guest";
import * as Template from "./Template";

// Public Objects ------------------------------------------------------------

// ***** Operations *****

export function all(): ob.OperationObject {
    return allOperation(FACILITY, REQUIRE_ANY, includes, matches)
}

export function bans(): ob.OperationObject {
    return childrenOperation(FACILITY, BAN, REQUIRE_REGULAR, Ban.includes, Ban.matches);
}

export function checkins(): ob.OperationObject {
    return childrenOperation(FACILITY, CHECKIN, REQUIRE_REGULAR, Checkin.includes, Checkin.matches);
}

export function find(): ob.OperationObject {
    return findOperation(FACILITY, REQUIRE_REGULAR, includes);
}

export function guests(): ob.OperationObject {
    return childrenOperation(FACILITY, GUEST, REQUIRE_REGULAR, Guest.includes, Guest.matches);
}

export function insert(): ob.OperationObject {
    return insertOperation(FACILITY, REQUIRE_SUPERUSER);
}

export function remove(): ob.OperationObject {
    return removeOperation(FACILITY, REQUIRE_SUPERUSER);
}

export function templates(): ob.OperationObject {
    return childrenOperation(FACILITY, TEMPLATE, REQUIRE_REGULAR, Template.includes, Template.matches);
}

export function update(): ob.OperationObject {
    return updateOperation(FACILITY, REQUIRE_ADMIN);
}

// ***** Parameters *****

export function includes(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[WITH_BANS] = parameterRef(WITH_BANS);
    parameters[WITH_CHECKINS] = parameterRef(WITH_CHECKINS);
    parameters[WITH_GUESTS] = parameterRef(WITH_GUESTS);
    parameters[WITH_TEMPLATES] = parameterRef(WITH_TEMPLATES);
    return parameters;
}

export function matches(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[MATCH_ACTIVE] = parameterRef(MATCH_ACTIVE);
    parameters[MATCH_NAME] = parameterRef(MATCH_NAME);
    parameters[MATCH_SCOPE] = parameterRef(MATCH_SCOPE);
    return parameters;
}

// ***** Paths *****

export function paths(): ob.PathsObject {
    const thePaths: ob.PathsObject = {};
    thePaths[API_PREFIX + "/" + pluralize(FACILITY.toLowerCase())]
        = pathItemParentCollection(FACILITY, all, insert);
    thePaths[API_PREFIX + "/" + pluralize(FACILITY.toLowerCase())
            + "/" + pathParam(FACILITY_ID)]
        = pathItemParentDetail(FACILITY,  FACILITY_ID, find, remove, update);
    thePaths[API_PREFIX + "/" + pluralize(FACILITY.toLowerCase())
    + "/" + pathParam(FACILITY_ID) + "/" + pluralize(BAN.toLowerCase())]
        = pathItemParentChildren(FACILITY_ID, bans);
    thePaths[API_PREFIX + "/" + pluralize(FACILITY.toLowerCase())
            + "/" + pathParam(FACILITY_ID) + "/" + pluralize(CHECKIN.toLowerCase())]
        = pathItemParentChildren(FACILITY_ID, checkins);
    thePaths[API_PREFIX + "/" + pluralize(FACILITY.toLowerCase())
            + "/" + pathParam(FACILITY_ID) + "/" + pluralize(GUEST.toLowerCase())]
        = pathItemParentChildren(FACILITY_ID, guests);
    thePaths[API_PREFIX + "/" + pluralize(FACILITY.toLowerCase())
            + "/" + pathParam(FACILITY_ID) + "/" + pluralize(TEMPLATE.toLowerCase())]
        = pathItemParentChildren(FACILITY_ID, templates);
    return thePaths;
}

// ***** Schema and Schemas *****

export function schema(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .property(ID, idSchema(FACILITY))
        .property(ACTIVE, activeSchema(FACILITY))
        .property("address1", new ob.SchemaObjectBuilder(
            "string",
            "First line of the Facility address",
            true).build())
        .property("address2", new ob.SchemaObjectBuilder(
            "string",
            "Second line of Facility address",
            true).build())
        .property(pluralize(CHECKIN.toLowerCase()), schemaRef(pluralize(CHECKIN)))
        .property("city", new ob.SchemaObjectBuilder(
            "string",
            "City of Facility address",
            true).build())
        .property("email", new ob.SchemaObjectBuilder(
            "string",
            "Email address of this Facility",
            true).build())
        .property(pluralize(GUEST.toLowerCase()), schemaRef(pluralize(GUEST)))
        .property(NAME, nameSchema(FACILITY))
        .property("phone", new ob.SchemaObjectBuilder(
            "string",
            "Phone number of this Facility",
            true).build())
        .property("scope", new ob.SchemaObjectBuilder(
            "string",
            "OAuth Scope prefix for access to this Facility",
            false).build())
        .property("state", new ob.SchemaObjectBuilder(
            "string",
            "State abbreviation of this Facility",
            true).build())
        .property(pluralize(TEMPLATE.toLowerCase()), schemaRef(pluralize(TEMPLATE)))
        .property("zipCode", new ob.SchemaObjectBuilder(
            "string",
            "Zip code of this Facility",
            true).build())
        .build();
}

export function schemas(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .items(schemaRef(FACILITY))
        .type("array")
        .build();
}
