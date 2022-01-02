// CheckinSelector -----------------------------------------------------------

// Selector drop-down to choose which Checkin the user wants to interact with.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";

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
    handleCheckin: HandleCheckin;       // Handle Checkin selection [no handler]
    label?: string;                     // Element label [Checkin:]
    name?: string;                      // Input control name [checkinSelector]
    placeholder?: string;               // Placeholder option text [(Select Checkin)]
}

// Component Details ---------------------------------------------------------

const CheckinSelector = (props: Props) => {

    const [index, setIndex] = useState<number>(-1);
    const [label] = useState<string>(props.label ? props.label : "Checkin:");
    const [name] = useState<string>(props.name ? props.name : "checkinSelector");
    const [placeholder] = useState<string>(props.placeholder ? props.placeholder : "(Select Checkin)");

    useEffect(() => {
        logger.debug({
            context: "CheckinSelector.useEffect",
            checkins: props.checkins,
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
        if (theIndex >= 0) {
            props.handleCheckin(theCheckin);
        }
    }

    return(
        <Form id="CheckinSelector" inline>
            <Form.Label className="mr-2" htmlFor={name}>
                {label}
            </Form.Label>
            <Form.Control
                as="select"
                autoFocus={props.autoFocus ? props.autoFocus : undefined}
                disabled={props.disabled ? props.disabled : undefined}
                id={name}
                onChange={onChange}
                size="sm"
                value={index}
            >
                <option key="-1" value="-1">{placeholder}</option>
                {props.checkins.map((checkin, ci) => (
                    <option key={ci} value={ci}>
                        {checkin.matNumber}{checkin.features}
                    </option>
                ))}
            </Form.Control>
        </Form>
    )

}

export default CheckinSelector;
