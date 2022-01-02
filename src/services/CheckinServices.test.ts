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
import FacilityServices from "./FacilityServices";

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

    describe("CheckinServices.assign()", () => {

        it("should fail on already assigned Checkin", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const checkins = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE
            });

            checkins.forEach(async checkin => {
                if (checkin.guestId) {
                    try {
                        await CheckinServices.assign(facility.id, checkin.id, {});
                        expect.fail(`Should have thrown BadRequest`);
                    } catch (error) {
                        if (error instanceof BadRequest) {
                            expect(error.message).to.include(`guestId: Checkin ${checkin.id} is already assigned to Guest ${checkin.guestId}`);
                        } else {
                            expect.fail(`Should not have thrown '${error}'`);
                        }
                    }
                }
            })

        })

        it("should fail on already assigned checkinDate+guestId", async () => {

            // This test depends on deep knowledge of the seed data!
            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const checkins = await FacilityServices.checkins(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE
            })
            expect(checkins[0].guestId).to.exist;
            expect(checkins[1].guestId).to.not.exist;
            const INPUT = {
                comments: "Assign comment",
                guestId: checkins[0].guestId,
            }

            try {
                await CheckinServices.assign(facility.id, checkins[1].id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`guestId: Guest ${INPUT.guestId} is already assigned on date ${checkins[1].checkinDate}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INVALID_ID = -1;

            try {
                await CheckinServices.assign(facility.id, INVALID_ID, {});
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`checkinId: Missing Checkin ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid data", async () => {

            // NOTE - this test is highly dependent on the seed data!
            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const checkins = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_TWO
            });
            // Selected Checkin MUST be unassigned
            const oldCheckin = checkins[0];
            // Selected Guest MUST be unassigned
            const guest = await lookupGuest(facility.id, SeedData.GUEST_FIRST_NAME_FIRST, SeedData.GUEST_LAST_NAME_FIRST);
            const assign = {
                comments: "Newly Assigned Guest",
                guestId: guest.id,
                paymentAmount: "5.00",
                paymentType: "$$",
                showerTime: "05:00:00",
                wakeupTime: "04:30:45",
            }

            const newCheckin = await CheckinServices.assign(facility.id, oldCheckin.id, assign);
            // Values that should not have changed
            expect(newCheckin.id).to.equal(oldCheckin.id);
            expect(newCheckin.checkinDate).to.equal(oldCheckin.checkinDate);
            expect(newCheckin.facilityId).to.equal(oldCheckin.facilityId);
            expect(newCheckin.features).to.equal(oldCheckin.features);
            expect(newCheckin.matNumber).to.equal(oldCheckin.matNumber);
            // Values that should have changed
            expect(newCheckin.comments).to.equal(assign.comments);
            expect(newCheckin.guestId).to.equal(assign.guestId);
            expect(newCheckin.paymentAmount).to.equal(assign.paymentAmount);
            expect(newCheckin.paymentType).to.equal(assign.paymentType);
            expect(newCheckin.showerTime).to.equal(assign.showerTime);
            expect(newCheckin.wakeupTime).to.equal(assign.wakeupTime);

        })

    })

    describe("CheckinServices.deassign()", () => {

        it("should fail on already unassigned Checkin", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const checkins = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE
            });

            checkins.forEach(async checkin => {
                if (!checkin.guestId) {
                    try {
                        await CheckinServices.deassign(facility.id, checkin.id);
                        expect.fail(`Should have thrown BadRequest`);
                    } catch (error) {
                        if (error instanceof BadRequest) {
                            expect(error.message).to.include(`checkinId: Checkin ${checkin.id} is not currently assigned`);
                        } else {
                            expect.fail(`Should not have thrown '${error}'`);
                        }
                    }
                }
            })

        })

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INVALID_ID = -1;

            try {
                await CheckinServices.deassign(facility.id, INVALID_ID);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`checkinId: Missing Checkin ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid data", async () => {

            // NOTE - this test is highly dependent on the seed data!
            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const checkins = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE
            });
            // Selected Checkin MUST be assigned
            const oldCheckin = checkins[0];

            const newCheckin = await CheckinServices.deassign(facility.id, oldCheckin.id);
            // Values that should not have changed
            expect(newCheckin.id).to.equal(oldCheckin.id);
            expect(newCheckin.checkinDate).to.equal(oldCheckin.checkinDate);
            expect(newCheckin.facilityId).to.equal(oldCheckin.facilityId);
            expect(newCheckin.features).to.equal(oldCheckin.features);
            expect(newCheckin.matNumber).to.equal(oldCheckin.matNumber);
            // Values that should have changed
            expect(newCheckin.comments).to.be.null;
            expect(newCheckin.guestId).to.be.null;
            expect(newCheckin.paymentAmount).to.be.null;
            expect(newCheckin.paymentType).to.be.null;
            expect(newCheckin.showerTime).to.be.null;
            expect(newCheckin.wakeupTime).to.be.null;

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

        it("should fail on already assigned checkinDate+guestId", async () => {

            // This test depends on deep knowledge of the seed data!
            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const checkins = await FacilityServices.checkins(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE
            })
            expect(checkins[0].guestId).to.exist;
            const INPUT = {
                checkinDate: SeedData.CHECKIN_DATE_ONE,
                facilityId: facility.id,
                guestId: checkins[0].guestId,
                matNumber: checkins.length + 1,
            }

            try {
                await CheckinServices.insert(facility.id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`guestId: Guest ${INPUT.guestId} is already assigned on date ${INPUT.checkinDate}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

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

    describe("CheckinServices.reassign()", () => {

        it("should fail on already unassigned Checkin", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const checkins = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE
            });

            checkins.forEach(async checkin => {
                if (!checkin.guestId) {
                    try {
                        await CheckinServices.reassign(facility.id, checkin.id, {});
                        expect.fail(`Should have thrown BadRequest`);
                    } catch (error) {
                        if (error instanceof BadRequest) {
                            expect(error.message).to.include(`checkinId: Checkin ${checkin.id} is not currently assigned`);
                        } else {
                            expect.fail(`Should not have thrown '${error}'`);
                        }
                    }
                }
            })

        })

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INVALID_ID = -1;

            try {
                await CheckinServices.reassign(facility.id, INVALID_ID, {});
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`checkinId: Missing Checkin ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid data", async () => {

            // NOTE - this test is highly dependent on the seed data!
            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const checkins = await CheckinServices.all(facility.id, {
                date: SeedData.CHECKIN_DATE_ONE
            });
            // Selected Checkins MUST be assigned (from) and unassigned (to)
            const fromCheckin = checkins[0];
            const toCheckin = checkins[1];
            const assign = {
                checkinId: toCheckin.id,
                comments: "Newly Reassigned Guest",
                paymentAmount: "5.00",
                paymentType: "$$",
                showerTime: "05:00:00",
                wakeupTime: "04:30:45",
            }

            const newCheckin = await CheckinServices.reassign(facility.id, fromCheckin.id, assign);
            // Values that should not have changed
            expect(newCheckin.id).to.equal(toCheckin.id);
            expect(newCheckin.checkinDate).to.equal(toCheckin.checkinDate);
            expect(newCheckin.facilityId).to.equal(toCheckin.facilityId);
            expect(newCheckin.features).to.equal(toCheckin.features);
            expect(newCheckin.matNumber).to.equal(toCheckin.matNumber);
            // Values that should have changed
            expect(newCheckin.comments).to.equal(assign.comments);
            expect(newCheckin.guestId).to.equal(fromCheckin.guestId); // Now reassigned
            expect(newCheckin.paymentAmount).to.equal(assign.paymentAmount);
            expect(newCheckin.paymentType).to.equal(assign.paymentType);
            expect(newCheckin.showerTime).to.equal(assign.showerTime);
            expect(newCheckin.wakeupTime).to.equal(assign.wakeupTime);

            const oldCheckin = await CheckinServices.find(facility.id, fromCheckin.id);
            // Values that should not have changed
            expect(oldCheckin.id).to.equal(fromCheckin.id);
            expect(oldCheckin.checkinDate).to.equal(fromCheckin.checkinDate);
            expect(oldCheckin.facilityId).to.equal(fromCheckin.facilityId);
            expect(oldCheckin.features).to.equal(fromCheckin.features);
            expect(oldCheckin.matNumber).to.equal(fromCheckin.matNumber);
            // Values that should have changed
            expect(oldCheckin.comments).to.be.null;
            expect(oldCheckin.guestId).to.be.null; // Now unassigned
            expect(oldCheckin.paymentAmount).to.be.null;
            expect(oldCheckin.paymentType).to.be.null;
            expect(oldCheckin.showerTime).to.be.null;
            expect(oldCheckin.wakeupTime).to.be.null;

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
            const INPUT = {
                comments: "Updated comments",
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
