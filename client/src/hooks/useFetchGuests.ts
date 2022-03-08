// useFetchGuests ------------------------------------------------------------

// Custom hook to fetch Guest objects that correspond to input properties.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import Api from "../clients/Api";
import FacilityContext from "../components/facilities/FacilityContext";
import Guest, {GUESTS_BASE} from "../models/Guest";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import {queryParameters} from "../util/QueryParameters";
import ReportError from "../util/ReportError";
import * as ToModel from "../util/ToModel";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    active?: boolean;                   // Select only active Guests? [false]
    alertPopup?: boolean;               // Pop up browser alert on error? [true]
    currentPage?: number;               // One-relative current page number [1]
    pageSize?: number;                  // Number of entries per page [25]
    name?: string;                      // Select Guests matching pattern [none]
    withCheckins?: boolean;             // Include child Checkins? [false]
    withFacility?: boolean;             // Include parent Facility? [false]
}

export interface State {
    error: Error | null;                // I/O error (if any)
    guests: Guest[];                    // Fetched Guests
    loading: boolean;                   // Are we currently loading?
}

// Hook Details --------------------------------------------------------------

const useFetchGuests = (props: Props): State => {

    const facilityContext = useContext(FacilityContext);

    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
    const [error, setError] = useState<Error | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {

        const fetchGuests = async () => {

            setError(null);
            setLoading(true);
            let theGuests: Guest[] = [];

            const limit = props.pageSize ? props.pageSize : 25;
            const offset = props.currentPage ? (limit * (props.currentPage - 1)) : 0;
            const parameters = {
                active: props.active ? "" : undefined,
                limit: limit,
                offset: offset,
                name: props.name ? props.name : undefined,
                withCheckins: props.withCheckins ? "" : undefined,
                withFacility: props.withFacility ? "" : undefined,
            }
            const url = `${GUESTS_BASE}/${facilityContext.facility.id}${queryParameters(parameters)}`;

            try {
                // Too many Guests for a useful non-filtered fetch
                const tryFetch = (facilityContext.facility.id > 0) && props.name;
                if (tryFetch) {
                    theGuests = ToModel.GUESTS((await Api.get(url)).data);
                    logger.debug({
                        context: "useFetchGuests.fetchGuests",
                        facility: Abridgers.FACILITY(facilityContext.facility),
                        guests: Abridgers.GUESTS(theGuests),
                        url: url,
                    });
                } else {
                    logger.debug({
                        context: "useFetchGuests.fetchGuests",
                        msg: "Skipped fetching Guests",
                        url: url,
                    });
                }
            } catch (anError) {
                setError(anError as Error);
                ReportError("useFetchGuests.fetchGuests", anError, {
                    url: url,
                }, alertPopup);
            }

            setLoading(false);
            setGuests(theGuests);

        }

        fetchGuests();

    }, [props.active, props.currentPage,
        props.pageSize, props.name, props.withCheckins, props.withFacility,
        alertPopup, facilityContext.facility]);

    return {
        error: error ? error : null,
        guests: guests,
        loading: loading,
    }

}

export default useFetchGuests;
