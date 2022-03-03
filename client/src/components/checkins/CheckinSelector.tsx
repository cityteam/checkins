// CheckinSelector -----------------------------------------------------------

// Selector drop-down to choose which Checkin the user wants to interact with.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleCheckin, OnChangeSelect} from "../../types";
import Checkin from "../../models/Checkin";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // Should element receive autoFocus? [false]
    checkins: Checkin[];                // Checkins to be offered
    disabled?: boolean;                 // Should element be disabled? [false]
    handleCheckin?: HandleCheckin;      // Handle Checkin selection [no handler]
    label?: string;                     // Element label [Checkin:]
    name?: string;                      // Input control name [checkinSelector]
    placeholder?: string;               // Placeholder option text [(Select Checkin)]
}

// Component Details ---------------------------------------------------------

const CheckinSelector = (props: Props) => {

    const [index, setIndex] = useState<number>(-1);

    useEffect(() => {
        logger.debug({
            context: "CheckinSelector.useEffect",
            checkins: Abridgers.CHECKINS(props.checkins),
        });
    }, [props.checkins]);

    const onChange: OnChangeSelect = (event) => {
        const theIndex = parseInt(event.target.value, 10);
        const theCheckin = (theIndex >= 0) ? props.checkins[theIndex] : new Checkin();
        logger.trace({
            context: "CheckinSelector.onChange",
            index: theIndex,
            checkin: Abridgers.CHECKIN(theCheckin),
        });
        setIndex(theIndex);
        if (props.handleCheckin) {
            props.handleCheckin(theCheckin);
        }
    }

    return(
        <div className="form-inline">
            <label className="me-2" htmlFor={props.name ? props.name : "checkinSelector"}>
                {props.label ? props.label : "Checkin:"}
            </label>
            <select
                autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                className="form-control-sm"
                disabled={(props.disabled !== undefined) ? props.disabled : undefined}
                id={props.name ? props.name : "checkinSelector"}
                onChange={onChange}
                value={index}
            >
                <option key="-1" value="-1">
                    {props.placeholder ? props.placeholder : "(Select Checkin)"}
                </option>
                {props.checkins.map((checkin, ci) => (
                    <option key={ci} value={ci}>
                        {checkin.matNumber}{checkin.features}
                    </option>
                ))}
            </select>
        </div>
    )

}

export default CheckinSelector;
