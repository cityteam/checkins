// Error ---------------------------------------------------------------------

// OpenAPI Builder declarations for Error objects.

// External Modules ----------------------------------------------------------

import * as ob from "@craigmcc/openapi-builders";

// Internal Modules ----------------------------------------------------------

import {
} from "./Constants";

// Public Objects ------------------------------------------------------------

export function schema(): ob.SchemaObject {
    return new ob.SchemaObjectBuilder()
        .property("context", new ob.SchemaObjectBuilder("string",
            "Error source location").build())
        .property("inner", new ob.SchemaObjectBuilder("object",
            "Nested error we are wrapping (if any)").build())
        .property("message", new ob.SchemaObjectBuilder("string",
            "Error message summary").build())
        .property("status", new ob.SchemaObjectBuilder("integer",
            "HTTP status code").build())
        .type("object")
        .build();
}
