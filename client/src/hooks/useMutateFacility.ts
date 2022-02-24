// useMutateFacility ---------------------------------------------------------

// Custom hook to encapsulate mutation operations on a Facility.

// External Modules ----------------------------------------------------------

import {useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {ProcessFacility} from "../types";
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
    insert: ProcessFacility;            // Function to insert a new Facility
    remove: ProcessFacility;            // Function to remove an existing Facility
    update: ProcessFacility;            // Function to update an existing Facility
}

// Component Details ---------------------------------------------------------

const useMutateFacility = (props: Props): State => {

// NOTE -    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
    const [error, setError] = useState<Error | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "useMutateFacility.useEffect",
        });
    });

    const insert: ProcessFacility = async (theFacility): Promise<Facility> => {

        const url = FACILITIES_BASE;
        let inserted = new Facility();
        setError(null);
        setExecuting(true);

        try {
            inserted = ToModel.FACILITY((await Api.post(url, theFacility)).data);
            logger.debug({
                context: "useMutateFacility.insert",
                facility: Abridgers.FACILITY(inserted),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateFacility.insert", anError, {
                facility: theFacility,
                url: url,
            }/*, alertPopup*/);
        }

        setExecuting(false);
        return inserted;

    }

    const remove: ProcessFacility = async (theFacility): Promise<Facility> => {

        const url = `${FACILITIES_BASE}/${theFacility.id}`;
        let removed = new Facility();
        setError(null);
        setExecuting(true);

        try {
            removed = ToModel.FACILITY((await Api.delete(url)).data);
            logger.debug({
                context: "useMutateFacility.remove",
                facility: Abridgers.FACILITY(removed),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateFcility.remove", anError, {
                facility: theFacility,
                url: url,
            }/*, alertPopup */);
        }

        setExecuting(false);
        return removed;

    }

    const update: ProcessFacility = async (theFacility): Promise<Facility> => {

        const url = `${FACILITIES_BASE}/${theFacility.id}`;
        let updated = new Facility();
        setError(null);
        setExecuting(true);

        try {
            updated = ToModel.FACILITY((await Api.put(url, theFacility)).data);
            logger.debug({
                context: "useMutateFacility.update",
                facility: Abridgers.FACILITY(updated),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateFacility.update", anError, {
                facility: theFacility,
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

export default useMutateFacility;
