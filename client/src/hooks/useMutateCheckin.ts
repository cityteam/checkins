// useMutateCheckin ----------------------------------------------------------

// Custom hook to encapsulate assigning, deassigning, and reassigning Guests
// for already existing Checkins.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleAssignPromise, HandleCheckinPromise} from "../types";
import Api from "../clients/Api";
import FacilityContext from "../components/facilities/FacilityContext";
import Assign from "../models/Assign";
import Checkin, {CHECKINS_BASE} from "../models/Checkin";
import Template from "../models/Template";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import ReportError from "../util/ReportError";
import * as ToModel from "../util/ToModel";

// Incoming Properties and Outgoing State ------------------------------------

type HandleGenerate = (checkinDate: string, template: Template) => void;

export interface Props {
    alertPopup?: false,                 // Pop up browser alert on error? [true]
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

    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
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
        const url = `${CHECKINS_BASE}/${facilityContext.facility.id}/${props.checkin.id}/assignment`;

        try {
            assigned = ToModel.CHECKIN((await Api.post(url, theAssign)).data);
            logger.debug({
                context: "useMutateCheckin.assign",
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(assigned),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateCheckin.assign", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(props.checkin),
                assign: theAssign,
                url: url,
            }, alertPopup);
        }

        setExecuting(false);
        return assigned;

    }

    const deassign: HandleCheckinPromise = async (theCheckin: Checkin): Promise<Checkin> => {

        let deassigned: Checkin = new Checkin();
        setError(null);
        setExecuting(true);
        const url = `${CHECKINS_BASE}/${facilityContext.facility.id}/${props.checkin.id}/assignment`;

        try {
            deassigned = ToModel.CHECKIN((await Api.delete(url)).data);
            logger.debug({
                context: "useMutateCheckin.deassign",
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(deassigned),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateCheckin.deassign", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(theCheckin),
                url: url,
            }, alertPopup);
        }

        setExecuting(false);
        return deassigned;

    }

    const generate: HandleGenerate = async (checkinDate, template) => {

        setError(null);
        setExecuting(true);
        const url = `${CHECKINS_BASE}/${facilityContext.facility.id}/generate/${checkinDate}/${template.id}`;

        try {
            /* checkins = */ToModel.CHECKINS((await Api.post(url)).data);
            logger.debug({
                context: "useMutateCheckin.generate",
                checkinDate: checkinDate,
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(template),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateCheckin.generate", anError, {
                checkinDate: checkinDate,
                facility: Abridgers.FACILITY(facilityContext.facility),
                template: Abridgers.TEMPLATE(template),
                url: url,
            }, alertPopup);
        }

        setExecuting(false);

    }

    const reassign: HandleAssignPromise = async (theAssign: Assign): Promise<Checkin> => {

        let reassigned: Checkin = new Checkin();
        setError(null);
        setExecuting(true);
        const url = `${CHECKINS_BASE}/${facilityContext.facility.id}/${props.checkin.id}/assignment`

        try {
            reassigned = ToModel.CHECKIN((await Api.put(url, theAssign)).data);
            logger.debug({
                context: "useMutateCheckin.reassign",
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(reassigned),
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateCheckin.reassign", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(props.checkin),
                assign: theAssign,
                url: url,
            }, alertPopup)
        }

        setExecuting(false);
        return reassigned;

    }

    const update: HandleCheckinPromise = async(theCheckin): Promise<Checkin> => {

        let updated: Checkin = new Checkin();
        setError(null);
        setExecuting(true);
        const url = `${CHECKINS_BASE}/${facilityContext.facility.id}/${theCheckin.id}`;

        try {
            updated = ToModel.CHECKIN((await Api.put(url, theCheckin)).data);
            logger.debug({
                context: "useMutateCheckin.update",
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: updated,
                url: url,
            });
        } catch (anError) {
            setError(anError as Error);
            ReportError("useMutateCheckin.update", anError, {
                facility: Abridgers.FACILITY(facilityContext.facility),
                checkin: Abridgers.CHECKIN(theCheckin),
                url: url,
            }, alertPopup)
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
