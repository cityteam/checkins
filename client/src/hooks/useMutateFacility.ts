// useMutateFacility ---------------------------------------------------------

// Custom hook to encapsulate mutation operations on a Facility.

// External Modules ----------------------------------------------------------

import {useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleFacility} from "../types";
import Api from "../clients/Api";
import Facility, {FACILITIES_BASE} from "../models/Facility";
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
    insert: HandleFacility;             // Function to insert a new Facility
    remove: HandleFacility;             // Function to remove an existing Facility
    update: HandleFacility;             // Function to update an existing Facility
}

// Component Details ---------------------------------------------------------

const useMutateFacility = (props: Props): State => {

    const [error, setError] = useState<Error | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "useMutateFacility.useEffect",
        });
    });

    const insert: HandleFacility = async (theFacility): Promise<Facility> => {

        let inserted = new Facility();
        setError(null);
        setExecuting(true);

        try {
            inserted = ToModel.FACILITY((await Api.post(FACILITIES_BASE, theFacility))
                .data);
            logger.debug({
                context: "useMutateFacility.insert",
                facility: Abridgers.FACILITY(inserted),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateFacility.insert", anError, {
                facility: theFacility,
            });
        }

        setExecuting(false);
        return inserted;

    }

    const remove: HandleFacility = async (theFacility): Promise<Facility> => {

        let removed = new Facility();
        setError(null);
        setExecuting(true);

        try {
            removed = ToModel.FACILITY((await Api.delete(FACILITIES_BASE
                + `/${theFacility.id}`))
                .data);
            logger.debug({
                context: "useMutateFacility.remove",
                facility: Abridgers.FACILITY(removed),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateFcility.remove", anError, {
                facility: theFacility,
            });
        }

        setExecuting(false);
        return removed;

    }

    const update: HandleFacility = async (theFacility): Promise<Facility> => {

        let updated = new Facility();
        setError(null);
        setExecuting(true);

        try {
            updated = ToModel.FACILITY((await Api.put(FACILITIES_BASE
                + `/${theFacility.id}`, theFacility))
                .data);
            logger.debug({
                context: "useMutateFacility.update",
                facility: Abridgers.FACILITY(updated),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateFacility.update", anError, {
                facility: theFacility,
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

export default useMutateFacility;
