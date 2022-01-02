// TemplateSelector ----------------------------------------------------------

// Selector drop-down to choose from the active Templates for the current
// Facility the user wishes to interact with.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";

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

    const [index, setIndex] = useState<number>(-1); // Template index if >= 0
    const [label] = useState<string>(props.label ? props.label : "Template:");
    const [name] = useState<string>(props.name ? props.name : "templateSelector");
    const [placeholder] = useState<string>(props.placeholder ? props.placeholder : "(Select Template)");

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
        <Form id="TemplateSelector" inline>
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
                {props.templates.map((template, ti) => (
                    <option key={ti} value={ti}>
                        {template.name}
                    </option>
                ))}
            </Form.Control>
        </Form>
    )

}

export default TemplateSelector;
