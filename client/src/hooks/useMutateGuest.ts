// useMutateGuest ------------------------------------------------------------

// Custom hook to encapsulate mutation operations on a Guest.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleGuestPromise} from "../types";
import Api from "../clients/Api";
import FacilityContext from "../components/contexts/FacilityContext";
import Guest, {GUESTS_BASE} from "../models/Guest";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import ReportError from "../util/ReportError";
import {toGuest} from "../util/ToModelTypes";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
}

export interface State {
    error: Error | null;                // I/O error (if any)
    executing: boolean;                 // Are we currently executing?
    insert: HandleGuestPromise;         // Function to insert a new Guest
    remove: HandleGuestPromise;         // Function to remove an existing Guest
    update: HandleGuestPromise;         // Function to update an existing Guest
}

// Component Details ---------------------------------------------------------

const useMutateGuest = (props: Props): State => {

    const facilityContext = useContext(FacilityContext);

    const [error, setError] = useState<Error | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "useMutateGuest.useEffect",
        });
    });

    const insert: HandleGuestPromise = async (theGuest): Promise<Guest> => {

        let inserted: Guest = new Guest();
        setError(null);
        setExecuting(true);

        try {
            inserted = toGuest((await Api.post(GUESTS_BASE
                + `/${facilityContext.facility.id}`, theGuest)).data);
            logger.debug({
                context: "useMutateGuest.insert",
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: Abridgers.GUEST(inserted),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateGuest.insert", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: theGuest,
            });
        }

        setExecuting(false);
        return inserted;

    }

    const remove: HandleGuestPromise = async (theGuest): Promise<Guest> => {

        let removed: Guest = new Guest();
        setError(null);
        setExecuting(true);

        try {
            removed = toGuest((await Api.delete(GUESTS_BASE
                + `/${facilityContext.facility.id}/${theGuest.id}`))
                .data);
            logger.debug({
                context: "useMutateGuest.remove",
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: Abridgers.GUEST(removed),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateGuest.remove", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: theGuest,
            });
        }

        setExecuting(false);
        return removed;

    }

    const update: HandleGuestPromise = async (theGuest): Promise<Guest> => {

        let updated: Guest = new Guest();
        setError(null);
        setExecuting(true);

        try {
            updated = toGuest((await Api.put(GUESTS_BASE
                + `/${facilityContext.facility.id}/${theGuest.id}`, theGuest))
                .data);
            logger.debug({
                context: "useMutateGuest.update",
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: Abridgers.GUEST(updated),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateGuest.update", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: theGuest,
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

export default useMutateGuest;
