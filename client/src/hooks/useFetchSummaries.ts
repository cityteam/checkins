// useFetchSummaries ---------------------------------------------------------

// Custom hook to fetch Summary objects that correspond to input properties.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import Api from "../clients/Api";
import FacilityContext from "../components/contexts/FacilityContext";
import {CHECKINS_BASE} from "../models/Checkin";
import Summary from "../models/Summary";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import ReportError from "../util/ReportError";
import {toSummaries} from "../util/ToModelTypes";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    checkinDateFrom: string;            // Earliest checkinDate to summarize
    checkinDateTo: string;              // Latest checkinDate to summarize
}

export interface State {
    summaries: Summary[];               // Fetched Summaries
    error: Error | null;                // I/O error (if any)
    loading: boolean;                   // Are we currently loading?
}

// Hook Details --------------------------------------------------------------

const useFetchSummaries = (props: Props): State => {

    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [summaries, setSummaries] = useState<Summary[]>([]);

    const facilityContext = useContext(FacilityContext);

    useEffect(() => {

        const fetchSummaries = async () => {

            setError(null);
            setLoading(true);
            let theSummaries: Summary[] = [];

            const parameters = {
                checkinDateFrom: props.checkinDateFrom,
                checkinDateTo: props.checkinDateTo,
            }

            try {
                if (facilityContext.facility.id > 0) {
                    theSummaries = toSummaries((await Api.get(CHECKINS_BASE
                        + `/${facilityContext.facility.id}/summaries/${props.checkinDateFrom}/${props.checkinDateTo}`))
                        .data);
                    logger.debug({
                        context: "useFetchSummaries.fetchSummaries",
                        facility: Abridgers.FACILITY(facilityContext.facility),
                        parameters: parameters,
                        count: theSummaries.length,
                    });
                }
            } catch (anError) {
                setError(anError as Error);
                ReportError("useFetchSummaries.fetchSummaries", anError, {
                    facility: Abridgers.FACILITY(facilityContext.facility),
                    ...parameters,
                });
            }

            setLoading(false);
            setSummaries(theSummaries);

        }

        fetchSummaries();

    }, [facilityContext.facility, props.checkinDateFrom, props.checkinDateTo]);

    return {
        error: error ? error : null,
        loading: loading,
        summaries: summaries,
    }

}

export default useFetchSummaries;
