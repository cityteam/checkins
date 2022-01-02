// Template ------------------------------------------------------------------

// OpenAPI Builder declarations for Template model objects.

// External Modules ----------------------------------------------------------

import * as ob from "@craigmcc/openapi-builders"
const pluralize = require("pluralize");

// Internal Modules ----------------------------------------------------------

import {
    activeSchema, allOperation, commentsSchema,
    facilityIdSchema, findOperation, idSchema,
    insertOperation, nameSchema, parameterRef,
    pathItemChildCollection, pathItemChildDetail, pathParam,
    removeOperation, schemaRef, updateOperation,
} from "./Common";
import {
    ACTIVE, API_PREFIX, COMMENTS,
    FACILITY, FACILITY_ID, ID,
    MATCH_ACTIVE, MATCH_NAME, NAME, REQUIRE_ADMIN, REQUIRE_REGULAR, REQUIRE_SUPERUSER,
    TEMPLATE, TEMPLATE_ID, WITH_FACILITY,
} from "./Constants";

// Public Objects -----------------------------------------------------------

// ***** Operations *****

export function all(): ob.OperationObject {
    return allOperation(TEMPLATE, REQUIRE_REGULAR, includes, matches);
}

export function find(): ob.OperationObject {
    return findOperation(TEMPLATE, REQUIRE_REGULAR, includes);
}

export function insert(): ob.OperationObject {
    return insertOperation(TEMPLATE, REQUIRE_ADMIN);
}

export function remove(): ob.OperationObject {
    return removeOperation(TEMPLATE, REQUIRE_SUPERUSER);
}

export function update(): ob.OperationObject {
    return updateOperation(TEMPLATE, REQUIRE_ADMIN);
}

// ***** Parameters *****

export function includes(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
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
    thePaths[API_PREFIX + "/" + pluralize(TEMPLATE.toLowerCase())
            + "/" + pathParam(FACILITY_ID)]
        = pathItemChildCollection(TEMPLATE, FACILITY_ID, all, insert);
    thePaths[API_PREFIX + "/" + pluralize(TEMPLATE.toLowerCase())
            + "/" + pathParam(FACILITY_ID) + "/" + pathParam(TEMPLATE_ID)]
        = pathItemChildDetail(TEMPLATE, TEMPLATE_ID, FACILITY_ID, find, remove, update);
    return thePaths;
}

// ***** Schema and Schemas *****

export function schema(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .property(ID, idSchema(TEMPLATE))
        .property(ACTIVE, activeSchema(TEMPLATE))
        .property("allMats", new ob.SchemaObjectBuilder(
            "string",
            "List of all mat numbers to be generated for this Template",
            false).build())
        .property(COMMENTS, commentsSchema(TEMPLATE))
        .property(FACILITY.toLowerCase(), schemaRef(FACILITY))
        .property(FACILITY_ID, facilityIdSchema(TEMPLATE))
        .property("handicapMats", new ob.SchemaObjectBuilder(
            "string",
            "List of mat numbers equipped for handicapped Guests",
            true).build())
        .property(NAME, nameSchema(TEMPLATE))
        .property("socketMats", new ob.SchemaObjectBuilder(
            "string",
            "List of mat numbers near electrical sockets",
            true).build())
        .property("workMats", new ob.SchemaObjectBuilder(
            "string",
            "List of mat numbers reserved for work prospects",
            true).build())
        .build();
}

export function schemas(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .description("Templates associated with this Facility")
        .items(schemaRef(TEMPLATE))
        .type("array")
        .build();
}

