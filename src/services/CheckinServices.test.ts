// CheckinServices.test ------------------------------------------------------

// Functional tests for CheckinServices.

// External Modules ----------------------------------------------------------

import {loadTestData, lookupFacility, lookupGuest, lookupTemplate} from "../util/TestUtils";

const chai = require("chai");
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import CheckinServices from "./CheckinServices";
import Checkin from "../models/Checkin";
import {fromDateObject, toDateObject} from "../util/Dates";
import {BadRequest, NotFound} from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import * as Times from "../util/Times";

// Test Specifications -------------------------------------------------------

describe("CheckinServices Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withCheckins: true,
            withFacilities: true,
            withGuests: true,
            withTemplates: true,
        });
    })

    // Test Methods ----------------------------------------------------------

    describe("CheckinServices.all()", () => {

        it("should pass on all checkins for a checkinDate", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);

            const results = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE,
            });
            expect(results.length).to.equal(4);
            results.forEach(result => {
                expect(result.id).to.exist;
                expect(result.checkinDate).to.equal(SeedData.CHECKIN_DATE_ONE);
                expect(result.facilityId).to.equal(facility.id);
                expect(result.matNumber).to.exist;
                if (result.guestId) {
                    expect(result.paymentType).to.exist;
                    if (result.paymentType === "$$") {
                        expect(result.paymentAmount).to.exist;
                    } else {
                        expect(result.paymentAmount).to.not.exist;
                    }
                } else {
                    expect(result.paymentType).to.not.exist;
                }
            })

        })

        it("should pass on all checkins for a guestId", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const guest = await lookupGuest(facility.id, SeedData.GUEST_FIRST_NAME_THIRD, SeedData.GUEST_LAST_NAME_THIRD);

            const results = await CheckinServices.all(facility.id, {
                guestId: guest.id,
            });
            expect(results.length).to.equal(2);
            expect(results[0].facilityId).to.equal(facility.id);
            expect(results[0].guestId).to.equal(guest.id);

        })

        it("should pass on available checkins for a checkinDate", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);

            const results = await CheckinServices.all(facility.id, {
                available: "",
                date: SeedData.CHECKIN_DATE_TWO,
            });
            expect(results.length).to.equal(2);
            results.forEach(result => {
                expect(result.id).to.exist;
                expect(result.checkinDate).to.equal(SeedData.CHECKIN_DATE_TWO);
                expect(result.facilityId).to.equal(facility.id);
                expect(result.guestId).to.not.exist;
                expect(result.matNumber).to.exist;
                expect(result.paymentAmount).to.not.exist;
                expect(result.paymentType).to.not.exist;
            })

        })

        it("should pass on no checkins for a checkinDate", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);

            const results = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ZERO,
            });
            expect(results.length).to.equal(0);

        })

    })

    describe("CheckinServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INVALID_ID = -1;

            try {
                await CheckinServices.find(facility.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`checkinId: Missing Checkin ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included parent", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await CheckinServices.all(facility.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await CheckinServices.find(facility.id, INPUT.id, {
                    withFacility: "",
                });
                expect(OUTPUT.facility).to.exist;
                expect(OUTPUT.facility.id).to.equal(facility.id);
            })

        })

        it("should pass on valid IDs", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUTS = await CheckinServices.all(facility.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await CheckinServices.find(facility.id, INPUT.id);
                compareCheckinOld(OUTPUT, INPUT);
            })

        })

    })

    describe("CheckinServices.generate()", () => {

        it("should fail on invalid facilityId", async () => {

            const INVALID_FACILITY_ID = -1;
            const INVALID_TEMPLATE_ID = -2;

            try {
                await CheckinServices.generate(INVALID_FACILITY_ID, SeedData.CHECKIN_DATE_ZERO, INVALID_TEMPLATE_ID);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`facilityId: Missing Facility ${INVALID_FACILITY_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid templateId", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INVALID_TEMPLATE_ID = -2;

            try {
                await CheckinServices.generate(facility.id, SeedData.CHECKIN_DATE_ZERO, INVALID_TEMPLATE_ID);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`templateId: Missing Template ${INVALID_TEMPLATE_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on mismatched templateId", async () => {

            const facilityOne = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const facilityTwo = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const templateTwo = await lookupTemplate(facilityTwo.id, SeedData.TEMPLATE_NAME_SECOND);

            try {
                await CheckinServices.generate(facilityOne.id, SeedData.CHECKIN_DATE_ZERO, templateTwo.id);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`templateId: Template ${templateTwo.id} does not belong to this Facility`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on non-empty checkinDate", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const template = await lookupTemplate(facility.id, SeedData.TEMPLATE_NAME_FIRST);

            try {
                await CheckinServices.generate(facility.id, SeedData.CHECKIN_DATE_ONE, template.id);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`checkinDate: There are already `);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const template = await lookupTemplate(facility.id, SeedData.TEMPLATE_NAME_THIRD)

            const OUTPUTS = await CheckinServices.generate(facility.id, SeedData.CHECKIN_DATE_ZERO, template.id);
            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facilityId).to.equal(facility.id);
                expect(OUTPUT.guestId).to.be.null;
            });
            const CHECKS = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ZERO,
            });
            expect(CHECKS.length).to.equal(OUTPUTS.length);

        })


    })

    describe("CheckinServices.insert()", () => {

        it.skip("should fail on already assigned checkinDate+guestId", async () => {
            // TODO - already assigned checkinDate+guestId
        })

        it("should fail on duplicate checkinDate+matNumber", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUTS = await CheckinServices.all(facility.id);
            const INPUT = {
                checkinDate: INPUTS[0].checkinDate,
                matNumber: INPUTS[0].matNumber,
            }

            try {
                await CheckinServices.insert(facility.id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("is already in use");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid input data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUT = {};

            try {
                await CheckinServices.insert(facility.id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("Is required");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid input data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const guest = await lookupGuest(facility.id, SeedData.GUEST_FIRST_NAME_SECOND, SeedData.GUEST_LAST_NAME_SECOND);
            const INPUT = {
                checkinDate: toDateObject(SeedData.CHECKIN_DATE_ONE),
                guestId: guest.id,
                matNumber: 5,
            }

            const OUTPUT = await CheckinServices.insert(facility.id, INPUT);
            compareCheckinNew(OUTPUT, INPUT);

        })

    })

    describe("CheckinServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INVALID_ID = -1;

            try {
                await CheckinServices.remove(facility.id, INVALID_ID);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`checkinId: Missing Checkin ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}`)
                }
            }

        })

        it("should pass on valid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await CheckinServices.all(facility.id);
            await CheckinServices.remove(facility.id, INPUTS[0].id);

            try {
                await CheckinServices.remove(facility.id, INPUTS[0].id);
                expect.fail(`Should have thrown NotFound after remove`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`checkinId: Missing Checkin ${INPUTS[0].id}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })


    })

    describe("CheckinServices.update()", () => {

        it("should fail on duplicate checkinDate/matNumber", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUTS = await CheckinServices.all(facility.id);
            const INPUT = {
                checkinDate: INPUTS[1].checkinDate,
                matNumber: INPUTS[1].matNumber
            }

            try {
                await CheckinServices.update(facility.id, INPUTS[0].id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(" is already in use");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }


        })

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await CheckinServices.all(facility.id);
            const INVALID_ID = -1;

            try {
                await CheckinServices.update(facility.id, INVALID_ID, INPUTS[0]);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`checkinId: Missing Checkin ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on no changed data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUTS = await CheckinServices.all(facility.id);
            const INPUT = {};

            const OUTPUT = await CheckinServices.update(facility.id, INPUTS[0].id, INPUT);
            compareCheckinOld(OUTPUT, INPUT);
            const UPDATED = await CheckinServices.find(facility.id, INPUTS[0].id);
            compareCheckinOld(UPDATED, OUTPUT);

        })

        it("should pass on valid updated data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUTS = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE,
            });
            const showerTime = Times.toTimeObject("05:00");
            //console.log(`SHOW IN=${showerTime} OUT=${Times.fromTimeObject(showerTime)}`)
            const wakeupTime = Times.toTimeObject("04:30:15");
            //console.log(`WAKE IN=${wakeupTime} OUT=${Times.fromTimeObject(wakeupTime)}`)
            const INPUT = {
                comments: "Updated comments",
                //showerTime: showerTime,
                //wakeupTime: wakeupTime,
            }

            const OUTPUT = await CheckinServices.update(facility.id, INPUTS[0].id, INPUT);
            compareCheckinOld(OUTPUT, INPUT);
            const UPDATED = await CheckinServices.find(facility.id, INPUTS[0].id);
            compareCheckinOld(UPDATED, OUTPUT);

        })

    })

})

// Helper Objects ------------------------------------------------------------

export function compareCheckinNew(OUTPUT: Partial<Checkin>, INPUT: Partial<Checkin>) {

    expect(OUTPUT.id).to.exist;
    // @ts-ignore (we will never try this without an actual checkinDate)
    expect(OUTPUT.checkinDate).to.equal(fromDateObject(INPUT.checkinDate));
    expect(OUTPUT.facilityId).to.exist;
    expect(OUTPUT.guestId).to.equal(INPUT.guestId ? INPUT.guestId : null);
    expect(OUTPUT.matNumber).to.equal(INPUT.matNumber);
    expect(OUTPUT.paymentAmount).to.equal(INPUT.paymentAmount ? INPUT.paymentAmount : null);
    expect(OUTPUT.paymentType).to.equal(INPUT.paymentType ? INPUT.paymentType : null);
    expect(OUTPUT.showerTime).to.equal(INPUT.showerTime ? INPUT.showerTime : null);
    expect(OUTPUT.wakeupTime).to.equal(INPUT.wakeupTime ? INPUT.wakeupTime : null);
}

export function compareCheckinOld(OUTPUT: Partial<Checkin>, INPUT: Partial<Checkin>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.checkinDate).to.equal(INPUT.checkinDate ? INPUT.checkinDate : OUTPUT.checkinDate);
    expect(OUTPUT.facilityId).to.exist;
    expect(OUTPUT.guestId).to.equal(INPUT.guestId ? INPUT.guestId : OUTPUT.guestId);
    expect(OUTPUT.matNumber).to.equal(INPUT.matNumber ? INPUT.matNumber : OUTPUT.matNumber);
    expect(OUTPUT.paymentAmount).to.equal(INPUT.paymentAmount ? INPUT.paymentAmount : OUTPUT.paymentAmount);
    expect(OUTPUT.paymentType).to.equal(INPUT.paymentType ? INPUT.paymentType : OUTPUT.paymentType);
    expect(OUTPUT.showerTime).to.equal(INPUT.showerTime ? INPUT.showerTime : OUTPUT.showerTime);
    expect(OUTPUT.wakeupTime).to.equal(INPUT.wakeupTime ? INPUT.wakeupTime : OUTPUT.wakeupTime);

}
