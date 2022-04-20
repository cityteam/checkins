// GuestStatus ---------------------------------------------------------------

// Return a Guest status icon (based on the active status of the Guest, and
// whether there is an active or inactive ban on the specified date).

// External Modules ----------------------------------------------------------

import React, {useState} from "react";
import {
    CheckCircleFill, XSquareFill,
} from "react-bootstrap-icons";
import {Dates} from "@craigmcc/shared-utils";

// Internal Modules ----------------------------------------------------------

import Guest from "../../models/Guest";

// Incoming Properties -------------------------------------------------------

export interface Props {
    date?: string;                      // As-of date for ban check [today]
    guest: Guest;                       // Guest for which to return an icon
}

// Component Details --------------------------------------------------------

const GuestStatus = (props: Props) => {

    const [date] = useState<string>(props.date ? props.date : Dates.today());

    const icon = () => {
        let activeBan = false;
        let inactiveBan = false;
        if (props.guest.bans) {
            props.guest.bans.forEach(ban => {
                if ((ban.fromDate <= date) && (ban.toDate >= date)) {
                    if (ban.active) {
                        activeBan = true;
                    } else {
                        inactiveBan = true;
                    }
                }
            });
        }
        if (activeBan) {
            return <XSquareFill color="red" size={32}/>
        } else if (inactiveBan) {
            return <CheckCircleFill color="yellow" size={32}/>
        } else if (props.guest.active) {
            return <CheckCircleFill color="green" size={32}/>
        } else {
            return <CheckCircleFill color="grey" size={32}/>
        }

    }

    return icon();

}

export default GuestStatus;
