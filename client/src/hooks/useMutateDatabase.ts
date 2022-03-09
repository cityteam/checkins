// useMutateDatabase ---------------------------------------------------------

// Custom hook to encapsulate database administration operations.

// External Modules ----------------------------------------------------------

import {useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleResults} from "../types";
import Api from "../clients/Api";
import logger from "../util/ClientLogger";
import ReportError from "../util/ReportError";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    alertPopup?: false,                 // Pop up browser alert on error? [true]
}

export interface State {
    error: Error | null;                // I/O error (if any)
    executing: boolean;                 // Are we currently executing
    backup: HandleResults;              // Perform a database backup
}

// Component Details ---------------------------------------------------------

const useMutateDatabase = (props: Props): State => {

    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
    const [error, setError] = useState<Error | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            contxt: "useMutateDatabase.useEffect",
        });
    }, []);

    const backup: HandleResults = async (): Promise<object> => {

        setError(null);
        setExecuting(true);
        let results:object = {};

        try {
            results = (await Api.post("/database/backup")).data;
            logger.info({
                context: "useMutateDatabse.backup",
                msg: "Successful database backup",
                result: results,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateDtabase.backup", anError, {}, alertPopup);
        }

        setExecuting(false);
        return results;

    }

    return {
        error: error,
        executing: executing,
        backup: backup,
    }

}

export default useMutateDatabase;
