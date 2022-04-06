// useFetchBans --------------------------------------------------------------

// Custom hook to fetch Ban objects that correspond to input properties.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import Api from "../clients/Api";
import FacilityContext from "../components/facilities/FacilityContext";
import Ban, {BANS_BASE} from "../models/Ban";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import {queryParameters} from "../util/QueryParameters";
import ReportError from "../util/ReportError";
import * as ToModel from "../util/ToModel";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    active?: boolean;                   // Select only active Bans? [false]
    alertPopup?: boolean;               // Pop up browser alert on error? [true]
    currentPage?: number;               // One-relative current page number [1]
    fromDate?: string;                  // Select Bans with fromDate <= this [none]
    guestId?: number;                   // Select Bans for this Guest [none]
    pageSize?: number;                  // Number of entries per page [25]
    toDate?: string;                    // Select Bans with toDate >= this [none]
    withFacility?: boolean;             // Include parent Facility? [false]
    withGuest?: boolean;                // Include parent Guest? [false]
}

export interface State {
    bans: Ban[];                        // Fetched Bans
    error: Error | null;                // I/O error (if any)
    loading: boolean;                   // Are we currently loading?
}

// Hook Details --------------------------------------------------------------

const useFetchBans = (props: Props): State => {

    const facilityContext = useContext(FacilityContext);

    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
    const [bans, setBans] = useState<Ban[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {

        const fetchBans = async () => {

            setError(null);
            setLoading(true);
            let theBans: Ban[] = [];

            const limit = props.pageSize ? props.pageSize : 25;
            const offset = props.currentPage ? (limit * (props.currentPage - 1)) : 0;
            const parameters = {
                active: props.active ? "" : undefined,
                fromDate: props.fromDate ? props.fromDate : undefined,
                guestId: props.guestId ? props.guestId : undefined,
                limit: limit,
                offset: offset,
                toDate: props.toDate ? props.toDate : undefined,
                withFacility: props.withFacility ? "" : undefined,
                withGuest: props.withGuest ? "" : undefined,
            }
            const url = `${BANS_BASE}/${facilityContext.facility.id}${queryParameters(parameters)}`;

            try {
                const tryFetch = (facilityContext.facility.id > 0);
                if (tryFetch) {
                    theBans = ToModel.BANS((await Api.get(url)).data);
                    logger.debug({
                        context: "useFetchBans.fetchBans",
                        facility: Abridgers.FACILITY(facilityContext.facility),
                        bans: Abridgers.BANS(theBans),
                        url: url,
                    });
                } else {
                    logger.debug({
                        context: "useFetchBans.fetchBans",
                        msg: "Skipped fetching Bans",
                        url: url,
                    });
                }
            } catch (anError) {
                setError(anError as Error);
                ReportError("useFetchBans.fetchBans", anError, {
                    url: url,
                }, alertPopup);
            }

            setLoading(false);
            setBans(theBans);

        }

        fetchBans();

    }, [props.active, props.currentPage, props.fromDate, props.guestId,
        props.pageSize, props.toDate, props.withFacility, props.withGuest,
        alertPopup, facilityContext.facility]);

    return {
        bans: bans,
        error: error ? error : null,
        loading: loading,
    }

}

export default useFetchBans;
