// FetchingProgress ----------------------------------------------------------

// Show a "fetching" notification when props.loading switches from false to
// true, and remove it when props.loading switches from true to false.

// Show an "error" notification when props.error switches from null to
// non-null, and remove it when props.error switches from non-null to null.

// In both cases, the notification can be closed with a click.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";

// Internal Modules ----------------------------------------------------------

import logger from "../../util/ClientLogger";

// Incoming Properties -------------------------------------------------------

export interface Props {
    duration?: number;                  // Show duration in ms (0=forever) [default value]
    error?: Error | null;               // Error result (from fetch hook) [no notification]
    loading?: boolean;                  // Loading flag (from fetch hook) [no notification]
    message: string;                    // Message while loading in progress
}

// Component Details ---------------------------------------------------------

const FetchingProgress = (props: Props) => {

    const [errorId, setErrorId] = useState<React.ReactText | null>(null);
    const [loadingId, setLoadingId] = useState<React.ReactText | null>(null);

    // Handle Error Notification ---------------------------------------------
    useEffect(() => {
        logger.debug({
            context: "FetchingProgress.useEffect:error",
            duration: props.duration ? props.duration : undefined,
            error: props.error ? props.error.message : undefined,
            loading: (props.loading !== undefined) ? props.loading : undefined,
            message: props.message,
            errorId: errorId,
        });
        if (props.error !== undefined) {
            if (props.error && (errorId === null)) {
                const theErrorId = toast.error(props.error.message, {
                    autoClose: false,
                });
                setErrorId(theErrorId);
            } else if (!props.error && (errorId !== null)) {
                toast.dismiss(errorId);
                setErrorId(null);
            }
        }
    }, [props.duration, props.error,  props.loading, props.message, errorId]);

    // Handle Fetching Notification ------------------------------------------
    useEffect(() => {
        logger.debug({
            context: "FetchingProgress.useEffect:fetching",
            duration: props.duration ? props.duration : undefined,
            error: props.error ? props.error.message : undefined,
            loading: (props.loading !== undefined) ? props.loading : undefined,
            message: props.message,
            loadingId: loadingId,
        });
        if (props.loading !== undefined) {
            if (props.loading && (loadingId === null)) {
                const theLoadingId = toast.info(props.message, {
                    autoClose: false,
                });
                setLoadingId(theLoadingId);
            } else if (!props.loading && (loadingId !== null)) {
                toast.dismiss(loadingId);
                setLoadingId(null);
            }
        }
    }, [props.duration, props.error,  props.loading, props.message, loadingId]);

    return (<div></div>);

}

export default FetchingProgress;
