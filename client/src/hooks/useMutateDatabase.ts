// useMutateDatabase ---------------------------------------------------------

// Custom hook to encapsulate database administration operations.

// External Modules ----------------------------------------------------------

import {useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleResults} from "../types";
import Api from "../clients/Api";
import logger from "../util/ClientLogger";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
}

export interface State {
    error: Error | null;                // I/O error (if any)
    executing: boolean;                 // Are we currently executing
    backup: HandleResults;              // Perform a database backup
}

// Component Details ---------------------------------------------------------

const useMutateDatabase = (props: Props): State => {

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
        } catch (error) {
            logger.error({
                context: "useMutateDatabase.backup",
                msg: "Unsuccessful database backup",
                result: results,
                error: error,
            });
            setError(error as Error);
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
