// BanServices.test ----------------------------------------------------------

// Functional tests for BanServices.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;
import {Dates} from "@craigmcc/shared-utils";

// Internal Modules ----------------------------------------------------------

import BanServices from "./BanServices";
import FacilityServices from "./FacilityServices";
import Ban from "../models/Ban";
import {BadRequest, NotFound} from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {loadTestData, lookupFacility} from "../util/TestUtils";

// Test Specifications -------------------------------------------------------

describe("BanServices Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withBans: true,
            withFacilities: true,
            withGuests: true,
        });
    })

    // Test Methods ----------------------------------------------------------

    describe("BanServices.all()", () => {

        it("should pass on active Bans", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_FIRST);

            const OUTPUTS = await BanServices.all(
                FACILITY.id,
                { active: "" },
            );

            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facilityId).to.equal(FACILITY.id);
                expect(OUTPUT.active).to.equal(true);
            });

        })

        it("should pass on all Bans", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_SECOND);

            const OUTPUTS = await BanServices.all(FACILITY.id);

            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facilityId).to.equal(FACILITY.id);
            })

        })

        it("should pass on date range match", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const FROM_DATE = "2020-06-15";
            const TO_DATE = "2020-06-30";
            const FROM_DATE_EXPECTED = "2020-06-01";
            const TO_DATE_EXPECTED = "2020-06-30";

            const OUTPUTS = await BanServices.all(FACILITY.id, {
                fromDate: FROM_DATE,
                toDate: TO_DATE,
            })

            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facilityId).to.equal(FACILITY.id);
                expect(OUTPUT.fromDate).to.equal(FROM_DATE_EXPECTED);
                expect(OUTPUT.toDate).to.equal(TO_DATE_EXPECTED);
            });

        })

        it("should pass on included parents", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_THIRD);

            const OUTPUTS = await BanServices.all(FACILITY.id, {
                withFacility: "",
                withGuest: "",
            });

            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facility).to.exist;
                expect(OUTPUT.facility.id).to.equal(FACILITY.id);
                expect(OUTPUT.guest).to.exist;
                if (OUTPUT.guest) {
                    expect(OUTPUT.guest.facilityId).to.equal(FACILITY.id);
                }
            });

        })

        it("should pass on paginated Bans", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const LIMIT = 1;
            const OFFSET = 1;

            const OUTPUTS = await BanServices.all(FACILITY.id, {
                limit: LIMIT,
                offset: OFFSET,
            });

            expect(OUTPUTS.length).to.equal(LIMIT);

        });

    })

    describe("BanServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INVALID_ID = -1;

            try {
                await BanServices.find(FACILITY.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`banId: Missing Ban ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included parents", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await BanServices.all(FACILITY.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await BanServices.find(FACILITY.id, INPUT.id, {
                    withFacility: "",
                    withGuest: "",
                });
                expect(OUTPUT.facility).to.exist;
                expect(OUTPUT.facility.id).to.equal(FACILITY.id);
                expect(OUTPUT.guest).to.exist;
                if (OUTPUT.guest) {
                    expect(OUTPUT.guest.facilityId).to.equal(FACILITY.id);
                }
            });

        })

        it("should pass on valid IDs", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUTS = await BanServices.all(FACILITY.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await BanServices.find(FACILITY.id, INPUT.id);
                compareBanOld(OUTPUT, INPUT);
            });

        });

    })


    describe("BanServices.insert()", () => {

        it("should fail on empty input data", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUT = {};

            try {
                await BanServices.insert(FACILITY.id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`guestId: Missing Guest`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on mismatched Facility and Guest", async () => {

            const FACILITY2 = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const GUESTS2 = await FacilityServices.guests(FACILITY2.id);
            const FACILITY3 = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const GUESTS3 = await FacilityServices.guests(FACILITY3.id);
            const INPUT = {
                active: true,
                facilityId: FACILITY2.id,
                fromDate: "2020-04-14",
                guestId: GUESTS3[0].id,
                toDate: "2020-04-16",
            }

            try {
                await BanServices.insert(FACILITY2.id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("does not belong to Facility");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on misordered dates", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const GUESTS = await FacilityServices.guests(FACILITY.id);
            const INPUT = {
                active: true,
                facilityId: FACILITY.id,
                fromDate: "2020-03-16",
                guestId: GUESTS[0].id,
                toDate: "2020-03-14",
            }

            try {
                await BanServices.insert(FACILITY.id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("To Date must not be less than From Date");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid input data", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const GUESTS = await FacilityServices.guests(FACILITY.id);
            const INPUT = {
                active: false,
                comments: "New Ban",
                facilityId: FACILITY.id,
                fromDate: Dates.toObject("2020-02-14"),
                guestId: GUESTS[1].id,
                staff: "Boss",
                toDate: Dates.toObject("2020-02-14"),
            }

            const OUTPUT = await BanServices.insert(FACILITY.id, INPUT);
            compareBanNew(OUTPUT, INPUT);

        })

    })

    describe("BanServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INVALID_ID = -1;

            try {
                await BanServices.remove(FACILITY.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`banId: Missing Ban ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid ID", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUTS = await BanServices.all(FACILITY.id);
            await BanServices.remove(FACILITY.id, INPUTS[0].id);

            try {
                await BanServices.remove(FACILITY.id, INPUTS[0].id);
                expect.fail("Should have thrown NotFound after remove");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`banId: Missing Ban ${INPUTS[0].id}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

    })

    describe("BanServices.update()", () => {

        it("should fail on invalid ID", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUTS = await BanServices.all(FACILITY.id);
            const INVALID_ID = -1;

            try {
                await BanServices.update(FACILITY.id, INVALID_ID, INPUTS[0]);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`banId: Missing Ban ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on no changed data", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await BanServices.all(FACILITY.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await BanServices.update(FACILITY.id, INPUT.id, INPUT);
                compareBanOld(OUTPUT, INPUT);
            });

        })

        it("should pass on no updated data", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUTS = await BanServices.all(FACILITY.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await BanServices.update(FACILITY.id, INPUT.id, {
                    id: INPUT.id,
                });
                compareBanOld(OUTPUT, INPUT);
            });

        })

        it("should pass on valid updated data", async () => {

            const FACILITY = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUTS = await BanServices.all(FACILITY.id);

            INPUTS.forEach(async INPUT => {
                const UPDATE = {
                    ...INPUT,
                    comments: "Updated comments",
                    staff: "Updated staff",
                }
                const OUTPUT = await BanServices.update(FACILITY.id, INPUT.id, UPDATE);
                compareBanOld(OUTPUT, UPDATE);
                const UPDATED = await BanServices.find(FACILITY.id, INPUT.id);
                compareBanOld(UPDATED, OUTPUT);
            });

        })

    })

})

// Helper Objects ------------------------------------------------------------

export function compareBanNew(OUTPUT: Partial<Ban>, INPUT: Partial<Ban>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.comments).to.equal(INPUT.comments ? INPUT.comments : null);
    expect(OUTPUT.facilityId).to.exist;
    // @ts-ignore - always present
    expect(OUTPUT.fromDate).to.equal(Dates.fromObject(INPUT.fromDate));
    expect(OUTPUT.guestId).to.exist;
    expect(OUTPUT.staff).to.equal(INPUT.staff ? INPUT.staff : null);
    // @ts-ignore - always present
    expect(OUTPUT.toDate).to.equal(Dates.fromObject(INPUT.toDate));
}

export function compareBanOld(OUTPUT: Partial<Ban>, INPUT: Partial<Ban>) {
    expect(OUTPUT.id).to.equal(INPUT.id !== undefined ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : OUTPUT.active);
    expect(OUTPUT.comments).to.equal(INPUT.comments ? INPUT.comments : OUTPUT.comments);
    expect(OUTPUT.facilityId).to.exist;
    expect(OUTPUT.fromDate).to.equal(INPUT.fromDate !== undefined ? INPUT.fromDate : OUTPUT.fromDate);
    expect(OUTPUT.guestId).to.exist;
    expect(OUTPUT.toDate).to.equal(INPUT.toDate !== undefined ? INPUT.toDate : OUTPUT.toDate);
}
