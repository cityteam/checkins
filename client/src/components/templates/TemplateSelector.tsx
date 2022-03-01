// TemplateSelector ----------------------------------------------------------

// Selector drop-down to choose from the active Templates for the current
// Facility the user wishes to interact with.

// Implementation Note:  If an actionLabel is specified, the corresponding
// button must be clicked in order to trigger handleTemplate processing.
// Otherwise, just changing the selection potion triggers this.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/button";

// Internal Modules ----------------------------------------------------------

import {HandleAction, HandleTemplate, OnChangeSelect} from "../../types";
import Template from "../../models/Template";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Incoming Properties -------------------------------------------------------

export interface Props {
    actionLabel?: string;               // Label for action button [no button]
    actionHelp?: string;                // Text after action button if any [no text]
    actionVariant?: string;             // Variant for action button [success]
    autoFocus?: boolean;                // Should element receive autoFocus? [false]
    disabled?: boolean;                 // Should element be disabled? [false]
    handleAction?: HandleTemplate;      // Handle action button click (or selection if no actionLabel) [no handler]
    handleTemplate?: HandleTemplate;    // Handle Template selection [no handler]
    label?: string;                     // Element label [Template:]
    name?: string;                      // Input control name [templateSelector]
    placeholder?: string;               // Placeholder option text [(Select Template)]
    templates: Template[];              // Templates to be offered
}

// Component Details ---------------------------------------------------------

const TemplateSelector = (props: Props) => {

    const [index, setIndex] = useState<number>(-1);

    useEffect(() => {
        logger.debug({
            context: "TemplateSelector.useEffect",
            templates: Abridgers.TEMPLATES(props.templates),
        });
    }, [props.templates]);

    const handleAction: HandleAction = async () => {
        if ((index >= 0) && props.handleAction) {
            props.handleAction(props.templates[index]);
        }
    }

    const onChange: OnChangeSelect = (event) => {
        const theIndex = parseInt(event.target.value, 10);
        const theTemplate = (theIndex >= 0) ? props.templates[theIndex] : new Template();
        setIndex(theIndex);
        if (theIndex >= 0) {
            if (props.handleTemplate) {
                props.handleTemplate(theTemplate);
            }
            if (!props.actionLabel && props.handleAction) {
                props.handleAction(theTemplate);
            }
        }
    }

    return (
        <div className="form-inline">
            <label className="me-2" htmlFor={props.name ? props.name : "templateSelector"}>
                {props.label ? props.label : "Template:"}
            </label>
            <select
                autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                className="form-control-sm me-2"
                disabled={(props.disabled !== undefined) ? props.disabled : undefined}
                id={props.name ? props.name : "templateSelector"}
                onChange={onChange}
                value={index}
            >
                <option key="-1" value="-1">
                    {props.placeholder ? props.placeholder : "(Select Template)"}
                </option>
                {props.templates.map((template, ti) => (
                    <option key={ti} value={ti}>
                        {template.name}
                    </option>
                ))}
            </select>
            {(props.actionLabel) ? (
                <Button
                    className="me-2"
                    disabled={index < 0}
                    onClick={handleAction}
                >{props.actionLabel}</Button>
            ) : null }
            {(props.actionHelp) ? (
                <span>{props.actionHelp}</span>
            ) : null }
        </div>
    )

}

export default TemplateSelector;
