// BanSegment ----------------------------------------------------------------

// Top-level view for managing Ban objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import {MutatingProgress} from "@craigmcc/shared-react";
import {Dates} from "@craigmcc/shared-utils";

// Internal Modules ----------------------------------------------------------

import BanDetails from "./BanDetails";
import BanOptions from "./BanOptions";
import FacilityContext from "../facilities/FacilityContext";
import GuestOptions from "../guests/GuestOptions";
import LoginContext from "../login/LoginContext";
import {HandleAction, HandleBan, HandleGuest, Scope} from "../../types";
import useMutateBan from "../../hooks/useMutateBan";
import Ban from "../../models/Ban";
import Guest from "../../models/Guest";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

enum View {
    BANS = "Bans",
    DETAILS = "Details",
    GUESTS = "Guests",
}

const BanSegment = () => {

    const TODAY = Dates.today();

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [ban, setBan] = useState<Ban>(new Ban());
    const [canInsert, setCanInsert] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [canUpdate, setCanUpdate] = useState<boolean>(false);
    const [guest, setGuest] = useState<Guest>(new Guest());
    const [message, setMessage] = useState<string>("");
    const [view, setView] = useState<View>(View.GUESTS);

    const mutateBan = useMutateBan({
        alertPopup: false,
    });

    useEffect(() => {

        logger.debug({
            context: "BanSegment.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
            view: view.toString(),
        });

        const isAdmin = loginContext.validateFacility(facilityContext.facility, Scope.ADMIN);
        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        setCanInsert(isAdmin || isSuperuser);
        setCanRemove(isAdmin || isSuperuser);
        setCanUpdate(isAdmin || isSuperuser);

    }, [facilityContext.facility, loginContext, loginContext.data.loggedIn,
        ban, guest, view]);

    // Handle request to add a new Ban
    const handleAdd: HandleAction = () => {
        const theBan = new Ban({
            id: -1,
            active: true,
            comments: null,
            facilityId: facilityContext.facility.id,
            fromDate: TODAY,
            guestId: guest.id,
            staff: null,
            toDate: TODAY,
        });
        logger.debug({
            context: "BanSegment.handleAdd",
            ban: theBan,
        });
        setBan(theBan);
        setView(View.DETAILS);
    }

    // Handle Back request from BANS view
    const handleBackBans: HandleAction = () => {
        setView(View.GUESTS);
    }

    // Handle Back request from DETAILS view
    const handleBackDetails: HandleAction = () => {
        setView(View.BANS);
    }

    // Handle request to edit an existing Ban
    const handleEdit: HandleBan = (theBan) => {
        logger.debug({
            context: "BanSegment.handleEdit",
            ban: Abridgers.BAN(theBan),
        });
        setBan(theBan);
        setView(View.DETAILS);
    }

    // Handle selection of a Guest in the GUESTS view
    const handleGuest: HandleGuest = (theGuest) => {
        logger.debug({
            context: "BanSegment.handleGuest",
            guest: Abridgers.GUEST(theGuest),
        });
        setGuest(theGuest);
        setView(View.BANS);
    }

    // Handle insert of a new Ban
    const handleInsert: HandleBan = async (theBan) => {
        setMessage(`Inserting Ban for ${theBan.fromDate} - ${theBan.toDate}`);
        const inserted = await mutateBan.insert(theBan);
        logger.debug({
            context: "BanSegment.handleInsert",
            ban: Abridgers.BAN(inserted),
        });
        setView(View.BANS);
    }

    // Handle remove of an existing Ban
    const handleRemove: HandleBan = async (theBan) => {
        setMessage(`Removing Ban for ${theBan.fromDate} - ${theBan.toDate}`);
        const removed = await mutateBan.remove(theBan);
        logger.debug({
            context: "BanSegment.handleRemove",
            ban: Abridgers.BAN(removed),
        });
        setView(View.BANS);
    }

    // Handle Update of an existing Ban
    const handleUpdate: HandleBan = async (theBan) => {
        setMessage(`Updating Ban for ${theBan.fromDate} - ${theBan.toDate}`);
        logger.info({
            context: "BanSegment.updating",
            ban: theBan,
        });
        const updated = await mutateBan.update(theBan);
        logger.debug({
            context: "BanSegment.handleUpdate",
            ban: Abridgers.BAN(updated),
        });
        setView(View.BANS);
    }

    return (
        <>

            <MutatingProgress
                error={mutateBan.error}
                executing={mutateBan.executing}
                message={message}
            />

            {(view === View.BANS) ? (
                <BanOptions
                    guest={guest}
                    handleAdd={canInsert ? handleAdd : undefined}
                    handleBack={handleBackBans}
                    handleEdit={canUpdate ? handleEdit: undefined}
                />
            ) : null }

            {(view === View.DETAILS) ? (
                <BanDetails
                    ban={ban}
                    guest={guest}
                    handleBack={handleBackDetails}
                    handleInsert={canInsert ? handleInsert : undefined}
                    handleRemove={canRemove ? handleRemove : undefined}
                    handleUpdate={canUpdate ? handleUpdate : undefined}
                />
            ) : null }

            {(view === View.GUESTS) ? (
                <GuestOptions
                    handleEdit={handleGuest}
                    prefix="Ban-"
                    withHeading={false}
                    withHeadingBan={true}
                />
            ) : null }

        </>
    )

}

export default BanSegment;
