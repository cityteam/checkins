// TemplateSegment -----------------------------------------------------------

// Top-level view for managing Template objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import TemplateDetails from "./TemplateDetails";
import TemplateOptions from "./TemplateOptions";
import FacilityContext from "../facilities/FacilityContext";
import LoginContext from "../login/LoginContext";
import {HandleAction, HandleTemplate, Scope} from "../../types";
import useMutateTemplate from "../../hooks/useMutateTemplate";
import Template from "../../models/Template";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

enum View {
    DETAILS = "Details",
    OPTIONS = "Options",
}

const TemplateSegment = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canInsert, setCanInsert] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [canUpdate, setCanUpdate] = useState<boolean>(false);
    const [template, setTemplate] = useState<Template>(new Template());
    const [title, setTitle] = useState<string>("");
    const [view, setView] = useState<View>(View.OPTIONS);

    const mutateTemplate = useMutateTemplate({
        // NOTE - alertPopup: false,
    });

    useEffect(() => {

        logger.debug({
            context: "TemplateSegment.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
            view: view.toString(),
        });

        const isAdmin = loginContext.validateFacility(facilityContext.facility, Scope.ADMIN);
        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        setCanInsert(isAdmin || isSuperuser);
        setCanRemove(isSuperuser);
        setCanUpdate(isAdmin || isSuperuser);

    }, [facilityContext.facility, loginContext, loginContext.data.loggedIn,
        template, view]);

    // Create an empty Template to be added
    const handleAdd: HandleAction = () => {
        setTemplate(new Template({
            active: true,
            allMats: null,
            comments: null,
            facilityId: facilityContext.facility.id,
            handicapMats: null,
            name: null,
            socketMats: null,
            workMats: null,
        }));
        setView(View.DETAILS);
    }

    // Handle return from View.DETAILS to redisplay View.OPTIONS
    const handleBack: HandleAction = () => {
        setView(View.OPTIONS);
    }

    // Handle selection of a Template to edit details
    const handleEdit: HandleTemplate = (theTemplate) => {
        logger.debug({
            context: "TemplateSegment.handleEdit",
            template: Abridgers.TEMPLATE(theTemplate),
        });
        setTemplate(theTemplate);
        setView(View.DETAILS);
    }

    // Handle insert of a new Template
    const handleInsert: HandleTemplate = async (theTemplate) => {
        setTitle(theTemplate.name);
        const inserted = await mutateTemplate.insert(theTemplate);
        logger.debug({
            context: "TemplateSegment.handleInsert",
            title: title,
            template: Abridgers.TEMPLATE(inserted),
        });
        setView(View.OPTIONS);
    }

    // Handle remove of an existing Template
    const handleRemove: HandleTemplate = async (theTemplate) => {
        setTitle(theTemplate.name);
        const removed = await mutateTemplate.remove(theTemplate);
        logger.debug({
            context: "TemplateSegment.handleRemove",
            title: title,
            template: Abridgers.TEMPLATE(removed),
        });
        setView(View.OPTIONS);
    }

    // Handle update of an existing Template
    const handleUpdate: HandleTemplate = async (theTemplate) => {
        setTitle(theTemplate.name);
        const updated = await mutateTemplate.update(theTemplate);
        logger.debug({
            context: "TemplateSegment.handleUpdate",
            title: title,
            template: Abridgers.TEMPLATE(updated),
        });
        setView(View.OPTIONS);
    }

    return (
        <>

            {/* NOTE - not yet implemented
            <SavingProgress
                error={mutateFacility.error}
                executing={mutateFacility.executing}
                title={title}
            />
            */}

            {(view === View.DETAILS) ? (
                <TemplateDetails
                    autoFocus
                    handleBack={handleBack}
                    handleInsert={canInsert ? handleInsert : undefined}
                    handleRemove={canRemove ? handleRemove : undefined}
                    handleUpdate={canUpdate ? handleUpdate : undefined}
                    template={template}
                />
            ) : null }

            {(view === View.OPTIONS) ? (
                <TemplateOptions
                    handleAdd={canInsert ? handleAdd : undefined}
                    handleEdit={canUpdate ? handleEdit : undefined}
                />
            ) : null }

        </>

    )

}

export default TemplateSegment;
