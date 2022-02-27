// FacilitySelector ----------------------------------------------------------

// Selector drop-down to choose which Facility the user wants to interact with.
// NOTE: any change in the selection will be propagated to FacilityContext,
// as well as to any specified handleFacility function.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";

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

    useEffect(() => {
        logger.debug({
            context: "FacilitySelector.useEffect",
            facilities: Abridgers.FACILITIES(facilityContext.facilities),
        });
        // Special case for this selector when a Facility was previously selected
        let newIndex = -1;
        facilityContext.facilities.forEach((facility, fi) => {
            if (facility.id === facilityContext.facility.id) {
                newIndex = fi;
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
        <div className="form-inline">
            <label className="me-2" htmlFor={props.name ? props.name : "facilitySelector"}>
                {props.label ? props.label : "Facility:"}
            </label>
            <select
                autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                className="form-control-sm"
                disabled={(props.disabled !== undefined) ? props.disabled : undefined}
                id={props.name ? props.name : "facilitySelector"}
                onChange={onChange}
                value={index}
            >
                <option key="-1" value="-1">
                    {props.placeholder ? props.placeholder : "(Select Facility)"}
                </option>
                {facilityContext.facilities.map((facility, fi) => (
                    <option key={fi} value={fi}>
                        {facility.name}
                    </option>
                ))}
            </select>
        </div>
    )

}

export default FacilitySelector;
