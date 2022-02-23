// AssignForm ----------------------------------------------------------------

// Detail editing form for Assign objects.

// External Modules ----------------------------------------------------------

import React, {useState} from "react";
import {Formik,FormikHelpers,FormikValues} from "formik";
import Button from "react-bootstrap/button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import * as Yup from "yup";

// Internal Modules ----------------------------------------------------------

import {HandleAssign, PaymentType} from "../../types";
import Assign from "../../models/Assign";
import logger from "../../util/ClientLogger";
import * as ToModel from "../../util/ToModel";
import {toEmptyStrings, toNullValues} from "../../util/Transformations";
import {validateTime} from "../../util/Validators";

// Incoming Properties -------------------------------------------------------

export interface Props {
    assign: Assign;                     // Initial values
    autoFocus?: boolean;                // Should first field get autoFocus? [false]
    handleAssign: HandleAssign;         // Handle Assign on assignment
}

// Component Details ---------------------------------------------------------

const AssignForm = (props: Props) => {

    const [initialValues] = useState(toEmptyStrings(props.assign));

    const onSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>): void => {
        const assign = ToModel.ASSIGN(toNullValues(values));
        logger.debug({
            context: "AssignForm.handleSubmit",
            assign: assign,
        });
        props.handleAssign(assign);
    }

    interface PaymentTypeOption {
        key: string;
        value: string;
    }

    const paymentTypeOptions = (): PaymentTypeOption[] => {
        const results: PaymentTypeOption[] = [];
        Object.values(PaymentType).forEach(paymentType => {
            const result: PaymentTypeOption = {
                key: paymentType.substr(0, 2),
                value: paymentType,
            }
            results.push(result);
        });
        return results;
    }

    const validationSchema = () => {
        return Yup.object().shape({
            comments: Yup.string(),
            paymentAmount: Yup.number(),
            paymentType: Yup.string(),
            showerTime: Yup.string()
                .test("valid-shower-time",
                    "Invalid Shower Time format, must be 99:99 or 99:99:99",
                    function (value) {
                        return validateTime(value ? value : "");
                    }),
            wakeupTime: Yup.string()
                .test("valid-wakeup-time",
                    "Invalid Wakeup Time format, must be 99:99 or 99:99:99",
                    function (value) {
                        return validateTime(value ? value : "");
                    }),
        });
    }

    return (
        <Container id="AssignForm">

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
                        id="AssignForm"
                        noValidate
                        onSubmit={handleSubmit}
                    >

                        <Form.Row id="paymentTypeAmountRow">
                            <Form.Group as={Col} controlId="paymentType" id="paymentTypeGroup">
                                <Form.Label>Payment Type:</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="paymentType"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    size="sm"
                                    value={values.paymentType}
                                >
                                    {paymentTypeOptions().map((paymentTypeOption, index) => (
                                        <option key={index} value={paymentTypeOption.key}>
                                            {paymentTypeOption.value}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col} controlId="paymentAmount" id="paymentAmountGroup">
                                <Form.Label>Payment Amount:</Form.Label>
                                <Form.Control
                                    isInvalid={touched.paymentAmount && !!errors.paymentAmount}
                                    isValid={!errors.paymentAmount}
                                    name="paymentAmount"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    size="sm"
                                    type="text"
                                    value={values.paymentAmount}
                                />
                                <Form.Control.Feedback type="invalid">
                                    ${errors.paymentAmount}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row id="showerWakeupRow">
                            <Form.Group as={Col} controlId="showerTime" id="showerTimeGroup">
                                <Form.Label>Shower Time:</Form.Label>
                                <Form.Control
                                    isInvalid={touched.showerTime && !!errors.showerTime}
                                    isValid={!errors.showerTime}
                                    name="showerTime"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    size="sm"
                                    type="text"
                                    value={values.showerTime}
                                />
                                <Form.Control.Feedback type="invalid">
                                    ${errors.showerTime}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="wakeupTime" id="wakeupTimeGroup">
                                <Form.Label>Wakeup Time:</Form.Label>
                                <Form.Control
                                    isInvalid={touched.wakeupTime && !!errors.wakeupTime}
                                    isValid={!errors.wakeupTime}
                                    name="wakeupTime"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    size="sm"
                                    type="text"
                                    value={values.wakeupTime}
                                />
                                <Form.Control.Feedback type="invalid">
                                    ${errors.wakeupTime}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row id="commentsRow">
                            <Form.Group as={Col} controlId="comments" id="commentsGroup">
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
                        </Form.Row>

                        <Row className="mb-3">
                            <Col>
                                <Button
                                    disabled={isSubmitting}
                                    size="sm"
                                    type="submit"
                                    variant="primary"
                                >
                                    Save
                                </Button>
                            </Col>
                        </Row>

                    </Form>

                )}

            </Formik>

        </Container>
    )

}

export default AssignForm;
