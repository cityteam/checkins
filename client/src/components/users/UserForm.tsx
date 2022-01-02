// UserForm ------------------------------------------------------------------

// Detail editing form for User objects.

// External Modules ----------------------------------------------------------

import React, {/*useContext, */useEffect, useState} from "react";
import {Formik,FormikHelpers,FormikValues} from "formik";
import Button from "react-bootstrap/button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import * as Yup from "yup";

// Internal Modules ----------------------------------------------------------

import {HandleUser} from "../../types";
import User from "../../models/User";
import {validateUserUsernameUnique} from "../../util/AsyncValidators";
import logger from "../../util/ClientLogger";
import {toUser} from "../../util/ToModelTypes";
import {toEmptyStrings, toNullValues} from "../../util/Transformations";

// Incoming Properties ------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // First element receive autoFocus? [false]
    canRemove: boolean;                 // Can remove be performed? [false]
    canSave: boolean;                   // Can save be performed? [false]
    handleInsert: HandleUser;           // Handle User insert request
    handleRemove: HandleUser;           // Handle User remove request
    handleUpdate: HandleUser;           // Handle User update request
    user: User;                         // Initial values (id < 0 for adding)
}

// Component Details ---------------------------------------------------------

const UserForm = (props: Props) => {

    const [adding] = useState<boolean>(props.user.id < 0);
    const [initialValues] = useState(toEmptyStrings(props.user));
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    useEffect(() => {
        logger.debug({
            context: "UserForm.useEffect",
            user: props.user,
            values: initialValues,
        });
    }, [props.user, initialValues]);

    const onSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>): void => {
        if (adding) {
            props.handleInsert(toUser(toNullValues(values)));
        } else {
            props.handleUpdate(toUser(toNullValues(values)));
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
        props.handleRemove(props.user)
    }

    // NOTE - there is no server-side equivalent for this because there is
    // not an individual logged-in user performing the request
    // NOTE - needs LoginContext to provide validateScope() method
    const validateRequestedScope = (requested: string | undefined): boolean => {
        return true; // NOTE - need server side validation
/*
        if (!requested || ("" === requested)) {
            return true;  // Not asking for scope but should be required
        } else {
            // NOTE - deal with log:<level> pseudo-scopes
            return loginContext.validateScope(requested);
        }
*/
    }

    const validationSchema = () => {
        return Yup.object().shape({
            active: Yup.boolean(),
            name: Yup.string()
                .required("Name is required"),
            password: Yup.string(), // NOTE - required on add, optional on edit
            scope: Yup.string()
                .required("Scope is required")
                .test("allowed-scope",
                    "You are not allowed to assign a scope you do not possess",
                    function(value) {
                        return validateRequestedScope(value);
                    }),
            username: Yup.string()
                .required("Username is required")
                .test("unique-username",
                    "That username is already in use",
                    async function (this) {
                        return validateUserUsernameUnique(toUser(toNullValues(this.parent)))
                    }),
        });
    }

    return (

        <>

            {/* Details Form */}
            <Container id="UserForm">

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
                            id="UserForm"
                            noValidate
                            onSubmit={handleSubmit}
                        >

                            <Form.Row id="nameRow">
                                <Form.Group as={Col} controlId="name" id="nameGroup">
                                    <Form.Label>Name:</Form.Label>
                                    <Form.Control
                                        autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                                        isInvalid={touched.name && !!errors.name}
                                        isValid={!errors.name}
                                        name="name"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.name}
                                    />
                                    <Form.Control.Feedback type="valid">
                                        Name or description of this User.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="usernamePasswordRow">
                                <Form.Group as={Col} controlId="username" id="usernameGroup">
                                    <Form.Label>Username:</Form.Label>
                                    <Form.Control
                                        isInvalid={touched.username && !!errors.username}
                                        isValid={!errors.username}
                                        name="username"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.username}
                                    />
                                    <Form.Control.Feedback type="valid">
                                        Username is required and must be unique.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} controlId="name" id="passwordGroup">
                                    <Form.Label>Password:</Form.Label>
                                    <Form.Control
                                        isInvalid={touched.password && !!errors.password}
                                        isValid={!errors.password}
                                        name="password"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.password}
                                    />
                                    <Form.Control.Feedback type="valid">
                                        Enter ONLY for a new User or if you want to
                                        change the password for an old User.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="scopeRow">
                                <Form.Group as={Col} controlId="name" id="scopeGroup">
                                    <Form.Label>Scope:</Form.Label>
                                    <Form.Control
                                        isInvalid={touched.scope && !!errors.scope}
                                        isValid={!errors.scope}
                                        name="scope"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.scope}
                                    />
                                    <Form.Control.Feedback type="valid">
                                        Scope is required and sets access privileges.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.scope}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row className="mb-3" id="activeRow">
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
                                <Col className="col text-left">
                                    <Button
                                        disabled={isSubmitting || !props.canSave}
                                        size="sm"
                                        type="submit"
                                        variant="primary"
                                    >
                                        Save
                                    </Button>
                                </Col>
                                <Col className="col text-right">
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
                        Removing this User is not reversible, and
                        <strong>
                            &nbsp;will also remove ALL related information.
                        </strong>.
                    </p>
                    <p>Consider marking this User as inactive instead.</p>
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

export default UserForm;
