// useMutateCheckin ----------------------------------------------------------

// Custom hook to encapsulate assigning, deassigning, and reassigning Guests
// for already existing Checkins.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleAssignPromise, HandleCheckinPromise} from "../types";
import Api from "../clients/Api";
import FacilityContext from "../components/contexts/FacilityContext";
import Assign from "../models/Assign";
import Checkin, {CHECKINS_BASE} from "../models/Checkin";
import Template from "../models/Template";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import ReportError from "../util/ReportError";
import {toCheckin, toCheckins} from "../util/ToModelTypes";

// Incoming Properties and Outgoing State ------------------------------------

type HandleGenerate = (checkinDate: string, template: Template) => void;

export interface Props {
    checkin: Checkin;                   // The Checkin being managed
}

export interface State {
    error: Error | null;                // I/O error (if any)
    executing: boolean;                 // Are we currently executing?
    assign: HandleAssignPromise;        // Handle Checkin assignment
    deassign: HandleCheckinPromise;     // Handle Checkin deassignment
    generate: HandleGenerate;           // Handle generating Checkins from a Template
    reassign: HandleAssignPromise;      // Handle Checkin reassignment
    update: HandleCheckinPromise;       // Handle Checkin update
}

// Component Details ---------------------------------------------------------

const useMutateCheckin = (props: Props): State => {

    const facilityContext = useContext(FacilityContext);

    const [error, setError] = useState<Error | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "useMutateCheckin.useEffect",
            checkin: props.checkin,
        });
    }, [props.checkin]);

    const assign: HandleAssignPromise = async (theAssign: Assign): Promise<Checkin> => {

        let assigned: Checkin = new Checkin();
        setError(null);
        setExecuting(true);

        try {
            assigned = toCheckin((await Api.post(CHECKINS_BASE
                + `/${facilityContext.facility.id}/${props.checkin.id}/assignment`, theAssign))
                .data);
            logger.debug({
                context: "useMutateCheckin.assign",
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(assigned),
            });
        } catch (error) {
            setError(error as Error);
            ReportError("useMutateCheckin.assign", error, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(props.checkin),
                assign: theAssign,
            });
        }

        setExecuting(false);
        return assigned;

    }

    const deassign: HandleCheckinPromise = async (theCheckin: Checkin): Promise<Checkin> => {

        let deassigned: Checkin = new Checkin();
        setError(null);
        setExecuting(true);

        try {
            deassigned = toCheckin((await Api.delete(CHECKINS_BASE
                + `/${facilityContext.facility.id}/${props.checkin.id}/assignment`))
                .data);
            logger.debug({
                context: "useMutateCheckin.deassign",
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(deassigned),
            });
        } catch (error) {
            setError(error as Error);
            ReportError("useMutateCheckin.deassign", error, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(theCheckin),
            })
        }

        setExecuting(false);
        return deassigned;

    }

    const generate: HandleGenerate = async (checkinDate, template) => {

//        let checkins: Checkin[] = [];
        setError(null);
        setExecuting(true);

        try {
            /* checkins = */toCheckins((await Api.post(CHECKINS_BASE
                + `/${facilityContext.facility.id}/generate/${checkinDate}/${template.id}`))
                .data);
            logger.debug({
                context: "useMutateCheckin.generate",
                checkinDate: checkinDate,
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(template),
//                checkins: Abridgers.CHECKINS(checkins),
            });
        } catch (error) {
            setError(error as Error);
            ReportError("useMutateCheckin.generate", error, {
                checkinDate: checkinDate,
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(template),
            });
        }

        setExecuting(false);

    }

    const reassign: HandleAssignPromise = async (theAssign: Assign): Promise<Checkin> => {

        let reassigned: Checkin = new Checkin();
        setError(null);
        setExecuting(true);

        try {
            reassigned = toCheckin((await Api.put(CHECKINS_BASE
                + `/${facilityContext.facility.id}/${props.checkin.id}/assignment`, theAssign))
                .data);
            logger.debug({
                context: "useMutateCheckin.reassign",
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(reassigned),
            });
        } catch (error) {
            setError(error as Error);
            ReportError("useMutateCheckin.reassign", error, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(props.checkin),
                assign: theAssign,
            })
        }

        setExecuting(false);
        return reassigned;

    }

    const update: HandleCheckinPromise = async(theCheckin): Promise<Checkin> => {

        let updated: Checkin = new Checkin();
        setError(null);
        setExecuting(true);

        try {
            updated = toCheckin((await Api.put(CHECKINS_BASE
                + `/${facilityContext.facility.id}/${theCheckin.id}`, theCheckin))
                .data);
            logger.debug({
                context: "useMutateCheckin.update",
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: updated,
            });
        } catch (error) {
            logger.error({
                context: "useMutateCheckin.update",
                checkin: theCheckin,
                error: error,
            });
            setError(error as Error);
            ReportError("useMutateCheckin.update", error, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(theCheckin),
            })
        }

        setExecuting(false);
        return updated;

    }

    return {
        error: error,
        executing: executing,
        assign: assign,
        deassign: deassign,
        generate: generate,
        reassign: reassign,
        update: update,
    }

}

export default useMutateCheckin;
