// DateSelector --------------------------------------------------------------

// Selector text field to choose a date (YYYY-MM-DD string) for processing.
// On up-to-date browsers, this will utilize the browser's extended
// input facilities.  For all other browsers, it will fall back to
// accepting and processing text strings.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import {HandleDate, OnChangeInput, OnClick, OnKeyDown} from "../../types";
import logger from "../../util/ClientLogger";
import {validateDate} from "../../util/Validators";

// Incoming Properties -------------------------------------------------------

export interface Props {
    actionLabel?: string;               // Label for action button [no button]
    actionVariant?: string;             // Variant for action button [success]
    autoFocus?: boolean;                // Should element receive autoFocus? [false]
    disabled?: boolean;                 // Should element be disabled? [false]
    handleDate?: HandleDate;            // Handle date selection [no handler]
    label?: string;                     // Element label [Date:]
    max?: string;                       // Maximum accepted value [no limit]
    min?: string;                       // Minimum accepted value [no limit]
    name?: string;                      // Input control name [dateSelector]
    required?: boolean;                 // Is entry required? [false]
    type?: string;                      // Control type (date,text) [date]
    value?: string;                     // Initially displayed value [""]
}

// Component Details ---------------------------------------------------------

const DateSelector = (props: Props) => {

    const [label] = useState<string>(props.label ? props.label : "Date:");
    const [name] = useState<string>(props.name ? props.name : "dateSelector");
    const [type] = useState<string>(props.type ? props.type : "date");
    const [value, setValue] = useState<string>(props.value ? props.value : "");

    useEffect(() => {
        logger.debug({
            context: "DateSelector.useEffect"
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

    const processValue = (theValue: string) => {

        // Validate the response
        let isValid = validateDate(theValue);
        if (props.required && (theValue === "")) {
            isValid = false;
        } else if (props.max && (theValue > props.max)) {
            isValid = false;
        } else if (props.min && (theValue < props.min)) {
            isValid = false;
        }

        // Forward the value to parent if it is valid
        if (!isValid) {
            let message = "Invalid date, must be in format YYYY-MM-DD";
            if (props.required && (theValue === "")) {
                message += ", required";
            }
            if (props.max && (theValue > props.max)) {
                message += `, <= ${props.max}`;
            }
            if (props.min && (theValue < props.min)) {
                message += `, >= ${props.min}`;
            }
            alert(message);
        } else if (isValid && props.handleDate) {
            props.handleDate(theValue);
        }

    }

    return (
        <Form inline id="DateSelector">
            <Form.Label className="mr-2" htmlFor={name}>
                {label}
            </Form.Label>
            <Form.Control
                autoFocus={props.autoFocus ? props.autoFocus : undefined}
                disabled={props.disabled ? props.disabled : undefined}
                htmlSize={10}
                id={name}
                max={props.max ? props.max : undefined}
                min={props.min ? props.min : undefined}
                onChange={onChange}
                onKeyDown={onKeyDown}
                size="sm"
                type={type}
                value={value}
            />
            {(props.actionLabel) ? (
                <Button
                    className="ml-2"
                    onClick={onClick}
                    size="sm"
                    variant={props.actionVariant ? props.actionVariant : "success"}
                >{props.actionLabel}</Button>
            ) : null}
        </Form>
    )

}

export default DateSelector;
