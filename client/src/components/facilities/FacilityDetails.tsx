// FacilityDetails -----------------------------------------------------------

// Detail editing form for Facility objects.

// External Modules ----------------------------------------------------------

import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import {SubmitHandler, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {Validators} from "@craigmcc/shared-utils";

// Internal Modules ----------------------------------------------------------

import CheckBoxField from "../general/CheckBoxField";
import TextField from "../general/TextField";
import {HandleAction, HandleFacility} from "../../types";
import Facility, {FacilityData} from "../../models/Facility";
import {validateFacilityScope} from "../../util/ApplicationValidators";
import {
    validateFacilityNameUnique,
    validateFacilityScopeUnique
} from "../../util/AsyncValidators";
import * as ToModel from "../../util/ToModel";
import {toNullValues} from "../../util/Transformations";

// Incoming Properties ------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // First element receive autoFocus? [false]
    facility: Facility;                 // Initial values (id < 0 for adding)
    handleBack: HandleAction;           // Handle return to previous view
    handleInsert?: HandleFacility;      // Handle Facility insert request [not allowed]
    handleRemove?: HandleFacility;      // Handle Facility remove request [not allowed]
    handleUpdate?: HandleFacility;      // Handle Facility update request [not allowed]
}

// Component Details ---------------------------------------------------------

const FacilityDetails = (props: Props) => {

    const [adding] = useState<boolean>(props.facility.id < 0);
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
            props.handleRemove(props.facility);
        }
    }

    const onSubmit: SubmitHandler<FacilityData> = (values) => {
        const theFacility = new Facility({
            ...props.facility,
            ...values,
        });
        if (adding && props.handleInsert) {
            props.handleInsert(theFacility);
        } else if (!adding && props.handleUpdate) {
            props.handleUpdate(theFacility);
        }
    }

    const validationSchema = Yup.object().shape({
        active: Yup.boolean(),
        address1: Yup.string()
            .nullable(),
        address2: Yup.string()
            .nullable(),
        city: Yup.string()
            .nullable(),
        email: Yup.string()
            .nullable()
            .test("valid-email",
                "Invalid email format",
                function (value) {
                    return Validators.email(value ? value : "");
                }),
        name: Yup.string()
            .required("Name is required")
            .test("unique-name",
                "That name is already in use",
                async function (this) {
                    return validateFacilityNameUnique(ToModel.FACILITY(toNullValues(this.parent)));
                }
            ),
        phone: Yup.string()
            .nullable()
            .test("valid-phone",
                "Invalid phone number format",
                function (value) {
                    return Validators.phone(value ? value : "");
                }),
        scope: Yup.string()
            .required("Scope is required")
            .test("valid-scope",
                "Only alphanumeric (a-z, A-Z, 0-9) characters are allowed",
                function(value) {
                    return validateFacilityScope(value);
                })
            .test("unique-scope",
                "That scope is already in use",
                async function(value) {
                    return validateFacilityScopeUnique(ToModel.FACILITY(this.parent));
                }),
        state: Yup.string()
            .nullable()
            .test("valid-state",
                "Invalid state abbreviation",
                function(value) {
                    return Validators.state(value ? value : "");
                }),
        zipCode: Yup.string()
            .nullable()
            .test("valid-zip-code",
                "Invalid zip code format",
                function(value) {
                    return Validators.zipCode(value ? value : "");
                }),
        });

    const {formState: {errors}, handleSubmit, register} = useForm<FacilityData>({
        defaultValues: new FacilityData(props.facility),
        mode: "onBlur",
        resolver: yupResolver(validationSchema),
    });

    return (

        <>

            {/* Details Form */}
            <Container id="FacilityDetails">

                <Row className="mb-3">
                    <Col className="text-start">
                        <strong>
                            {(adding)? (
                                <span>Add New</span>
                            ) : (
                                <span>Edit Existing</span>
                            )}
                            &nbsp;Facility
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
                    id="FacilityForm"
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <Row className="g-3 mb-3" id="nameScopeRow">
                        <TextField
                            autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                            errors={errors}
                            label="Name:"
                            name="name"
                            register={register}
                            valid="Name of this Facility (must be unique)."
                        />
                        <TextField
                            errors={errors}
                            label="Scope:"
                            name="scope"
                            register={register}
                            valid="Scope belonging to this Facility (must be alphanumeric and unique)."
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="addressRow">
                        <TextField
                            errors={errors}
                            label="Address 1:"
                            name="address1"
                            register={register}
                        />
                        <TextField
                            errors={errors}
                            label="Address 2:"
                            name="address2"
                            register={register}
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="cityStateZipRow">
                        <TextField
                            className="col-6"
                            errors={errors}
                            label="City:"
                            name="city"
                            register={register}
                        />
                        <TextField
                            errors={errors}
                            label="State:"
                            name="state"
                            register={register}
                        />
                        <TextField
                            errors={errors}
                            label="Zip Code:"
                            name="zipCode"
                            register={register}
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="emailPhoneRow">
                        <TextField
                            errors={errors}
                            label="Email Address:"
                            name="email"
                            register={register}
                        />
                        <TextField
                            errors={errors}
                            label="Phone Number:"
                            name="phone"
                            register={register}
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
                        Removing this Facility is not reversible, and
                        <strong>
                            &nbsp;will also remove ALL related information.
                        </strong>.
                    </p>
                    <p>Consider marking this Facility as inactive instead.</p>
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

export default FacilityDetails;
