// useMutateTemplate ---------------------------------------------------------

// Custom hook to encapsulate mutation operations on a Template.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {ProcessTemplate} from "../types";
import Api from "../clients/Api";
import FacilityContext from "../components/facilities/FacilityContext";
import Template, {TEMPLATES_BASE} from "../models/Template";
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
    insert: ProcessTemplate;            // Function to insert a new Template
    remove: ProcessTemplate;            // Function to remove an existing Template
    update: ProcessTemplate;            // Function to update an existing Template
}

// Component Details ---------------------------------------------------------

const useMutateTemplate = (props: Props): State => {

    const facilityContext = useContext(FacilityContext);

    const [error, setError] = useState<Error | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "useMutateTemplate.useEffect",
        });
    });

    const insert: ProcessTemplate = async (theTemplate) => {

        const url = `${TEMPLATES_BASE}/${facilityContext.facility.id}`;
        let inserted = new Template();
        setError(null);
        setExecuting(true);

        try {
            inserted = ToModel.TEMPLATE((await Api.post(url, theTemplate)).data);
            logger.debug({
                context: "useMutateTemplate.insert",
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(inserted),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateTemplate.insert", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                url: url,
            }/*, alertPopup*/);
        }

        setExecuting(false);
        return inserted;

    }

    const remove: ProcessTemplate = async (theTemplate) => {

        const url = `${TEMPLATES_BASE}/${facilityContext.facility.id}/${theTemplate.id}`;
        let removed = new Template();
        setError(null);
        setExecuting(true);

        try {
            removed = ToModel.TEMPLATE((await Api.delete(url)).data);
            logger.debug({
                context: "useMutateTemplate.remove",
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(removed),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateTemplate.remove", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                url: url,
            }/*, alertPopup*/);
        }

        setExecuting(false);
        return removed;

    }

    const update: ProcessTemplate = async (theTemplate) => {

        const url = `${TEMPLATES_BASE}/${facilityContext.facility.id}/${theTemplate.id}`;
        let updated = new Template();
        setError(null);
        setExecuting(true);

        try {
            updated = ToModel.TEMPLATE((await Api.put(url, theTemplate)).data);
            logger.debug({
                context: "useMutateTemplate.update",
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(updated),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateTemplate.update", anError, {
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

export default useMutateTemplate;
