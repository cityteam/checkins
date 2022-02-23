// GuestForm -----------------------------------------------------------------

// Detail editing form for Guest objects.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import {Formik,FormikHelpers,FormikValues} from "formik";
import Button from "react-bootstrap/button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import * as Yup from "yup";

// Internal Modules ----------------------------------------------------------

import {HandleGuest} from "../../types";
import Guest from "../../models/Guest";
import {validateGuestNameUnique} from "../../util/AsyncValidators";
import logger from"../../util/ClientLogger";
import * as ToModel from "../../util/ToModel";
import {toEmptyStrings, toNullValues} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // First element receive autoFocus? [false]
    canRemove: boolean;                 // Can remove be performed? [false]
    canSave: boolean;                   // Can save be performed? [false]
    guest: Guest;                       // Initial values (id < 0 for adding)
    handleInsert: HandleGuest;          // Handle Template insert request
    handleRemove: HandleGuest;          // Handle Template remove request
    handleUpdate: HandleGuest;          // Handle Template update request
}

// Component Details ---------------------------------------------------------

const GuestForm = (props: Props) => {

    const [adding] = useState<boolean>(props.guest.id < 0);
    const [initialValues] = useState(toEmptyStrings(props.guest));
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "GuestForm.useEffect",
            guest: props.guest,
            values: initialValues,
        });
    }, [props.guest, initialValues]);

    const onSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>): void => {
        logger.debug({
            context: "GuestForm.handleSubmit",
            template: ToModel.GUEST(toNullValues(values)),
            values: values,
        });
        if (adding) {
            props.handleInsert(ToModel.GUEST(toNullValues(values)));
        } else {
            props.handleUpdate(ToModel.GUEST(toNullValues(values)));
        }
    }

    const onConfirm = (): void => {
        setShowConfirm(true);
    }

    const onConfirmNegative = (): void => {
        setShowConfirm(false);
    }

    const onConfirmPositive = (): void => {
        setShowConfirm(false);
        props.handleRemove(props.guest);
    }

    const validationSchema = () => {
        return Yup.object().shape({
            active: Yup.boolean(),
            comments: Yup.string(),
            favorite: Yup.string(),
            firstName: Yup.string()
                .required("First Name is required"),
            lastName: Yup.string()
                .required("Last Name is required")
                .test("unique-name",
                    "That name is already in use within this Facility",
                    async function (this) {
                    return validateGuestNameUnique(ToModel.GUEST(this.parent));
                    }),
        })
    }

    return (
        <>

            {/* Details Form */}
            <Container id="GuestForm">

                <Formik
                    initialValues={initialValues}
                    onSubmit={(values, actions) => {
                        onSubmit(values, actions);
                    }}
                    validateOnBlur={true}
                    validateOnChange={false}
                    validationSchema={validationSchema}
                >

                    {( {
                           errors,
                           handleBlur,
                           handleChange,
                           handleSubmit,
                           isSubmitting,
                           isValid,
                           touched,
                           values,
                       }) => (

                        <Form
                            id="GuestForm"
                            noValidate
                            onSubmit={handleSubmit}
                        >

                            <Form.Row id="nameRow">
                                <Form.Group as={Col} controlId="name" id="firstNameGroup">
                                    <Form.Label>First Name:</Form.Label>
                                    <Form.Control
                                        autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                                        isInvalid={touched.firstName && !!errors.firstName}
                                        isValid={!errors.firstName}
                                        name="firstName"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.firstName}
                                    />
                                    <Form.Control.Feedback type="valid">
                                        First Name is required and must be unique.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.firstName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} controlId="name" id="lastNameGroup">
                                    <Form.Label>Last Name:</Form.Label>
                                    <Form.Control
                                        isInvalid={touched.lastName && !!errors.lastName}
                                        isValid={!errors.lastName}
                                        name="lastName"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.lastName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.lastName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="commentsFavoriteRow">
                                <Form.Group as={Col} controlId="name" id="commentsGroup">
                                    <Form.Label>Comments:</Form.Label>
                                    <Form.Control
                                        isInvalid={touched.comments && !!errors.comments}
                                        isValid={!errors.comments}
                                        name="comments"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.comments}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.comments}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} controlId="name" id="favoriteGroup">
                                    <Form.Label>Favorite:</Form.Label>
                                    <Form.Control
                                        isInvalid={touched.favorite && !!errors.favorite}
                                        isValid={!errors.favorite}
                                        name="favorite"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.favorite}
                                    />
                                    <Form.Control.Feedback type="valid">
                                        Favorite mat or sleeping location
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.comments}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="activeRow">
                                <Form.Group as={Col} controlId="active" id="activeGroup">
                                    <Form.Check
                                        feedback={errors.active}
                                        defaultChecked={values.active}
                                        id="active"
                                        label="Active?"
                                        name="active"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Form.Row>

                            <Row className="mb-3">
                                <Col className="text-left">
                                    <Button
                                        disabled={isSubmitting || !props.canSave}
                                        size="sm"
                                        type="submit"
                                        variant="primary"
                                    >
                                        Save
                                    </Button>
                                </Col>
                                <Col className="text-right">
                                    <Button
                                        disabled={adding || !props.canRemove}
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

                    )}

                </Formik>

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
