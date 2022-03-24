// GuestForm -----------------------------------------------------------------

// Detail editing form for Guest objects.

// NOTE - style classes: text-left, text-right

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

// Internal Modules ----------------------------------------------------------

import {HandleAction, HandleGuest} from "../../types";
import FacilityContext from "../facilities/FacilityContext";
import Guest, {GuestData} from "../../models/Guest";
import {validateGuestNameUnique} from "../../util/AsyncValidators";
import * as ToModel from "../../util/ToModel";
import {toNullValues} from "../../util/Transformations";
import TextField from "../general/TextField";
import CheckBoxField from "../general/CheckBoxField";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // First element receive autoFocus? [false]
    guest: Guest;                       // Initial values (id < 0 for adding)
    handleBack: HandleAction;           // Handle return to previous view
    handleInsert?: HandleGuest;         // Handle Template insert request [not allowed]
    handleRemove?: HandleGuest;         // Handle Template remove request [not allowed]
    handleUpdate?: HandleGuest;         // Handle Template update request [not allowed]
}

// Component Details ---------------------------------------------------------

const GuestForm = (props: Props) => {

    const facilityContext = useContext(FacilityContext);

    const [adding] = useState<boolean>(props.guest.id < 0);
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
            props.handleRemove(props.guest);
        }
    }

    const onSubmit: SubmitHandler<GuestData> = (values) => {
        const theGuest = new Guest({
            ...props.guest,
            ...values,
        });
        if (adding && props.handleInsert) {
            props.handleInsert(theGuest);
        } else if (!adding && props.handleUpdate) {
            props.handleUpdate(theGuest);
        }
    }

    const validationSchema = Yup.object().shape({
        active: Yup.boolean(),
        comments: Yup.string()
            .nullable(),
        favorite: Yup.string()
            .nullable(),
        firstName: Yup.string()
            .required("First Name is required"),
        lastName: Yup.string()
            .required("Last Name is required")
            .test("unique-name",
                "That name is already in use within this Facility",
                async function (this) {
                    return validateGuestNameUnique(ToModel.GUEST(toNullValues(this.parent)));
                }),
    });

    const {formState: {errors}, handleSubmit, register} = useForm<GuestData>({
        defaultValues: new GuestData(props.guest),
        mode: "onBlur",
        resolver: yupResolver(validationSchema),
    });

    return (

        <>

            {/* Details Form */}
            <Container id="GuestDetails">

                <Row className="mb-3">
                    <Col className="text-start">
                        <strong>
                            {(adding)? (
                                <span>Add New</span>
                            ) : (
                                <span>Edit Existing</span>
                            )}
                            &nbsp;Guest for Facility&nbsp;
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
                    id="GuestForm"
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <Row id="nameRow">
                        <TextField
                            autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                            errors={errors}
                            label="First Name:"
                            name="firstName"
                            register={register}
                            valid="First Name of this Guest (full name must be unique)."
                        />
                        <TextField
                            errors={errors}
                            label="Last Name:"
                            name="lastName"
                            register={register}
                            valid="Last Name of this Guest (full name must be unique)."
                        />
                    </Row>

                    <Row id="commentsFavoriteRow">
                        <TextField
                            errors={errors}
                            label="Comments:"
                            name="comments"
                            register={register}
                        />
                        <TextField
                            errors={errors}
                            label="Favorite:"
                            name="favorite"
                            register={register}
                            valid="Favorite mat or sleeping location."
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
                        Removing this Guest is not reversible, and
                        <strong>
                            &nbsp;will also remove ALL related information.
                        </strong>.
                    </p>
                    <p>Consider marking this Guest as inactive instead.</p>
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

export default GuestForm;
