// Assembly ------------------------------------------------------------------

// Assemble the entire OpenAPI description into a JSON string

// External Modules ----------------------------------------------------------

import * as ob from "@craigmcc/openapi-builders";
const pluralize = require("pluralize");

// Internal Modules ----------------------------------------------------------

import * as Assign from "./Assign";
import * as Checkin from "./Checkin";
import * as ErrorSchema from "./ErrorSchema";
import * as Facility from "./Facility";
import * as Guest from "./Guest";
import * as Template from "./Template";
import * as User from "./User";
import {
    ASSIGN, BAD_REQUEST, CHECKIN, CHECKIN_DATE, CHECKIN_ID,
    ERROR, FACILITY, FACILITY_ID, FORBIDDEN,
    GUEST, GUEST_ID, LIMIT,
    MATCH_ACTIVE, MATCH_NAME, MATCH_SCOPE,
    MODELS, NOT_FOUND, NOT_UNIQUE,
    OFFSET, REQUIRE_ADMIN, REQUIRE_ANY, REQUIRE_REGULAR,
    REQUIRE_SUPERUSER, SERVER_ERROR, STRING,
    TEMPLATE, TEMPLATE_ID, USER,
    USER_ID, WITH_CHECKINS, WITH_FACILITY,
    WITH_GUEST, WITH_GUESTS, WITH_TEMPLATES
} from "./Constants";
import {OpenApiObjectBuilder, TagObjectBuilder} from "@craigmcc/openapi-builders";
import {
    errorResponse, modelRequestBody, modelResponse,
    modelsResponse, queryParameter, pathParameter,
} from "./Common";

// Public Objects ------------------------------------------------------------

let ASSEMBLY = "";

export function assembly(): string {
    if (ASSEMBLY === "") {
        const builder = new ob.OpenApiObjectBuilder(info())
            .components(components())
            .pathItems(Checkin.paths())
            .pathItems(Facility.paths())
            .pathItems(Guest.paths())
            .pathItems(Template.paths())
            .pathItems(User.paths())
        ;
        tags(builder);
        ASSEMBLY = builder.asJson();
    }
    return ASSEMBLY;
}

// Private Objects ----------------------------------------------------------

function tags(builder: OpenApiObjectBuilder): void {

    // Permission constraints on operations
    builder.tag(new TagObjectBuilder(REQUIRE_ADMIN)
        .description("Requires 'admin' permission on the associated Facility")
        .build())
    builder.tag(new TagObjectBuilder(REQUIRE_ANY)
        .description("Requires logged in user")
        .build())
    builder.tag(new TagObjectBuilder(REQUIRE_REGULAR)
        .description("Requires 'regular' permission on the associated Facility")
        .build())
    builder.tag(new TagObjectBuilder(REQUIRE_SUPERUSER)
        .description("Requires 'superuser' permission")
        .build());

}

function components(): ob.ComponentsObject {
    return new ob.ComponentsObjectBuilder()
        .parameters(parameters())
        .requestBodies(requestBodies())
        .responses(responses())
        .schemas(schemas())
        .build();
}

function contact(): ob.ContactObject {
    return new ob.ContactObjectBuilder()
        .email("craigmcc@gmail.com")
        .name("Craig McClanahan")
        .build();
}

function info(): ob.InfoObject {
    return new ob.InfoObjectBuilder("CityTeam Guests Checkin Application", "2.0.0")
        .contact(contact())
        .description("Manage overnight Guest checkins at a CityTeam Facility")
        .license(license())
        .build();
}

function license(): ob.LicenseObject {
    return new ob.LicenseObjectBuilder("Apache-2.0")
        .url("https://apache.org/licenses/LICENSE-2.0")
        .build();
}

function parameters(): ob.ParametersObject {
    const theParameters: ob.ParametersObject = {};

    // Path Parameters
    theParameters[CHECKIN_DATE]
        = pathParameter(CHECKIN_DATE, "Checkin Date for Checkins of interest");
    theParameters[CHECKIN_ID]
        = pathParameter(CHECKIN_ID, "ID of the specified Checkin");
    theParameters[FACILITY_ID]
        = pathParameter(FACILITY_ID, "ID of the specified Facility");
    theParameters[GUEST_ID]
        = pathParameter(GUEST_ID, "ID of the specified Guest");
    theParameters[TEMPLATE_ID]
        = pathParameter(TEMPLATE_ID, "ID of the specified Template");
    theParameters[USER_ID]
        = pathParameter(USER_ID, "ID of the specified User");

    // Query Parameters (Includes)
    theParameters[WITH_CHECKINS]
        = queryParameter(WITH_CHECKINS, "Include the related Checkins", true);
    theParameters[WITH_FACILITY]
        = queryParameter(WITH_FACILITY, "Include the related Facility", true);
    theParameters[WITH_GUEST]
        = queryParameter(WITH_GUEST, "Include the related Guest", true);
    theParameters[WITH_GUESTS]
        = queryParameter(WITH_GUESTS, "Include the related Guests", true);
    theParameters[WITH_TEMPLATES]
        = queryParameter(WITH_TEMPLATES, "Include the related Templates", true);

    // Query Parameters (Matches)
    theParameters[MATCH_ACTIVE]
        = queryParameter(MATCH_ACTIVE, "Return only active objects", true);
    theParameters[MATCH_NAME]
        = queryParameter(MATCH_NAME, "Return objects matching name wildcard", false);
    theParameters[MATCH_SCOPE]
        = queryParameter(MATCH_SCOPE, "Return objects matching specified scope", false);

    // Query Parameters (Pagination)
    theParameters[LIMIT]
        = queryParameter(LIMIT, "Maximum number of rows returned (default is 25)", false);
    theParameters[OFFSET]
        = queryParameter(OFFSET, "Zero-relative offset to the first returned row (default is 0)", false);

    return theParameters;
}

function requestBodies(): ob.RequestBodiesObject {
    const theRequestBodies: ob.RequestBodiesObject = {};

    // Request bodies for model objects
    for (const model of MODELS) {
        theRequestBodies[model] = modelRequestBody(model);
    }

    return theRequestBodies;
}

function responses(): ob.ResponsesObject {
    const theResponses: ob.ResponsesObject = {};

    // Responses for model objects
    for (const model of MODELS) {
        theResponses[model] = modelResponse(model);
        theResponses[pluralize(model)] = modelsResponse(model);
    }

    // Responses for HTTP errors
    theResponses[BAD_REQUEST] = errorResponse("Error in request properties");
    theResponses[FORBIDDEN] = errorResponse("Requested operation is not allowed");
    theResponses[NOT_FOUND] = errorResponse("Requested item is not found");
    theResponses[NOT_UNIQUE] = errorResponse("Request object would violate uniqueness rules");
    theResponses[SERVER_ERROR] = errorResponse("General server error occurred");

    return theResponses;
}

function schemas(): ob.SchemasObject {
    const theSchemas: ob.SchemasObject = {};

    // Application Models
    theSchemas[ASSIGN] = Assign.schema();
    theSchemas[pluralize(ASSIGN)] = Assign.schemas();
    theSchemas[CHECKIN] = Checkin.schema();
    theSchemas[pluralize(CHECKIN)] = Checkin.schemas();
    theSchemas[FACILITY] = Facility.schema();
    theSchemas[pluralize(FACILITY)] = Facility.schemas();
    theSchemas[GUEST] = Guest.schema();
    theSchemas[pluralize(GUEST)] = Guest.schemas();
    theSchemas[TEMPLATE] = Template.schema();
    theSchemas[pluralize(TEMPLATE)] = Template.schemas();
    theSchemas[USER] = User.schema();
    theSchemas[pluralize(USER)] = User.schemas();

    // Other Schemas
    theSchemas[ERROR] = ErrorSchema.schema();
    theSchemas[STRING] = new ob.SchemaObjectBuilder("string")
        .build();

    return theSchemas;
}
