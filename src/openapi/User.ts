// User ----------------------------------------------------------------------

// OpenAPI Builder declarations for User model objects.

// External Modules ----------------------------------------------------------

import * as ob from "@craigmcc/openapi-builders";
const pluralize = require("pluralize");

// Internal Modules ----------------------------------------------------------

import {
    activeSchema, allOperation, findOperation,
    idSchema, insertOperation, nameSchema,
    parameterRef, pathItemParentCollection,
    pathItemParentDetail, pathParam, removeOperation,
    schemaRef, updateOperation,
} from "./Common";
import {
    ACTIVE, API_PREFIX, ID, MATCH_NAME,
    MATCH_SCOPE, NAME, REQUIRE_SUPERUSER,
    SCOPE, USER, USER_ID,
} from "./Constants";

// Public Objects -----------------------------------------------------------

// ***** Operations *****

export function all(): ob.OperationObject {
    return allOperation(USER, REQUIRE_SUPERUSER, includes, matches)
}

export function find(): ob.OperationObject {
    return findOperation(USER, REQUIRE_SUPERUSER, includes);
}

export function insert(): ob.OperationObject {
    return insertOperation(USER, REQUIRE_SUPERUSER);
}

export function remove(): ob.OperationObject {
    return removeOperation(USER, REQUIRE_SUPERUSER);
}

export function update(): ob.OperationObject {
    return updateOperation(USER, REQUIRE_SUPERUSER);
}

// ***** Parameters *****

export function includes(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    return parameters;
}

export function matches(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[MATCH_NAME] = parameterRef(MATCH_NAME);
    parameters[MATCH_SCOPE] = parameterRef(MATCH_SCOPE);
    return parameters;
}

// ***** Paths *****

export function paths(): ob.PathsObject {
    const thePaths: ob.PathsObject = {};
    thePaths[API_PREFIX + "/" + pluralize(USER.toLowerCase())]
        = pathItemParentCollection(USER, all, insert);
    thePaths[API_PREFIX + "/" + pluralize(USER.toLowerCase())
    + "/" + pathParam(USER_ID)]
        = pathItemParentDetail(USER,  USER_ID, find, remove, update);
    return thePaths;
}

// ***** Schemas *****

export function schema(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .property(ID, idSchema(USER))
        // accessTokens
        .property(ACTIVE, activeSchema(USER))
        .property(NAME, nameSchema(USER))
        .property("password", new ob.SchemaObjectBuilder(
            "string",
            "Password for this User (required on insert)",
            true).build())
        // refreshTokens
        .property(SCOPE, new ob.SchemaObjectBuilder(
            "string",
            "OAuth Scope permissions for this User",
            false).build())
        .property("username", new ob.SchemaObjectBuilder(
            "string",
            "Canonical username for this User",
            false).build())
        .build();
}

export function schemas(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .items(schemaRef(USER))
        .type("array")
        .build();
}

