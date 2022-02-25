// useMutateGuest ------------------------------------------------------------

// Custom hook to encapsulate mutation operations on a Guest.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {ProcessGuest} from "../types";
import Api from "../clients/Api";
import FacilityContext from "../components/facilities/FacilityContext";
import Guest, {GUESTS_BASE} from "../models/Guest";
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
    insert: ProcessGuest;               // Function to insert a new Guest
    remove: ProcessGuest;               // Function to remove an existing Guest
    update: ProcessGuest;               // Function to update an existing Guest
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

    const insert: ProcessGuest = async (theGuest) => {

        const url = `${GUESTS_BASE}/${facilityContext.facility.id}`;
        let inserted: Guest = new Guest();
        setError(null);
        setExecuting(true);

        try {
            inserted = ToModel.GUEST((await Api.post(url, theGuest)).data);
            logger.debug({
                context: "useMutateGuest.insert",
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: Abridgers.GUEST(inserted),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateGuest.insert", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                url: url,
            }/*, alertPopup */);
        }

        setExecuting(false);
        return inserted;

    }

    const remove: ProcessGuest = async (theGuest) => {

        const url = `${GUESTS_BASE}/${facilityContext.facility.id}/${theGuest.id}`;
        let removed: Guest = new Guest();
        setError(null);
        setExecuting(true);

        try {
            removed = ToModel.GUEST((await Api.delete(url)).data);
            logger.debug({
                context: "useMutateGuest.remove",
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: Abridgers.GUEST(removed),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateGuest.remove", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                url: url,
            }/*, alertPopup */);
        }

        setExecuting(false);
        return removed;

    }

    const update: ProcessGuest = async (theGuest): Promise<Guest> => {

        const url = `${GUESTS_BASE}/${facilityContext.facility.id}/${theGuest.id}`;
        let updated: Guest = new Guest();
        setError(null);
        setExecuting(true);

        try {
            updated = ToModel.GUEST((await Api.put(url, theGuest)).data);
            logger.debug({
                context: "useMutateGuest.update",
                facility: Abridgers.FACILITY(facilityContext.facility),
                guest: Abridgers.GUEST(updated),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateGuest.update", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                url: url,
            }/*, alertPopup*/);
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
