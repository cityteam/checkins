// FacilitySelector ----------------------------------------------------------

// Selector drop-down to choose which Facility the user wants to interact with.
// NOTE: any change in the selection will be propagated to FacilityContext,
// as well as to any specified handleFacility function.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import FacilityContext from "./FacilityContext";
import {HandleFacility, OnChangeSelect} from "../../types";
import Facility from "../../models/Facility";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Incoming Properties ------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // Should element receive autoFocus? [false]
    disabled?: boolean;                 // Should element be disabled? [false]
    handleFacility?: HandleFacility;    // Handle Facility selection [No handler]
    label?: string;                     // Element label [Facility:]
    name?: string;                      // Input control name [facilitySelector]
    placeholder?: string;               // Placeholder option text [(Select Facility)]
}

// Component Details ---------------------------------------------------------

export const FacilitySelector = (props: Props) => {

    const facilityContext = useContext(FacilityContext);

    const [index, setIndex] = useState<number>(-1);
    const [label] = useState<string>(props.label ? props.label : "Facility:");
    const [name] = useState<string>(props.name ? props.name : "facilitySelector");
    const [placeholder] = useState<string>(props.placeholder ? props.placeholder : "(Select Facility)");

    useEffect(() => {
        logger.debug({
            context: "FacilitySelector.useEffect",
            facilities: facilityContext.facilities,
        });
        // Special case for this selector
        let newIndex = -1;
        facilityContext.facilities.forEach((facility, theIndex) => {
            if (facility.id === facilityContext.facility.id) {
                newIndex = theIndex;
            }
        });
        setIndex(newIndex);
    }, [facilityContext, facilityContext.facilities]);

    const onChange: OnChangeSelect = (event) => {
        const theIndex = parseInt(event.target.value, 10);
        const theFacility = (theIndex >= 0) ? facilityContext.facilities[theIndex] : new Facility();
        logger.trace({
            context: "FacilitySelector.onChange",
            index: theIndex,
            facility: Abridgers.FACILITY(theFacility),
        });
        setIndex(theIndex);
        facilityContext.handleSelect(theFacility);  // Special case for this selector
        if (props.handleFacility) {
            props.handleFacility(theFacility);
        }
    }

    return (
        <Form id="FacilitySelector" inline>
            <Form.Label className="mr-2" htmlFor="facilitySelector">
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
                {facilityContext.facilities.map((facility, fi) => (
                    <option key={fi} value={fi}>
                        {facility.name}
                    </option>
                ))}
            </Form.Control>
        </Form>
    )

}

export default FacilitySelector;
