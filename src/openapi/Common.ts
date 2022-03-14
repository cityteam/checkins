// Common --------------------------------------------------------------------

// OpenAPI Builder common constructs

// External Modules ----------------------------------------------------------

import * as ob from "@craigmcc/openapi-builders";
const pluralize = require("pluralize");

// Internal Modules ----------------------------------------------------------

import {
    APPLICATION_JSON, BAD_REQUEST, CREATED,
    ERROR, FORBIDDEN, FROM_GUEST_ID, LIMIT,
    NOT_FOUND, OFFSET, OK, STRING, TO_GUEST_ID
} from "./Constants";
import {PathItemObjectBuilder, ReferenceObjectBuilder} from "@craigmcc/openapi-builders";

// Public Objects ------------------------------------------------------------

// ***** Component References *****

export function parameterRef(parameter: string): ob.ReferenceObject {
    return new ReferenceObjectBuilder(`#/components/parameters/${parameter}`)
        .build();
}

export function requestBodyRef(requestBody: string): ob.ReferenceObject {
    return new ReferenceObjectBuilder(`#/components/requestBodies/${requestBody}`)
        .build();
}

export function responseRef(parameter: string): ob.ReferenceObject {
    return new ReferenceObjectBuilder(`#/components/responses/${parameter}`)
        .build();
}

export function schemaRef(schema: string): ob.ReferenceObject {
    return new ReferenceObjectBuilder(`#/components/schemas/${schema}`)
        .build();
}

// ***** Operations *****

// GET to return an array of objects
export function allOperation(
    model: string,
    tag: string | null,
    includes?: () => ob.ParametersObject,
    matches?: () => ob.ParametersObject
): ob.OperationObject
{
    const models = pluralize(model);
    const builder = new ob.OperationObjectBuilder()
        .description(`Return all matching ${models}`)
        .parameters(includes ? includes() : {})
        .parameters(matches ? matches() : {})
        .parameters(paginations())
        .response(OK, responseRef(models))
        .summary(`The requested ${models}`)
    ;
    if (tag) {
        builder.tag(tag);
    }
    return builder.build();
}

// GET to return children of an object
export function childrenOperation(
    parentModel: string,
    childModel: string,
    tag: string | null,
    includes?: () => ob.ParametersObject,
    matches?: () => ob.ParametersObject
): ob.OperationObject
{
    const children = pluralize(childModel);
    const builder = new ob.OperationObjectBuilder()
        .description(`Return matching ${children} of this ${parentModel}`)
        .parameters(includes ? includes() : {})
        .parameters(matches ? matches() : {})
        .parameters(paginations())
        .response(OK, responseRef(children))
        .response(FORBIDDEN, responseRef(FORBIDDEN))
        .response(NOT_FOUND, responseRef(NOT_FOUND))
        .summary(`The requested ${children}`);
    if (tag) {
        builder.tag(tag);
    }
    return builder.build();
}

// GET to return a specified object
export function findOperation(
    model: string,
    tag: string | null,
    includes?: () => ob.ParametersObject,
): ob.OperationObject
{
    const builder = new ob.OperationObjectBuilder()
        .description(`Return the specified ${model}`)
        .parameters(includes ? includes() : {})
        .response(OK, responseRef(model))
        .response(FORBIDDEN, responseRef(FORBIDDEN))
        .response(NOT_FOUND, responseRef(NOT_FOUND))
        .summary(`The specified ${model}`)
    ;
    if (tag) {
        builder.tag(tag);
    }
    return builder.build();
}

// POST to create and return an object
export function insertOperation(
    model: string,
    tag: string | null
): ob.OperationObject
{
    const builder = new ob.OperationObjectBuilder()
        .description(`Create and return the specified ${model}`)
        .requestBody(requestBodyRef(model))
        .response(CREATED, responseRef(model))
        .response(BAD_REQUEST, responseRef(BAD_REQUEST))
        .response(FORBIDDEN, responseRef(FORBIDDEN))
        .summary(`The created ${model}`)
    ;
    if (tag) {
        builder.tag(tag);
    }
    return builder.build();
}

// DELETE to remove and return a specified object
export function removeOperation(
    model: string,
    tag: string | null
): ob.OperationObject
{
    const builder = new ob.OperationObjectBuilder()
        .description(`Remove and return the specified ${model}`)
        .response(OK, responseRef(model))
        .response(BAD_REQUEST, responseRef(BAD_REQUEST))
        .response(FORBIDDEN, responseRef(FORBIDDEN))
        .response(NOT_FOUND, responseRef(NOT_FOUND))
        .summary(`The removed ${model}`)
    ;
    if (tag) {
        builder.tag(tag);
    }
    return builder.build();
}

// PUT to update and return a specified object
export function updateOperation(
    model: string,
    tag: string | null
): ob.OperationObject
{
    const builder = new ob.OperationObjectBuilder()
        .description(`Update and return the specified ${model}`)
        .requestBody(requestBodyRef(model))
        .response(OK, responseRef(model))
        .response(BAD_REQUEST, responseRef(BAD_REQUEST))
        .response(FORBIDDEN, responseRef(FORBIDDEN))
        .response(NOT_FOUND, responseRef(NOT_FOUND))
        .summary(`The updated ${model}`)
    ;
    if (tag) {
        builder.tag(tag);
    }
    return builder.build();
}

// ***** Parameters *****

export function pathParameter(name: string, description: string): ob.ParameterObject {
    const builder = new ob.ParameterObjectBuilder("path", name)
        .description(description)
        .required(true)
        .schema(schemaRef(STRING))
    ;
    return builder.build();
}

export function queryParameter(name: string, description: string, allowEmptyValue?: boolean): ob.ParameterObject {
    const builder = new ob.ParameterObjectBuilder("query", name)
        .allowEmptyValue(allowEmptyValue ? true : false)
        .description(description)
        .required(false)
        .schema(schemaRef(STRING))
    ;
    return builder.build();
}

// ***** PathItems *****

// PathItem for child object collection endpoint
export function pathItemChildCollection(
    childModel: string,
    parentId: string,
    all?: () => ob.OperationObject,
    insert?: () => ob.OperationObject
): ob.PathItemObject
{
    const builder = new PathItemObjectBuilder()
        .parameter(parameterRef(parentId));
    if (all) {
        builder.get(all());
    }
    if (insert) {
        builder.post(insert());
    }
    return builder.build();
}

// PathItem for parent object detail endpoint
export function pathItemChildDetail(
    childModel: string,
    childId: string,
    parentId: string,
    find?: () => ob.OperationObject,
    remove?: () => ob.OperationObject,
    update?: () => ob.OperationObject,
): ob.PathItemObject{
    const builder = new PathItemObjectBuilder()
        .parameter(parameterRef(parentId))
        .parameter(parameterRef(childId));
    if (find) {
        builder.get(find());
    }
    if (remove) {
        builder.delete(remove());
    }
    if (update) {
        builder.put(update());
    }
    return builder.build();
}

// PathItem for parent object children endpoint

export function pathItemParentChildren(
    parentId: string,
    children: () => ob.OperationObject
): ob.PathItemObject
{
    const builder = new PathItemObjectBuilder()
        .parameter(parameterRef(parentId))
        .get(children());
    return builder.build();
}

// PathItem for parent object collection endpoint
export function pathItemParentCollection(
    model: string,
    all?: () => ob.OperationObject,
    insert?: () => ob.OperationObject
): ob.PathItemObject
{
    const builder = new PathItemObjectBuilder();
    if (all) {
        builder.get(all());
    }
    if (insert) {
        builder.post(insert());
    }
    return builder.build();
}

// PathItem for parent object detail endpoint
export function pathItemParentDetail(
    model: string,
    modelId: string,
    find?: () => ob.OperationObject,
    remove?: () => ob.OperationObject,
    update?: () => ob.OperationObject,
): ob.PathItemObject{
    const builder = new PathItemObjectBuilder()
        .parameter(parameterRef(modelId));
    if (find) {
        builder.get(find());
    }
    if (remove) {
        builder.delete(remove());
    }
    if (update) {
        builder.put(update());
    }
    return builder.build();
}

// ***** Path Parameters *****

export function pathParam(modelId: string): string {
    return "{" + modelId + "}";
}

// ***** Query Parameters *****

export function others(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[FROM_GUEST_ID] = parameterRef(FROM_GUEST_ID);
    parameters[TO_GUEST_ID] = parameterRef(TO_GUEST_ID);
    return parameters;
}

export function paginations(): ob.ParametersObject {
    const parameters: ob.ParametersObject = {};
    parameters[LIMIT] = parameterRef(LIMIT);
    parameters[OFFSET] = parameterRef(OFFSET);
    return parameters;
}

// ***** Request Bodies *****

export function modelRequestBody(model: string): ob.RequestBodyObject {
    return new ob.RequestBodyObjectBuilder()
        .content(APPLICATION_JSON, new ob.MediaTypeObjectBuilder()
            .schema(schemaRef(model))
            .build())
        .required(true)
        .build();
}

// ***** Responses *****

export function errorResponse(description: string): ob.ResponseObject {
    return new ob.ResponseObjectBuilder(description)
        .content(APPLICATION_JSON, new ob.MediaTypeObjectBuilder()
            .schema(schemaRef(ERROR))
            .build())
        .build();
}


export function modelResponse(model: string): ob.ResponseObject {
    return new ob.ResponseObjectBuilder(`The specified ${model}`)
        .content(APPLICATION_JSON, new ob.MediaTypeObjectBuilder()
            .schema(schemaRef(model))
            .build())
        .build();
}

export function modelsResponse(model: string): ob.ResponseObject {
    return new ob.ResponseObjectBuilder(`The requested ${pluralize(model)}`)
        .content(APPLICATION_JSON, new ob.MediaTypeObjectBuilder()
            .schema(new ob.SchemaObjectBuilder()
                .items(schemaRef(pluralize(model)))
                .type("array")
                .build())
            .build())
        .build();
}

// ***** Property Schemas *****

export function activeSchema(model: string): ob.SchemaObject {
    return new ob.SchemaObjectBuilder(
        "boolean",
        `Is this ${model} active?`,
        true).build();
}

export function commentsSchema(model: string): ob.SchemaObject {
    return new ob.SchemaObjectBuilder(
        "string",
        `General comments about this ${model}`,
        true).build();
}

export function facilityIdSchema(model: string): ob.SchemaObject {
    return new ob.SchemaObjectBuilder(
        "integer",
        `Primary key of the Facility that owns this ${model}`,
        false).build();
}

export function guestIdSchema(model: string): ob.SchemaObject {
    return new ob.SchemaObjectBuilder(
        "integer",
        `Primary key of the Guest that owns this ${model}`,
        false).build();
}

// ID is ignored on insert transactions, so it is technically nullable
export function idSchema(model: string): ob.SchemaObject {
    return new ob.SchemaObjectBuilder(
        "integer",
        `Primary key for this ${model}`,
        true).build();
}

export function nameSchema(model: string): ob.SchemaObject {
    return new ob.SchemaObjectBuilder(
        "string",
        `Canonical name of this ${model}`,
        false).build();
}

