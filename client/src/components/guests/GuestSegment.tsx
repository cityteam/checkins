// GuestSegment -------------------------------------------------------------

// Top-level view for managing Guest objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import GuestDetails from "./GuestDetails";
import GuestOptions from "./GuestOptions";
import FacilityContext from "../facilities/FacilityContext";
import LoginContext from "../login/LoginContext";
import {HandleAction, HandleGuest, Scope} from "../../types";
import useMutateGuest from "../../hooks/useMutateGuest";
import Guest from "../../models/Guest";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

enum View {
    DETAILS = "Details",
    OPTIONS = "Options",
}

const GuestSegment = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canInsert, setCanInsert] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [canUpdate, setCanUpdate] = useState<boolean>(false);
    const [guest, setGuest] = useState<Guest>(new Guest());
    const [title, setTitle] = useState<string>("");
    const [view, setView] = useState<View>(View.OPTIONS);

    const mutateGuest = useMutateGuest({
        // NOTE - alertPopup: false,
    });

    useEffect(() => {

        logger.debug({
            context: "GuestSegment.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
            view: view.toString(),
        });

        const isAdmin = loginContext.validateFacility(facilityContext.facility, Scope.ADMIN);
        const isRegular = loginContext.validateFacility(facilityContext.facility, Scope.REGULAR);
        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        setCanInsert(isAdmin || isRegular || isSuperuser);
        setCanRemove(isSuperuser);
        setCanUpdate(isAdmin || isRegular || isSuperuser);

    }, [facilityContext.facility, loginContext, loginContext.data.loggedIn,
        guest, view]);

    // Create an empty Guest to be added
    const handleAdd: HandleAction = () => {
        setGuest(new Guest({
            active: true,
            comments: null,
            facilityId: facilityContext.facility.id,
            firstName: null,
            lastName: null,
        }));
    }

    // Handle return from View.DETAILS to redisplay View.OPTIONS
    const handleBack: HandleAction = () => {
        setView(View.OPTIONS);
    }

    // Handle selection of a Guest to edit details
    const handleEdit: HandleGuest = (theGuest) => {
        logger.debug({
            context: "GuestSegment.handleEdit",
            guest: Abridgers.GUEST(theGuest),
        });
        setGuest(theGuest);
        setView(View.DETAILS);
    }

    // Handle insert of a new Guest
    const handleInsert: HandleGuest = async (theGuest) => {
        setTitle(`${theGuest.lastName}, ${theGuest.firstName}`);
        const inserted = await mutateGuest.insert(theGuest);
        logger.debug({
            context: "GuestSegment.handleInsert",
            title: title,
            guest: Abridgers.GUEST(inserted),
        });
        setView(View.OPTIONS);
    }

    // Handle remove of an existing Guest
    const handleRemove: HandleGuest = async (theGuest) => {
        setTitle(`${theGuest.lastName}, ${theGuest.firstName}`);
        const removed = await mutateGuest.remove(theGuest);
        logger.debug({
            context: "GuestSegment.handleRemove",
            title: title,
            guest: Abridgers.GUEST(removed),
        });
        setView(View.OPTIONS);
    }

    // Handle update of an existing Guest
    const handleUpdate: HandleGuest = async (theGuest) => {
        setTitle(`${theGuest.lastName}, ${theGuest.firstName}`);
        const updated = await mutateGuest.update(theGuest);
        logger.debug({
            context: "GuestSegment.handleUpdate",
            title: title,
            guest: Abridgers.GUEST(updated),
        });
        setView(View.OPTIONS);
    }

    return (
        <>

            {/* NOTE - not yet implemented
            <SavingProgress
                error={mutateFacility.error}
                executing={mutateFacility.executing}
                title={title}
            />
            */}

            {(view === View.DETAILS) ? (
                <GuestDetails
                    autoFocus
                    guest={guest}
                    handleBack={handleBack}
                    handleInsert={canInsert ? handleInsert : undefined}
                    handleRemove={canRemove ? handleRemove : undefined}
                    handleUpdate={canUpdate ? handleUpdate : undefined}
                />
            ) : null }

            {(view === View.OPTIONS) ? (
                <GuestOptions
                    handleAdd={canInsert ? handleAdd : undefined}
                    handleEdit={canUpdate ? handleEdit : undefined}
                />
            ) : null }

        </>

    )

}

export default GuestSegment;
