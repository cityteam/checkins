// TemplateDetails -----------------------------------------------------------

// Detail editing form for Template objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import {SubmitHandler, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {CheckBoxField, TextField} from "@craigmcc/shared-react";

// Internal Modules ----------------------------------------------------------

import FacilityContext from "../facilities/FacilityContext";
import {HandleAction, HandleTemplate} from "../../types";
import Template, {TemplateData} from "../../models/Template";
import {
    validateMatsList,
    validateMatsSubset
} from "../../util/ApplicationValidators";
import {validateTemplateNameUnique} from "../../util/AsyncValidators";
import * as ToModel from "../../util/ToModel";
import {toNullValues} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // First element receive autoFocus? [false]
    handleBack: HandleAction;           // Handle return to previous view
    handleInsert?: HandleTemplate;      // Handle Template insert request [not allowed]
    handleRemove?: HandleTemplate;      // Handle Template remove request [not allowed]
    handleUpdate?: HandleTemplate;      // Handle Template update request [not allowed]
    template: Template;                 // Initial values (id < 0 for adding)
}

// Component Details ---------------------------------------------------------

const TemplateDetails = (props: Props) => {

    const facilityContext = useContext(FacilityContext);

    const [adding] = useState<boolean>(props.template.id < 0);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const onConfirm = (): void => {
        setShowConfirm(true);
    }

    const onConfirmNegative = (): void => {
        setShowConfirm(false);
    }

    const onConfirmPositive = (): void => {
        setShowConfirm(false);
        if (props.handleRemove) {
            props.handleRemove(props.template);
        }
    }

    const onSubmit: SubmitHandler<TemplateData> = (values) => {
        const theTemplate = new Template({
            ...props.template,
            ...values
        });
        if (adding && props.handleInsert) {
            props.handleInsert(theTemplate);
        } else if (!adding && props.handleUpdate) {
            props.handleUpdate(theTemplate);
        }
    }

    const validationSchema = Yup.object().shape({
        active: Yup.boolean(),
        allMats: Yup.string()
            .required("All Mats is required")
            .test("valid-all-mats",
                "Invalid mats list format",
                function(value) {
                    return validateMatsList(value ? value : "");
                }),
        comments: Yup.string()
            .nullable(),
        handicapMats: Yup.string()
            .nullable()
            .test("valid-handicap-mats",
                "Invalid mats list format",
                function (value) {
                    return validateMatsList(value ? value : "");
                })
            .test("subset-handicap-mats",
                "Not a subset of all mats",
                function (this) {
                    return validateMatsSubset
                    (this.parent.allMats, this.parent.handicapMats)
                }),
        name: Yup.string()
            .required("Name is required")
            .test("unique-name",
                "That name is already in use within this Facility",
                async function (this) {
                    return validateTemplateNameUnique(ToModel.TEMPLATE(toNullValues(this.parent)));
                }
            ),
        socketMats: Yup.string()
            .nullable()
            .test("valid-socket-mats",
                "Invalid mats list format",
                function (value) {
                    return validateMatsList(value ? value : "");
                })
            .test("subset-socket-mats",
                "Not a subset of all mats",
                function (this) {
                    return validateMatsSubset
                    (this.parent.allMats, this.parent.socketMats)
                }),
        workMats: Yup.string()
            .nullable()
            .test("valid-work-mats",
                "Invalid mats list format",
                function (value) {
                    return validateMatsList(value ? value : "");
                })
            .test("subset-work-mats",
                "Not a subset of all mats",
                function (this) {
                    return validateMatsSubset
                    (this.parent.allMats, this.parent.workMats)
                }),
    });

    const {formState: {errors}, handleSubmit, register} = useForm<TemplateData>({
        defaultValues: new TemplateData(props.template),
        mode: "onBlur",
        resolver: yupResolver(validationSchema),
    });

    return (

        <>

            {/* Details Form */}
            <Container id="TemplateDetails">

                <Row className="mb-3">
                    <Col className="text-start">
                        <strong>
                            {(adding)? (
                                <span>Add New</span>
                            ) : (
                                <span>Edit Existing</span>
                            )}
                            &nbsp;Template for Facility&nbsp;
                            <span className="text-info">
                                {facilityContext.facility.name}
                            </span>
                        </strong>
                    </Col>
                    <Col className="text-end">
                        <Button
                            onClick={() => props.handleBack()}
                            size="sm"
                            type="button"
                            variant="secondary"
                        >Back</Button>
                    </Col>
                </Row>

                <Form
                    id="TemplateForm"
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <Row className="g-3 mb-3" id="nameRow">
                        <TextField
                            autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                            errors={errors}
                            label="Name:"
                            name="name"
                            register={register}
                            valid="Name of this Template (must be unique)."
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="commentsRow">
                        <TextField
                            errors={errors}
                            label="Comments:"
                            name="comments"
                            register={register}
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="allMatsHandicapMatsRow">
                        <TextField
                            errors={errors}
                            label="All Mats:"
                            name="allMats"
                            register={register}
                            valid="Mats that should be generated for this template."
                        />
                        <TextField
                            errors={errors}
                            label="Handicap Mats:"
                            name="handicapMats"
                            register={register}
                            valid="Mats that should be marked 'H' (handicap accessible)."
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="socketMatsWorkMatsRow">
                        <TextField
                            errors={errors}
                            label="Socket Mats:"
                            name="socketMats"
                            register={register}
                            valid="Mats that should be marked 'S' (socket nearby)."
                        />
                        <TextField
                            errors={errors}
                            label="Work Mats:"
                            name="workMats"
                            register={register}
                            valid="Mats that should be marked 'W' (work mats)."
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="activeRow">
                        <CheckBoxField
                            errors={errors}
                            label="Active?"
                            name="active"
                            register={register}
                        />
                    </Row>

                    <Row className="mb-3">
                        <Col className="text-start">
                            <Button
                                disabled={!props.handleInsert && !props.handleUpdate}
                                size="sm"
                                type="submit"
                                variant="primary"
                            >
                                Save
                            </Button>
                        </Col>
                        <Col className="text-end">
                            <Button
                                disabled={adding || !props.handleRemove}
                                onClick={onConfirm}
                                size="sm"
                                type="button"
                                variant="danger"
                            >
                                Remove
                            </Button>
                        </Col>
                    </Row>

                </Form>

            </Container>

            {/* Remove Confirm Modal */}
            <Modal
                animation={false}
                backdrop="static"
                centered
                dialogClassName="bg-danger"
                onHide={onConfirmNegative}
                show={showConfirm}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>WARNING:  Potential Data Loss</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Removing this Template is not reversible, and
                        <strong>
                            &nbsp;will also remove ALL related information.
                        </strong>.
                    </p>
                    <p>Consider marking this Template as inactive instead.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={onConfirmPositive}
                        size="sm"
                        type="button"
                        variant="danger"
                    >
                        Remove
                    </Button>
                    <Button
                        onClick={onConfirmNegative}
                        size="sm"
                        type="button"
                        variant="primary"
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

        </>

    )

}

export default TemplateDetails;
