// useMutateUser -------------------------------------------------------------

// Custom hook to encapsulate mutation operations on a User.

// External Modules ----------------------------------------------------------

import {useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleUser} from "../types";
import Api from "../clients/Api";
import User, {USERS_BASE} from "../models/User";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import ReportError from "../util/ReportError";
import * as ToModel from "../util/ToModel";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
}

export interface State {
    error: Error | null;                // I/O error (if any)
    executing: boolean;                 // Are we currently executing?
    insert: HandleUser;                 // Function to insert a new User
    remove: HandleUser;                 // Function to remove an existing User
    update: HandleUser;                 // Function to update an existing User
}

// Component Details ---------------------------------------------------------

const useMutateUser = (props: Props): State => {

    const [error, setError] = useState<Error | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "useMutateUser.useEffect",
        });
    });

    const insert: HandleUser = async (theUser): Promise<User> => {

        let inserted = new User();
        setError(null);
        setExecuting(true);

        try {
            inserted = ToModel.USER((await Api.post(USERS_BASE, theUser))
                .data);
            logger.debug({
                context: "useMutateUser.insert",
                user: Abridgers.USER(inserted),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateUser.insert", anError, {
                user: {
                    ...theUser,
                    password: "*REDACTED*",
                }
            });
        }

        setExecuting(false);
        return inserted;

    }

    const remove: HandleUser = async (theUser): Promise<User> => {

        let removed = new User();
        setError(null);
        setExecuting(true);

        try {
            removed = ToModel.USER((await Api.delete(USERS_BASE
                + `/${theUser.id}`))
                .data);
            logger.debug({
                context: "useMutateUser.remove",
                user: Abridgers.USER(removed),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateUser.remove", anError, {
                user: {
                    ...theUser,
                    password: theUser.password ? "*REDACTED*" : null,
                }
            });
        }

        setExecuting(false);
        return removed;

    }

    const update: HandleUser = async (theUser): Promise<User> => {

        let updated = new User();
        setError(null);
        setExecuting(true);

        try {
            updated = ToModel.USER((await Api.put(USERS_BASE
                + `/${theUser.id}`, theUser))
                .data);
            logger.debug({
                context: "useMutateUser.update",
                user: Abridgers.USER(updated),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateUser.update", anError, {
                user: {
                    ...theUser,
                    password: theUser.password ? "*REDACTED*" : null,
                }
            });
        }

        setExecuting(false);
        return updated;

    }

    return {
        error: error,
        executing: executing,
        insert: insert,
        remove: remove,
        update: update,
    };

}

export default useMutateUser;
