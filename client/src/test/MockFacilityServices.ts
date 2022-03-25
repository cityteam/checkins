// MockFacilityServices -------------------------------------------------------

// Client side mocks for FacilityServices operations.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import {NotFound} from "./HttpErrors";
import Facility from "../models/Facility";
import * as Sorters from "../util/Sorters";

// Private Objects -----------------------------------------------------------

let ids: number[] = [];                 // Facility IDs by index from SeedData.
let map = new Map<number, Facility>();  // Map of Facilities keyed by id
let nextId = 0;                         // Next used ID value

// Public Objects ------------------------------------------------------------

/**
 * Return a sorted array of all matching Libraries.
 */
export const all = (query: any): Facility[] => {
    const results: Facility[] = [];
    for (const facility of map.values()) {
        if (matches(facility, query)) {
            results.push(includes(facility, query));
        }
    }
    return Sorters.FACILITIES(results);
}

/**
 * Return the Facility with the specified name, if any.
 */
export const exact = (name: string, query?: any): Facility => {
    let found: Facility | undefined = undefined;
    for (const facility of map.values()) {
        if (facility.name === name) {
            found = facility;
        }
    }
    if (found) {
        return includes(found, query);
    } else {
        throw new NotFound(
            `name: Missing Facility '${name}'`,
            "MockFacilityServices.exact",
        );
    }
}

/**
 * Return the Facility with the specified id, if any.
 */
export const find = (facilityId: number, query: any): Facility => {
    const found = map.get(facilityId);
    if (found) {
        return includes(found, query);
    } else {
        throw new NotFound(
            `facilityId: Missing Facility ${facilityId}`,
            "MockFacilityServices.find",
        );
    }
}

/**
 * Return the facility ID at the specified index position from SeedData.
 */
export const id = (index: number): number => {
    return ids[index];
}

/**
 * Insert and return a new Facility after assigning it a new ID.
 */
export const insert = (facility: Facility): Facility => {
    // NOTE - Check for duplicate key violations?
    const inserted = new Facility({
        ...facility,
        id: nextId++,
    });
    ids.push(inserted.id);
    map.set(inserted.id, inserted);
    return inserted;
}

/**
 * Remove and return an existing Facility.
 */
export const remove = (facilityId: number): Facility => {
    const removed = find(facilityId, {});
    map.delete(facilityId);
    return removed;
}

/**
 * Reset the mock database to be empty.
 */
export const reset = (): void => {
    ids = [];
    nextId = 1000;
    map.clear();
}

/**
 * Update and return an existing Facility.
 */
export const update = (facilityId: number, facility: Facility): Facility => {
    const original = find(facilityId, {});
    // NOTE - Check for duplicate key violations?
    const updated = {
        ...original,
        ...facility,
        id: facilityId,
    }
    map.set(facilityId, updated);
    return new Facility(updated);
}

// Private Functions ---------------------------------------------------------

/**
 * Return a new Facility, decorated with child objects based on
 * any specified "with" parameters.
 *
 * @param facility                       Facility to be decorated and returned
 * @param query                         Query parameters from this request
 */
const includes = (facility: Facility, query: any): Facility => {
    const result = new Facility(facility);
    if (query) {
/*
        if ("" === query.withAuthors) {
            result.authors = MockAuthorServices.all(facility.id, {});
        }
*/
        // NOTE - implement withSeries
        // NOTE - implement withStories
        // NOTE - implement withVolumes
    }
    return result;
}

/**
 * Return true if this Facility matches all specified match criteria (if any).
 *
 * @param facility                       Facility to be tested
 * @param query                         Query parameters from this request
 */
const matches = (facility: Facility, query: any): boolean => {
    let result = true;
    if (query) {
        if (("" === query.active) && !facility.active) {
            result = false;
        }
        // NOTE - implement name
        if (query.scope && (query.scope !== facility.scope)) {
            result = false;
        }
    }
    return result;
}

