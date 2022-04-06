// useMutateBan --------------------------------------------------------------

// Custom hook to encapsulate mutation operations on a Ban.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {ProcessBan} from "../types";
import Api from "../clients/Api";
import FacilityContext from "../components/facilities/FacilityContext";
import Ban, {BANS_BASE} from "../models/Ban";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import ReportError from "../util/ReportError";
import * as ToModel from "../util/ToModel";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    alertPopup?: false,                 // Pop up browser alert on error? [true]
}

export interface State {
    error: Error | null;                // I/O error (if any)
    executing: boolean;                 // Are we currently executing?
    insert: ProcessBan;                 // Function to insert a new Ban
    remove: ProcessBan;                 // Function to remove an existing Ban
    update: ProcessBan;                 // Function to update an existing Ban
}

// Component Details ---------------------------------------------------------

const useMutateBan = (props: Props): State => {

    const facilityContext = useContext(FacilityContext);

    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
    const [error, setError] = useState<Error | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "useMutateBan.useEffect",
        });
    });

    const insert: ProcessBan = async (theBan) => {

        const url = `${BANS_BASE}/${facilityContext.facility.id}`;
        let inserted = new Ban();
        setError(null);
        setExecuting(true);

        try {
            inserted = ToModel.BAN((await Api.post(url, theBan)).data);
            logger.debug({
                context: "useMutateBan.insert",
                facility: Abridgers.FACILITY(facilityContext.facility),
                ban: Abridgers.BAN(inserted),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateBan.insert", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                url: url,
            }, alertPopup);
        }

        setExecuting(false);
        return inserted;

    }

    const remove: ProcessBan = async (theBan) => {

        const url = `${BANS_BASE}/${facilityContext.facility.id}/${theBan.id}`;
        let removed = new Ban();
        setError(null);
        setExecuting(true);

        try {
            removed = ToModel.BAN((await Api.delete(url)).data);
            logger.debug({
                context: "useMutateBan.remove",
                facility: Abridgers.FACILITY(facilityContext.facility),
                ban: Abridgers.BAN(removed),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateBan.remove", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                url: url,
            }, alertPopup);
        }

        setExecuting(false);
        return removed;

    }

    const update: ProcessBan = async (theBan) => {

        const url = `${BANS_BASE}/${facilityContext.facility.id}/${theBan.id}`;
        let updated = new Ban();
        setError(null);
        setExecuting(true);

        try {
            updated = ToModel.BAN((await Api.put(url, theBan)).data);
            logger.debug({
                context: "useMutateBan.update",
                facility: Abridgers.FACILITY(facilityContext.facility),
                ban: Abridgers.BAN(updated),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateBan.update", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                url: url,
            }, alertPopup);
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

export default useMutateBan;
