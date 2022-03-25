// MockUserServices ----------------------------------------------------------

// Client side mocks for UserServices operations.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import {NotFound} from "./HttpErrors";
import User from "../models/User";
import * as Sorters from "../util/Sorters";

// Private Objects -----------------------------------------------------------

let ids: number[] = [];                 // User IDs by index from SeedData.
let map = new Map<number, User>();      // Map of Users keyed by id
let nextId = 0;                         // Next used ID value

// Public Objects ------------------------------------------------------------

/**
 * Return a sorted array of all matching Users.
 */
export const all = (query: any): User[] => {
    const results: User[] = [];
    for (const user of map.values()) {
        if (matches(user, query)) {
            results.push(includes(user, query));
        }
    }
    return Sorters.USERS(results);
}

/**
 * Return the User with the specified name, if any.
 */
export const exact = (username: string, query?: any): User => {
    let found: User | undefined = undefined;
    for (const user of map.values()) {
        if (user.username === username) {
            found = user;
        }
    }
    if (found) {
        return includes(found, query);
    } else {
        throw new NotFound(
            `name: Missing User '${username}'`,
            "MockUserServices.exact",
        );
    }
}

/**
 * Return the User with the specified id, if any.
 */
export const find = (userId: number, query: any): User => {
    const found = map.get(userId);
    if (found) {
        return includes(found, query);
    } else {
        throw new NotFound(
            `userId: Missing User ${userId}`,
            "MockUserServices.find",
        );
    }
}

/**
 * Return the user ID at the specified index position from SeedData.
 */
export const id = (index: number): number => {
    return ids[index];
}

/**
 * Insert and return a new User after assigning it a new ID.
 */
export const insert = (user: User): User => {
    // NOTE - Check for duplicate key violations?
    const inserted = new User({
        ...user,
        id: nextId++,
    });
    ids.push(inserted.id);
    map.set(inserted.id, inserted);
    return new User(inserted);
}

/**
 * Remove and return an existing User.
 */
export const remove = (userId: number): User => {
    const removed = find(userId, {});
    map.delete(userId);
    return new User(removed);
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
 * Update and return an existing User.
 */
export const update = (userId: number, user: User): User => {
    const original = find(userId, {});
    // NOTE - Check for duplicate key violations?
    const updated = {
        ...original,
        ...user,
        id: userId,
    }
    map.set(userId, updated);
    return new User(updated);
}

// Private Functions ---------------------------------------------------------

/**
 * Return a new User, decorated with child objects based on
 * any specified "with" parameters.
 *
 * @param user                       User to be decorated and returned
 * @param query                         Query parameters from this request
 */
const includes = (user: User, query: any): User => {
    const result = new User(user);
    // NOTE - implement withAccessTokens
    // NOTE - implement withRefreshTokens
    // NOTE - implement withSeries
    // NOTE - implement withStories
    // NOTE - implement withVolumes
    return result;
}

/**
 * Return true if this User matches all specified match criteria (if any).
 *
 * @param user                          User to be tested
 * @param query                         Query parameters from this request
 */
const matches = (user: User, query: any): boolean => {
    let result = true;
    if (query.active && !user.active) {
        result = false;
    }
    // NOTE - implement username
    return result;
}

