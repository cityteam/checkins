// useFetchFacilities --------------------------------------------------------

// Custom hook to fetch Facility objects that correspond to input properties.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import Api from "../clients/Api";
import LoginContext from "../components/login/LoginContext";
import Facility, {FACILITIES_BASE} from "../models/Facility";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import {queryParameters} from "../util/QueryParameters";
import ReportError from "../util/ReportError";
import * as Sorters from "../util/Sorters";
import * as ToModel from "../util/ToModel";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    active?: boolean;                   // Select only active Facilities? [false]
    alertPopup?: boolean;               // Pop up browser alert on error? [true]
    currentPage?: number;               // One-relative current page number [1]
    pageSize?: number;                  // Number of entries per page [25]
    name?: string;                      // Select Facilities matching pattern [none]
    withCheckins?: boolean;             // Include child Checkins? [false]
    withGuests?: boolean;               // Include child Guests? [false]
    withTemplates?: boolean;            // Include child Templates? [false]
}

export interface State {
    error: Error | null;                // I/O error (if any)
    loading: boolean;                   // Are we currently loading?
    facilities: Facility[];             // Fetched Facilities
}

// Hook Details --------------------------------------------------------------

const useFetchFacilities = (props: Props): State => {

    const loginContext = useContext(LoginContext);

    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [facilities, setFacilities] = useState<Facility[]>([]);

    useEffect(() => {

        const fetchFacilities = async () => {

            setError(null);
            setLoading(true);
            let theFacilities: Facility[] = [];

            const limit = props.pageSize ? props.pageSize : 25;
            const offset = props.currentPage ? (limit * (props.currentPage - 1)) : 0;
            const parameters = {
                active: props.active ? "" : undefined,
                limit: limit,
                offset: offset,
                name: props.name ? props.name : undefined,
                withCheckins: props.withCheckins ? "" : undefined,
                withGuests: props.withGuests ? "" : undefined,
                withTemplates: props.withTemplates ? "" : undefined,
            };
            const url = `${FACILITIES_BASE}${queryParameters(parameters)}`;

            try {
                const tryFetch = loginContext.data.loggedIn;
                if (tryFetch) {
                    theFacilities = ToModel.FACILITIES((await Api.get<Facility[]>(url)).data);
                    theFacilities.forEach(theFacility => {
                        if (theFacility.guests && (theFacility.guests.length > 0)) {
                            theFacility.guests = Sorters.GUESTS(theFacility.guests);
                        }
                        if (theFacility.templates && (theFacility.templates.length > 0)) {
                            theFacility.templates = Sorters.TEMPLATES(theFacility.templates);
                        }
                    });
                    logger.debug({
                        context: "useFetchFacilities.fetchFacilities",
                        url: url,
                        facilities: Abridgers.FACILITIES(theFacilities),
                    });
                } else {
                    logger.debug({
                        context: "useFetchFacilities.fetchFacilities",
                        msg: "Skipped fetching Facilities",
                        url: url,
                        loggedIn: loginContext.data.loggedIn,
                    });
                }
            } catch (anError) {
                setError(anError as Error);
                ReportError("useFetchFacilities.fetchFacilities", anError, {
                    url: url,
                }, alertPopup);
            }

            setFacilities(theFacilities);
            setLoading(false);

        }

        fetchFacilities();

    }, [props.active, props.currentPage, props.pageSize, props.name,
        props.withCheckins, props.withGuests, props.withTemplates,
        loginContext.data.loggedIn]);

    return {
        error: error ? error : null,
        loading: loading,
        facilities: facilities,
    }

}

export default useFetchFacilities;
