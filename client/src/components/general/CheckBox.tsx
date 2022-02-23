// CheckBox ------------------------------------------------------------------

// General purpose standalone checkbox, with optional decorations.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import {HandleBoolean, OnChangeInput} from "../../types";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // Should element receive autoFocus? [false]
    disabled?: boolean;                 // Should element be disabled? [false]
    handleChange?: HandleBoolean;       // Handle new value [no handler]
    id?: string;                        // Element ID [none]
    initialValue: boolean;              // Initial checked state
    label?: string;                     // Element label [none]
}

// Component Details ---------------------------------------------------------

const CheckBox = (props: Props) => {

    const [currentValue, setCurrentValue] = useState<boolean>(props.initialValue)

    useEffect(() => {
        // Force rerender if initialValue changes
    }, [currentValue, props.initialValue]);

    const onChange: OnChangeInput = (event): void => {
        const theValue = event.target.checked;
        setCurrentValue(theValue);
        if (props.handleChange) {
            props.handleChange(theValue);
        }
    }

    return (
        <Form inline>
            <Form.Check
                autoFocus={props.autoFocus ? props.autoFocus : undefined}
                defaultChecked={currentValue}
                id={props.id ? props.id : undefined}
                label={props.label ? props.label : undefined}
                onChange={onChange}
            />
        </Form>
    )

}

export default CheckBox;
