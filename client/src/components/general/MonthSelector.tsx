// TimeSelector --------------------------------------------------------------

// Selector text field to choose a month (YYYY-MM string) for processing.
// On up-to-date browsers, this will utilize the browser's extended
// input facilities.  For all other browsers, it will fall back to
// accepting and processing text strings.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";

// Internal Modules ----------------------------------------------------------

import {HandleMonth, OnChangeInput, OnClick, OnKeyDown} from "../../types";
import logger from "../../util/ClientLogger";
import {validateMonth} from "../../util/Validators";

// Incoming Properties -------------------------------------------------------

export interface Props {
    actionLabel?: string;               // Label for action button [no button]
    actionVariant?: string;             // Variant for action button [success]
    autoFocus?: boolean;                // Should element receive autoFocus? [false]
    disabled?: boolean;                 // Should element be disabled? [false]
    handleMonth?: HandleMonth;          // Handle month selection [No handler]
    label?: string;                     // Element label [Month:]
    max?: string;                       // Maximum accepted value [no limit]
    min?: string;                       // Minimum accepted value [no limit]
    name?: string;                      // Input control name [monthSelector]
    required?: boolean;                 // Is entry required? [false]
    type?: "month" | "text";            // Control type (month,text) [month]
    value?: string;                     // Initially displayed value [""]
}

// Component Details ---------------------------------------------------------

const MonthSelector = (props: Props) => {

    const [label] = useState<string>(props.label ? props.label : "Month:");
    const [name] = useState<string>(props.name ? props.name : "monthSelector");
    const [type] = useState<string>(props.type ? props.type : "month");
    const [value, setValue] = useState<string>(props.value ? props.value : "");

    useEffect(() => {
        logger.debug({
            context: "MonthSelector.useEffect"
        });
    });

    const onChange: OnChangeInput = (event): void => {
        const theValue = event.target.value;
        setValue(theValue);
    }

    const onClick: OnClick = () => {
        processValue(value);
    }

    const onKeyDown: OnKeyDown = (event): void => {
        if ((event.key === "Enter") || (event.key === "Tab")) {
            processValue(value);
        }
    }

    const processValue = (newValue: string): void => {

        // Validate the response
        let newValid = validateMonth(newValue);
        if (props.required && (newValue === "")) {
            newValid = false;
        } else if (props.max && (newValue > props.max)) {
            newValid = false;
        } else if (props.min && (newValue < props.min)) {
            newValid = false;
        }

        // Forward response to parent if valid
        if (!newValid) {
            let message = "Invalid month, must be in format YYYY-MM";
            if (props.required && (newValue === "")) {
                message += ", required";
            }
            if (props.max && (newValue > props.max)) {
                message += `, <= ${props.max}`;
            }
            if (props.min && (newValue < props.min)) {
                message += `, >= ${props.min}`;
            }
            alert(message);
        } else if (newValid && props.handleMonth) {
            props.handleMonth(newValue);
        }

    }

    return (
        <div className="form-inline">
            <label className="me-2" htmlFor={name}>
                {label}
            </label>
            <input
                autoFocus={props.autoFocus ? props.autoFocus : undefined}
                disabled={props.disabled ? props.disabled : undefined}
                id={name}
                max={props.max ? props.max : undefined}
                min={props.min ? props.min : undefined}
                onChange={onChange}
                onKeyDown={onKeyDown}
                type={type}
                value={value}
            />
            {(props.actionLabel) ? (
                <Button
                    className="ms-2"
                    onClick={onClick}
                    size="sm"
                    variant={props.actionVariant ? props.actionVariant : "success"}
                >{props.actionLabel}</Button>
            ) : null}
        </div>
    )

}

export default MonthSelector;
