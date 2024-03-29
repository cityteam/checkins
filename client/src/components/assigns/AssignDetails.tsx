// AssignDetails -------------------------------------------------------------

// Detail editing form for Assign objects.

// External Modules ----------------------------------------------------------

import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import {SubmitHandler, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {SelectField, SelectOption, TextField} from "@craigmcc/shared-react";
import {Validators} from "@craigmcc/shared-utils";

// Internal Modules ----------------------------------------------------------

import {HandleAssign, PaymentType} from "../../types";
import Assign from "../../models/Assign";
import * as ToModel from "../../util/ToModel";

// Incoming Properties -------------------------------------------------------

export interface Props {
    assign: Assign;                     // Initial values
    autoFocus?: boolean;                // Should first field get autoFocus? [false]
    handleAssign: HandleAssign;         // Handle Assign on assignment
}

// Component Details ---------------------------------------------------------

const AssignForm = (props: Props) => {

    const onSubmit: SubmitHandler<Assign> = (values) => {
        props.handleAssign(ToModel.ASSIGN(values));
    }

    const paymentTypeOptions = (): SelectOption[] => {
        const results: SelectOption[] = [];
        Object.values(PaymentType).forEach(paymentType => {
            const result: SelectOption = {
                label: paymentType,
                value: paymentType.substr(0, 2),
            }
            results.push(result);
        });
        return results;
    }

    const validationSchema = Yup.object().shape({
        comments: Yup.string()
            .nullable(),
        paymentAmount: Yup.string()
            .nullable()
            .test("valid-payment-amount",
                "Payment amount must be a number",
                function (value) {
                    return Validators.number(value);
                }),
        paymentType: Yup.string()
            .required("Payment Type is required"),
        showerTime: Yup.string()
            .nullable()
            .test("valid-shower-time",
                "Invalid Shower Time format, must be 99:99 or 99:99:99",
                function (value) {
                    return Validators.time(value ? value : "");
                }),
        wakeupTime: Yup.string()
            .nullable()
            .test("valid-wakeup-time",
                "Invalid Wakeup Time format, must be 99:99 or 99:99:99",
                function (value) {
                    return Validators.time(value ? value : "");
                }),
    });

    const {formState: {errors}, handleSubmit, register} = useForm<Assign>({
        defaultValues: new Assign(props.assign),
        mode: "onBlur",
        resolver: yupResolver(validationSchema),
    });

    return (
        <Container id="AssignDetails">

            <Form
                id="AssignForm"
                noValidate
                onSubmit={handleSubmit(onSubmit)}
            >

                <Row className="g-3 mb-3" id="paymentTypeAmountRow">
                    <SelectField
                        autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                        errors={errors}
                        label="Payment Type:"
                        name="paymentType"
                        options={paymentTypeOptions()}
                        register={register}
                    />
                    <TextField
                        errors={errors}
                        label="Payment Amount:"
                        name="paymentAmount"
                        register={register}
                    />
                </Row>

                <Row className="g-3 mb-3" id="showerWakeupRow">
                    <TextField
                        errors={errors}
                        label="Shower Time:"
                        name="showerTime"
                        register={register}
                    />
                    <TextField
                        errors={errors}
                        label="Wakeup Time:"
                        name="wakeupTime"
                        register={register}
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

                <Row className="mb-3">
                    <Col>
                        <Button
                            size="sm"
                            type="submit"
                            variant="primary"
                        >
                            Save
                        </Button>
                    </Col>
                </Row>

            </Form>

        </Container>
    )

}

export default AssignForm;
