// BanDetails ----------------------------------------------------------------

// Detail editing form for Ban objects.

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

// Internal Modules ----------------------------------------------------------

import CheckBoxField from "../general/CheckBoxField";
import TextField from "../general/TextField";
import {HandleAction, HandleBan} from "../../types";
import Ban, {BanData} from "../../models/Ban";
import Guest from "../../models/Guest";
import * as ToModel from "../../util/ToModel";
import {toNullValues} from "../../util/Transformations";
import {validateDate} from "../../util/Validators";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;                // First element receive autoFocus? [false]
    ban: Ban;                           // Initial values (id < 0 for adding)
    guest: Guest;                       // Guest for this Ban
    handleBack: HandleAction;           // Handle return to previous view
    handleInsert?: HandleBan;           // Handle Ban insert request [not allowed]
    handleRemove?: HandleBan;           // Handle Ban remove request [not allowed]
    handleUpdate?: HandleBan;           // Handle Ban update request [not allowed]
}

// Component Details ---------------------------------------------------------

const BanDetails = (props: Props) => {

    const [adding] = useState<boolean>(props.ban.id < 0);
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
            props.handleRemove(props.ban);
        }
    }

    const onSubmit: SubmitHandler<BanData> = (values) => {
        const theBan = new Ban({
            ...props.ban,
            ...values,
            facilityId: props.guest.facilityId,
            guestId: props.guest.id,
        });
        if (adding && props.handleInsert) {
            props.handleInsert(theBan);
        } else if (!adding && props.handleUpdate) {
            props.handleUpdate(theBan);
        }
    }

    const validationSchema = Yup.object().shape({
        active: Yup.boolean(),
        comments: Yup.string()
            .nullable(),
        fromDate: Yup.string()
            .required("From Date is required")
            .test("valid-from-date",
                "Invalid from date, must be YYYY-MM-DD",
                function(value) {
                    return validateDate(value ? value : "");
                }),
        staff: Yup.string()
            .nullable(),
        toDate: Yup.string()
            .required("To Date is required")
            .test("valid-to-date",
                "Invalid to date, must be YYYY-MM-DD and not before from date",
                function(this) {
                    const ban = ToModel.BAN(toNullValues(this.parent));
                    if (validateDate(ban.toDate ? ban.toDate : "")) {
                        if (ban.fromDate && (ban.fromDate <= ban.toDate)) {
                            return true;
                        }
                    }
                    return false;
                }),
    });

    const {formState: {errors}, handleSubmit, register} = useForm<BanData>({
        defaultValues: new BanData(props.ban),
        mode: "onBlur",
        resolver: yupResolver(validationSchema),
    });

    return (
        <>

            {/* Details Form */}
            <Container id="BanDetails">

                <Row className="mb-3">
                    <Col className="text-start">
                        <strong>
                            {(adding)? (
                                <span>Add New</span>
                            ) : (
                                <span>Edit Existing</span>
                            )}
                            &nbsp;Ban for Guest&nbsp;
                            <span className="text-info">
                                {props.guest._title}
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
                    id="BanForm"
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <Row id="formDateToDateRow">
                        <TextField
                            autoFocus={(props.autoFocus !== undefined) ? props.autoFocus : undefined}
                            errors={errors}
                            label="From Date:"
                            name="fromDate"
                            register={register}
                            valid="Earliest date for which this Ban applies"
                        />
                        <TextField
                            errors={errors}
                            label="To Date:"
                            name="toDate"
                            register={register}
                            valid="Latest date for which this Ban applies"
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="staffCommentsRow">
                        <TextField
                            className="col-2"
                            errors={errors}
                            label="Staffer:"
                            name="staff"
                            register={register}
                            valid="Name or initials of staff member requesting this Ban"
                        />
                        <TextField
                            errors={errors}
                            label="Comments:"
                            name="comments"
                            register={register}
                            valid="Reason that this Ban was created"
                        />
                    </Row>

                    <Row className="g-3 mb-3" id="activeRow">
                        <CheckBoxField
                            errors={errors}
                            label="Active Ban (i.e. it will be enforced)?"
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
                        Removing this Ban is not reversible, and
                        will erase any evidence that it ever existed.
                    </p>
                    <p>
                        Consider marking this Ban as inactive instead,
                        which means it will remain for historical reference
                        but will not prevent this Guest from checking in.
                    </p>
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

export default BanDetails;
