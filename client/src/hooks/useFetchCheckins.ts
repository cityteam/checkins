// useFetchCheckins ------------------------------------------------------------

// Custom hook to fetch Checkin objects that correspond to input properties.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleAction} from "../types";
import Api from "../clients/Api";
import FacilityContext from "../components/facilities/FacilityContext";
import Checkin, {CHECKINS_BASE} from "../models/Checkin";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import {queryParameters} from "../util/QueryParameters";
import ReportError from "../util/ReportError";
import * as ToModel from "../util/ToModel";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    alertPopup?: boolean;               // Pop up browser alert on error? [true]
    available?: boolean;                // Select only non-assigned Checkins? [false]
    currentPage?: number;               // One-relative current page number [1]
    date?: string;                      // Select for this Checkin date [no filter]
    guestId?: number;                   // Select for this guestId [no filter]
    pageSize?: number;                  // Number of entries per page [100]
    withFacility?: boolean;             // Include parent Facility? [false]
    withGuest?: boolean;                // Include parent Guest (if any)? [false]
}

export interface State {
    checkins: Checkin[];                // Fetched Checkins
    error: Error | null;                // I/O error (if any)
    loading: boolean;                   // Are we currently loading?
    refresh: HandleAction;              // Trigger a refresh with current selection properties
}

// Hook Details --------------------------------------------------------------

const useFetchCheckins = (props: Props): State => {

    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [refetch, setRefetch] = useState<boolean>(false);

    const facilityContext = useContext(FacilityContext);

    useEffect(() => {

        const fetchCheckins = async () => {

            setError(null);
            setLoading(true);
            let theCheckins: Checkin[] = [];

            const limit = props.pageSize ? props.pageSize : 100;
            const offset = props.currentPage ? (limit * (props.currentPage - 1)) : 0;
            const parameters = {
                available: props.available ? "" : undefined,
                date: props.date ? props.date : undefined,
                guestId: props.guestId ? props.guestId : undefined,
                limit: limit,
                offset: offset,
                withFacility: props.withFacility ? "" : undefined,
                withGuest: props.withGuest ? "" : undefined,
            }
            const url = `${CHECKINS_BASE}/${facilityContext.facility.id}${queryParameters(parameters)}`;

            try {
                // Too many Checkins for a useful non-filtered fetch
                const tryFetch = (facilityContext.facility.id > 0) && (props.date || props.guestId);
                if (tryFetch) {
                    // Disable caching to always get the latest data
                    theCheckins = ToModel.CHECKINS((await Api.get(url, {
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0',
                        },
                    })).data);
                    logger.debug({
                        context: "useFetchCheckins.fetchCheckins",
                        facility: Abridgers.FACILITY(facilityContext.facility),
                        checkins: Abridgers.CHECKINS(theCheckins),
                        url: url,
                    });
                } else {
                    logger.debug({
                        context: "useFetchCheckins.fetchCheckins",
                        msg: "Skipped fetching Checkins",
                        facility: Abridgers.FACILITY(facilityContext.facility),
                    });
                }
            } catch (anError) {
                setError(anError as Error);
                ReportError("useFetchCheckins.fetchCheckins", anError, {
                    facility: Abridgers.FACILITY(facilityContext.facility),
                    url: url,
                }, alertPopup);
            }

            setLoading(false);
            setCheckins(theCheckins);
            setRefetch(false);

        }

        fetchCheckins();

    }, [props.available, props.currentPage, props.date,
        facilityContext.facility, props.guestId, props.pageSize,
        props.withFacility, props.withGuest,
        alertPopup, refetch]);

    const refresh = () => {
        setRefetch(true);
    }

    return {
        checkins: checkins,
        error: error ? error : null,
        loading: loading,
        refresh: refresh,
    }

}

export default useFetchCheckins;
