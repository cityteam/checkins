// Checkin -------------------------------------------------------------------

// OpenAPI Builder declaration for Checkin model objects.

// External Modules ----------------------------------------------------------

import * as ob from "@craigmcc/openapi-builders";
const pluralize = require("pluralize");

// Internal Modules ----------------------------------------------------------

import {
    allOperation, commentsSchema, facilityIdSchema,
    findOperation, guestIdSchema, idSchema,
    insertOperation, parameterRef, pathItemChildCollection,
    pathItemChildDetail, pathParam, queryParameter,
    removeOperation, requestBodyRef, responseRef,
    schemaRef, updateOperation
} from "./Common";
import {
    API_PREFIX, ASSIGN, BAD_REQUEST, CHECKIN, CHECKIN_DATE, CHECKIN_ID,
    COMMENTS, CREATED, FACILITY, FACILITY_ID,
    FEATURES, GUEST, GUEST_ID, ID,
    MAT_NUMBER, MATCH_AVAILABLE, MATCH_DATE, MATCH_GUEST_ID, NOT_FOUND,
    PAYMENT_AMOUNT, PAYMENT_TYPE, REQUIRE_REGULAR,
    REQUIRE_SUPERUSER, SHOWER_TIME, TEMPLATE_ID, WAKEUP_TIME,
    WITH_FACILITY, WITH_GUEST
} from "./Constants";

// Public Objects -----------------------------------------------------------

// ***** Operations *****

export function all(): ob.OperationObject {
    return allOperation(CHECKIN, REQUIRE_REGULAR, includes, matches);
}

export function assign(): ob.OperationObject {
    const builder = new ob.OperationObjectBuilder()
        .description("Assign the specified Guest to the specified Checkin")
        .requestBody(requestBodyRef(ASSIGN))
        .response(BAD_REQUEST, responseRef(BAD_REQUEST))
        .response(NOT_FOUND, responseRef(NOT_FOUND))
        .summary("The updated (now assigned) Checkin")
        .tag(REQUIRE_REGULAR)
    ;
    return builder.build();
}

export function deassign(): ob.OperationObject {
    const builder = new ob.OperationObjectBuilder()
        .description("Deassign the specified Guest from the specified Checkin")
        .response(BAD_REQUEST, responseRef(BAD_REQUEST))
        .response(NOT_FOUND, responseRef(NOT_FOUND))
        .summary("The updated (now unassigned) Checkin")
        .tag(REQUIRE_REGULAR)
    ;
    return builder.build();
}

export function find(): ob.OperationObject {
    return findOperation(CHECKIN, REQUIRE_REGULAR, includes);
}

export function generate(): ob.OperationObject {
    const builder = new ob.OperationObjectBuilder()
        .description("Generate and return available checkins for the specified Checkin Date based on the specified Template")
        .response(BAD_REQUEST, responseRef(BAD_REQUEST))
        .response(CREATED, responseRef(pluralize(CHECKIN)))
        .tag(REQUIRE_REGULAR)
    ;
    return builder.build();
}

export function insert(): ob.OperationObject {
    return insertOperation(CHECKIN, REQUIRE_REGULAR);
}

export function reassign(): ob.OperationObject {
    const builder = new ob.OperationObjectBuilder()
        .description("Reassign the specified Guest for an existing Checkin to different Checkin")
        .requestBody(requestBodyRef(ASSIGN))
        .response(BAD_REQUEST, responseRef(BAD_REQUEST))
        .response(NOT_FOUND, responseRef(NOT_FOUND))
        .summary("The updated (now assigned) destination Checkin")
        .tag(REQUIRE_REGULAR)
    ;
    return builder.build();
}

export function remove(): ob.OperationObject {
    return removeOperation(CHECKIN, REQUIRE_SUPERUSER);
}

export function update(): ob.OperationObject {
    return updateOperation(CHECKIN, REQUIRE_REGULAR);
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
    parameters[MATCH_AVAILABLE]
        = queryParameter(MATCH_AVAILABLE, "Match only mats that are available", true);
    parameters[MATCH_DATE]
        = queryParameter(MATCH_DATE, "Checkin date to match (YYYY-MM-DD)", false);
    parameters[MATCH_GUEST_ID]
        = queryParameter(MATCH_GUEST_ID, "Match checkins for the specified guest ID", false);
    return parameters;
}

// ***** Paths *****

export function paths(): ob.PathsObject {
    const thePaths: ob.PathsObject = {};
    thePaths[API_PREFIX + "/" + pluralize(CHECKIN.toLowerCase())
    + "/" + pathParam(FACILITY_ID)]
        = pathItemChildCollection(CHECKIN, FACILITY_ID, all, insert);
    thePaths[API_PREFIX + "/" + pluralize(CHECKIN.toLowerCase())
    + "/" + pathParam(FACILITY_ID) + "/" + pathParam(CHECKIN_ID)]
        = pathItemChildDetail(CHECKIN, CHECKIN_ID, FACILITY_ID, find, remove, update);
    thePaths[API_PREFIX + "/" + pluralize(CHECKIN.toLowerCase())
    + "/" + pathParam(FACILITY_ID) + "/" + pathParam(CHECKIN_ID) + "/assignment"]
        = assignmentPath();
    thePaths[API_PREFIX + "/" + pluralize(CHECKIN.toLowerCase())
    + "/" + pathParam(FACILITY_ID) + "/generate"
    + "/" + pathParam(CHECKIN_DATE) + "/" + pathParam(TEMPLATE_ID)]
        = generatePath();
    return thePaths;
}

// ***** Schemas *****

export function schema(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .property(ID, idSchema(CHECKIN))
        .property(CHECKIN_DATE, new ob.SchemaObjectBuilder(
            "string",
            "Checkin date for which this mat is available or assigned (YYYY-MM-DD)",
            true).build())
        .property(COMMENTS, commentsSchema(GUEST))
        .property(FACILITY.toLowerCase(), schemaRef(FACILITY))
        .property(FACILITY_ID, facilityIdSchema(FACILITY))
        .property(FEATURES, new ob.SchemaObjectBuilder(
            "string",
            "Feature codes associated with this mat (if any)",
            true).build())
        .property(GUEST.toLowerCase(), schemaRef(GUEST))
        .property(GUEST_ID, guestIdSchema(GUEST))
        .property(MAT_NUMBER, new ob.SchemaObjectBuilder(
            "number",
            "Mat number to be checked in to on this checkin date",
            false).build())
        .property(PAYMENT_AMOUNT, new ob.SchemaObjectBuilder(
            "number",
            "Amount paid (if any) for this mat, on this checkin date",
            true).build())
        .property(PAYMENT_TYPE, new ob.SchemaObjectBuilder(
            "string",
            "Payment type, if this mat was occupied on this checkin date",
            true).build())
        .property(SHOWER_TIME, new ob.SchemaObjectBuilder(
            "string",
            "Requested time this Guest wishes to shower (HH:MM)",
            true).build())
        .property(WAKEUP_TIME, new ob.SchemaObjectBuilder(
            "string",
            "Requested time this Guest wishes to waken (HH:MM)",
            true).build())
        .build();
}

export function schemas(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .description("Checkins associated with this Facility")
        .items(schemaRef(CHECKIN))
        .type("array")
        .build();
}

// Private Objects -----------------------------------------------------------

function assignmentPath(): ob.PathItemObject {
    return new ob.PathItemObjectBuilder()
        .parameter(parameterRef(FACILITY_ID))
        .parameter(parameterRef(CHECKIN_ID))
        .post(assign())
        .delete(deassign())
        .put(reassign())
        .build();
}

function generatePath(): ob.PathItemObject {
    return new ob.PathItemObjectBuilder()
        .parameter(parameterRef(FACILITY_ID))
        .parameter(parameterRef(CHECKIN_DATE))
        .parameter(parameterRef(TEMPLATE_ID))
        .post(generate())
        .build();
}
