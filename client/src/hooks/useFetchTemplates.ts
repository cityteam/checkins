// useFetchTemplates ---------------------------------------------------------

// Custom hook to fetch Template objects that correspond to input properties.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import Api from "../clients/Api";
import Template, {TEMPLATES_BASE} from "../models/Template";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import {queryParameters} from "../util/QueryParameters";
import FacilityContext from "../components/facilities/FacilityContext";
import ReportError from "../util/ReportError";
import * as ToModel from "../util/ToModel";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    active?: boolean;                   // Select only active Templates? [false]
    currentPage?: number;               // One-relative current page number [1]
    pageSize?: number;                  // Number of entries per page [25]
    name?: string;                      // Select Templates matching pattern [none]
    withFacility?: boolean;             // Include parent Facility? [false]
}

export interface State {
    error: Error | null;                // I/O error (if any)
    loading: boolean;                   // Are we currently loading?
    templates: Template[];              // Fetched Templates
}

// Hook Details --------------------------------------------------------------

const useFetchTemplates = (props: Props): State => {

    const facilityContext = useContext(FacilityContext);

    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {

        const fetchTemplates = async () => {

            setError(null);
            setLoading(true);
            let theTemplates: Template[] = [];

            const limit = props.pageSize ? props.pageSize : 25;
            const offset = props.currentPage ? (limit * (props.currentPage - 1)) : 0;
            const parameters = {
                active: props.active ? "" : undefined,
                limit: limit,
                offset: offset,
                name: props.name ? props.name : undefined,
                withFacility: props.withFacility ? "" : undefined,
            }

            try {
                if (facilityContext.facility.id > 0) {
                    theTemplates = ToModel.TEMPLATES((await Api.get(TEMPLATES_BASE
                        + `/${facilityContext.facility.id}${queryParameters(parameters)}`))
                        .data);
                    logger.debug({
                        context: "useFetchTemplates.fetchTemplates",
                        facility: Abridgers.FACILITY(facilityContext.facility),
                        parameters: parameters,
                        templates: Abridgers.TEMPLATES(theTemplates),
                    });
                }
            } catch (anError) {
                setError(anError as Error);
                ReportError("useFetchTemplates.fetchTemplates", anError, {
                    facility: Abridgers.FACILITY(facilityContext.facility),
                    ...parameters,
                })
            }

            setLoading(false);
            setTemplates(theTemplates);

        }

        fetchTemplates();

    }, [props.active, props.currentPage, facilityContext.facility,
            props.pageSize, props.name, props.withFacility]);


    return {
        error: error ? error : null,
        loading: loading,
        templates: templates,
    }

}

export default useFetchTemplates;
