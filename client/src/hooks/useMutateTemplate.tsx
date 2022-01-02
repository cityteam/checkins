// useMutateTemplate ---------------------------------------------------------

// Custom hook to encapsulate mutation operations on a Template.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleTemplate} from "../types";
import Api from "../clients/Api";
import FacilityContext from "../components/contexts/FacilityContext";
import Template, {TEMPLATES_BASE} from "../models/Template";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import ReportError from "../util/ReportError";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
}

export interface State {
    error: Error | null;                // I/O error (if any)
    executing: boolean;                 // Are we currently executing?
    insert: HandleTemplate;             // Function to insert a new Template
    remove: HandleTemplate;             // Function to remove an existing Template
    update: HandleTemplate;             // Function to update an existing Template
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

    const insert: HandleTemplate = async (theTemplate): Promise<Template> => {

        let inserted = new Template();
        setError(null);
        setExecuting(true);

        try {
            inserted = (await Api.post(TEMPLATES_BASE
                + `/${facilityContext.facility.id}`, theTemplate)).data;
            logger.debug({
                context: "useMutateTemplate.insert",
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(inserted),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateTemplate.insert", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: theTemplate,
            });
        }

        setExecuting(false);
        return inserted;

    }

    const remove: HandleTemplate = async (theTemplate): Promise<Template> => {

        let removed = new Template();
        setError(null);
        setExecuting(true);

        try {
            removed = (await Api.delete(TEMPLATES_BASE
                + `/${facilityContext.facility.id}/${theTemplate.id}`)).data;
            logger.debug({
                context: "useMutateTemplate.remove",
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(removed),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateTemplate.remove", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: theTemplate,
            });
        }

        setExecuting(false);
        return removed;

    }

    const update: HandleTemplate = async (theTemplate): Promise<Template> => {

        let updated = new Template();
        setError(null);
        setExecuting(true);

        try {
            updated = (await Api.put(TEMPLATES_BASE
                + `/${facilityContext.facility.id}/${theTemplate.id}`, theTemplate)).data;
            logger.debug({
                context: "useMutateTemplate.update",
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(updated),
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateTemplate.update", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: theTemplate,
            })
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
