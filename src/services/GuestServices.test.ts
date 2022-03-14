// GuestServices.test --------------------------------------------------------

// Functional tests for GuestServices.

// External Modules ----------------------------------------------------------

import FacilityServices from "./FacilityServices";

const chai = require("chai");
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import GuestServices from "./GuestServices";
import Guest from "../models/Guest";
import {BadRequest, NotFound, NotUnique} from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {loadTestData, lookupFacility, lookupGuest} from "../util/TestUtils";
import Checkin from "../models/Checkin";

// Test Specifications -------------------------------------------------------

// Test Hooks -----------------------------------------------------------

beforeEach("#beforeEach", async () => {
    await loadTestData({
        withCheckins: true,
        withFacilities: true,
        withGuests: true,
    });
})

// Test Methods --------------------------------------------------------

describe("GuestServices Functional Tests", () => {

    describe("GuestServices.all()", () => {

        it("should pass on active Guests", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);

            const guests = await GuestServices.all(
                facility.id,
                { active: "" }
            );
            expect(guests.length).to.be.greaterThan(0);
            guests.forEach(guest => {
                expect(guest.facilityId).to.equal(facility.id);
                expect(guest.active).to.equal(true);
            })

        })

        it("should pass on all Guests", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);

            const guests = await GuestServices.all(facility.id);
            expect(guests.length).to.be.greaterThan(0);
            guests.forEach(guest => {
                expect(guest.facility).to.not.exist;
                expect(guest.facilityId).to.equal(facility.id);
            })

        })

        it("should pass on included parent", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);

            const guests = await GuestServices.all(facility.id, {
                withFacility: "",
            });
            expect(guests.length).to.be.greaterThan(0);
            guests.forEach(guest => {
                expect(guest.facility).to.exist;
                expect(guest.facility.id).to.equal(facility.id);
                expect(guest.facilityId).to.equal(facility.id);
            })

        })

        it("should pass on named Guests", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const PATTERN = "iR"; // Should match First and Third

            const guests = await GuestServices.all(facility.id, {
                name: PATTERN,
            });
            expect(guests.length).to.be.greaterThan(0);
            guests.forEach(guest => {
                expect(guest.facilityId).to.equal(facility.id);
                const first = guest.firstName.toLowerCase().includes(PATTERN.toLowerCase());
                const last = guest.lastName.toLowerCase().includes(PATTERN.toLowerCase());
                expect(first || last, "Failed name match on both first and last");
            })

        })

        it("should pass on paginated Guests", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const LIMIT = 1;
            const OFFSET = 1;

            const guests = await GuestServices.all(facility.id, {
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(guests.length).to.equal(LIMIT);

        })

    })

    describe("GuestServices.checkins()", () => {

        it("should pass on all Checkins", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const guest = await lookupGuest(facility.id, SeedData.GUEST_FIRST_NAME_FIRST, SeedData.GUEST_LAST_NAME_FIRST);

            const checkins = await GuestServices.checkins(facility.id, guest.id);
            checkins.forEach(checkin => {
                expect(checkin.facilityId).to.equal(facility.id);
                expect(checkin.guestId).to.equal(guest.id);
            })

        })



    })

    describe("GuestServices.exact()", () => {

        it("should fail on invalid name", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INVALID_FIRST_NAME = "INVALID";
            const VALID_LAST_NAME = SeedData.GUEST_LAST_NAME_FIRST;

            try {
                await GuestServices.exact(facility.id, INVALID_FIRST_NAME, VALID_LAST_NAME);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`name: Missing Guest '${INVALID_FIRST_NAME} ${VALID_LAST_NAME}'`);
                }
            }

        })

        it("should pass on included parent", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const guests = await GuestServices.all(facility.id);

            guests.forEach(async guest => {
                const result = await GuestServices.exact(facility.id, guest.firstName, guest.lastName, {
                    withFacility: ""
                });
                expect(result.facility).to.exist;
                expect(result.facility.id).to.equal(facility.id);
            })

        })

        it("should pass on valid names", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const guests = await GuestServices.all(facility.id);

            guests.forEach(async guest => {
                const result = await GuestServices.exact(facility.id, guest.firstName, guest.lastName);
                compareGuestOld(result, guest);
            });

        })

    })

    describe("GuestServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INVALID_ID = -1;

            try {
                await GuestServices.find(facility.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`guestId: Missing Guest ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included parent", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const guests = await GuestServices.all(facility.id);

            guests.forEach(async guest => {
                const result = await GuestServices.find(facility.id, guest.id, {
                    withFacility: ""
                });
                expect(result.facility).to.exist;
                expect(result.facility.id).to.equal(facility.id);
            })

        })

        it("should pass on valid IDs", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const guests = await GuestServices.all(facility.id);

            guests.forEach(async guest => {
                const result = await GuestServices.find(facility.id, guest.id);
                compareGuestOld(result, guest);
            })

        })

    })

    describe("GuestServices.insert()", () => {

        it("should fail on duplicate name", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const guests = await GuestServices.all(facility.id);
            const INPUT = {
                firstName: guests[0].firstName,
                lastName: guests[0].lastName,
            }

            try {
                await GuestServices.insert(facility.id, INPUT);
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
            const INPUT = { };

            try {
                await GuestServices.insert(facility.id, INPUT);
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
            const INPUT = {
                firstName: "New First Name",
                lastName: "New Last Name",
            }

            const OUTPUT = await GuestServices.insert(facility.id, INPUT);
            compareGuestNew(OUTPUT, INPUT);

        })

    })

    describe("GuestServices.merge()", () => {

        it("should fail on duplicate guestIds", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const guests = await FacilityServices.guests(facility.id);
            expect(guests.length).to.be.greaterThan(0);

            try {
                await GuestServices.merge(facility.id, guests[0].id, guests[0].id);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`Cannot merge Guest ${guests[0].id} into itself`);
                } else {
                    expect.fail(`Should not have thrown ${error}`);
                }
            }

        })

        it("should fail on invalid facilityId", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const guests = await FacilityServices.guests(facility.id);
            expect(guests.length).to.be.greaterThan(1);
            const INVALID_FACILITY_ID = -1;

            try {
                await GuestServices.merge(INVALID_FACILITY_ID, guests[0].id, guests[1].id);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`Missing Facility ${INVALID_FACILITY_ID}`);
                } else {
                    expect.fail(`Should not have thrown ${error}`);
                }
            }

        })

        it("should fail on invalid fromGuestId", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const guests = await FacilityServices.guests(facility.id);
            expect(guests.length).to.be.greaterThan(1);
            const INVALID_GUEST_ID = -2;

            try {
                await GuestServices.merge(facility.id, guests[0].id, INVALID_GUEST_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`Missing From Guest ${INVALID_GUEST_ID}`);
                } else {
                    expect.fail(`Should not have thrown ${error}`);
                }
            }

        })

        it("should fail on invalid toGuestId", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const guests = await FacilityServices.guests(facility.id);
            expect(guests.length).to.be.greaterThan(1);
            const INVALID_GUEST_ID = -3;

            try {
                await GuestServices.merge(facility.id, INVALID_GUEST_ID, guests[1].id);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`Missing To Guest ${INVALID_GUEST_ID}`);
                } else {
                    expect.fail(`Should not have thrown ${error}`);
                }
            }

        })

        it("should fail on overlapping checkin dates", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const guests = await FacilityServices.guests(facility.id);
            expect(guests.length).to.be.greaterThan(3);

            try {
                await GuestServices.merge(facility.id, guests[0].id, guests[3].id);
                expect.fail("Should have thrown NotUnique");
            } catch (error) {
                if (error instanceof NotUnique) {
                    expect(error.message).to.include(`Guest ${guests[0].id} was already checked in on ${SeedData.CHECKIN_DATE_ONE}`);
                } else {
                    expect.fail(`Should not have thrown ${error}`);
                }
            }

        })

        it("should pass on valid merge", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const guests = await FacilityServices.guests(facility.id);
            expect(guests.length).to.be.greaterThan(3);
            const extraGuest = await Guest.create({
                active: true,
                facilityId: facility.id,
                firstName: "Extra",
                lastName: "Guest",
            });
            const extraCheckin = await Checkin.create({
                checkinDate: SeedData.CHECKIN_DATE_ZERO,
                facilityId: facility.id,
                guestId: extraGuest.id,
                matNumber: 5,
                paymentAmount: 5.00,
                paymentType: "$$",
            });

            try {
                const updatedGuest = await GuestServices.merge(facility.id, guests[0].id, extraGuest.id);
                expect(updatedGuest.id).to.equal(guests[0].id);
                const updatedCheckin = await Checkin.findByPk(extraCheckin.id);
                if (updatedCheckin) {
                    expect(updatedCheckin.guestId).to.equal(guests[0].id);
                } else {
                    expect.fail(`Should have found updatedCheckin ${extraCheckin.id}`);
                }
                const removedGuest = await Guest.findByPk(extraGuest.id);
                expect(removedGuest).to.be.null;
            } catch (error) {
                expect.fail(`Should not have thrown ${error}`);
            }

        })

    })

    describe("GuestServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INVALID_ID = -1;

            try {
                await GuestServices.remove(facility.id, INVALID_ID);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`guestId: Missing Guest ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}`);
                }
            }

        })

        it("should pass on valid ID", async () => {

            const faclity = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const guests = await GuestServices.all(faclity.id);
            await GuestServices.remove(faclity.id, guests[0].id);

            try {
                await GuestServices.remove(faclity.id, guests[0].id);
                expect.fail(`Should have thrown NotFound after remove`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`guestId: Missing Guest ${guests[0].id}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

    })

    describe("GuestServices.update()", () => {

        it("should fail on duplicate name", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const guests = await GuestServices.all(facility.id);
            const INPUT = {
                firstName: guests[1].firstName,
                lastName: guests[1].lastName,
            }

            try {
                await GuestServices.update(facility.id, guests[0].id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`name: Name '${INPUT.firstName} ${INPUT.lastName}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}`);
                }
            }

        })

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const guests = await GuestServices.all(facility.id);
            const INVALID_ID = -1;

            try {
                await GuestServices.update(facility.id, INVALID_ID, guests[0]);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`guestId: Missing Guest ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on no changed data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const ORIGINAL = await lookupGuest(facility.id, SeedData.GUEST_FIRST_NAME_FIRST, SeedData.GUEST_LAST_NAME_FIRST);
            const INPUT = {
                id: ORIGINAL.id,
                active: ORIGINAL.active,
                comments: ORIGINAL.comments,
                facilityId: ORIGINAL.facilityId,
                firstName: ORIGINAL.firstName,
                lastName: ORIGINAL.lastName,
            }

            const OUTPUT = await GuestServices.update(INPUT.facilityId, INPUT.id, INPUT);
            compareGuestOld(OUTPUT, INPUT);
            const UPDATED = await lookupGuest(facility.id, INPUT.firstName, INPUT.lastName);
            compareGuestOld(UPDATED, OUTPUT);

        })

        it("should pass on no updated data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const ORIGINAL = await lookupGuest(facility.id, SeedData.GUEST_FIRST_NAME_FIRST, SeedData.GUEST_LAST_NAME_FIRST);
            const INPUT = { };

            const OUTPUT = await GuestServices.update(facility.id, ORIGINAL.id, INPUT);
            compareGuestOld(OUTPUT, INPUT);
            const UPDATED = await GuestServices.find(facility.id, ORIGINAL.id);
            compareGuestOld(UPDATED, OUTPUT);

        })


        it("should pass on valid updated data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const ORIGINAL = await lookupGuest(facility.id, SeedData.GUEST_FIRST_NAME_SECOND, SeedData.GUEST_LAST_NAME_SECOND);
            const INPUT = {
                active: !ORIGINAL.active,
                comments: "Newly added comment",
            };

            const OUTPUT = await GuestServices.update(facility.id, ORIGINAL.id, INPUT);
            compareGuestOld(OUTPUT, INPUT);
            const UPDATED = await GuestServices.find(facility.id, ORIGINAL.id);
            compareGuestOld(UPDATED, OUTPUT);

        })

    })

})

// Helper Objects ------------------------------------------------------------

export function compareGuestNew(OUTPUT: Partial<Guest>, INPUT: Partial<Guest>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.comments).to.equal(INPUT.comments ? INPUT.comments : null);
    expect(OUTPUT.facilityId).to.exist;
    expect(OUTPUT.firstName).to.equal(INPUT.firstName);
    expect(OUTPUT.lastName).to.equal(INPUT.lastName);
}

export function compareGuestOld(OUTPUT: Partial<Guest>, INPUT: Partial<Guest>) {
    expect(OUTPUT.id).to.equal(INPUT.id !== undefined ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : OUTPUT.active);
    expect(OUTPUT.comments).to.equal(INPUT.comments ? INPUT.comments : OUTPUT.comments);
    expect(OUTPUT.facilityId).to.exist;
    expect(OUTPUT.firstName).to.equal(INPUT.firstName ? INPUT.firstName : OUTPUT.firstName);
    expect(OUTPUT.lastName).to.equal(INPUT.lastName ? INPUT.lastName : OUTPUT.lastName);
}
