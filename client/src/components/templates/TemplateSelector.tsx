// TemplateSelector ----------------------------------------------------------

// Selector drop-down to choose from the active Templates for the current
// Facility the user wishes to interact with.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {HandleTemplate, OnChangeSelect} from "../../types";
import Template from "../../models/Template";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // Should element receive autoFocus? [false]
    disabled?: boolean;                 // Should element be disabled? [false]
    handleTemplate?: HandleTemplate;    // Handle Template selection [No handler]
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

    const onChange: OnChangeSelect = (event) => {
        const theIndex = parseInt(event.target.value, 10);
        const theTemplate = (theIndex >= 0) ? props.templates[theIndex] : new Template();
        logger.trace({
            context: "TemplateSelector.onChange",
            index: theIndex,
            template: Abridgers.TEMPLATE(theTemplate),
        });
        setIndex(theIndex);
        if ((theIndex >= 0) && props.handleTemplate) {
            props.handleTemplate(theTemplate);
        }
    }

    return (
        <div className="form-inline">
            <label className="me-2" htmlFor={props.name ? props.name : "templateSelector"}>
                {props.label ? props.label : "Template:"}
            </label>
            <select
                autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                className="form-control-sm"
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
        </div>
    )

}

export default TemplateSelector;
