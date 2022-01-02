// FacilityServices.test -----------------------------------------------------

// Functional tests for FacilityServices.

// External Modules ----------------------------------------------------------

import Facility from "../models/Facility";

const chai = require("chai");
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import FacilityServices from "./FacilityServices";
import {BadRequest, NotFound} from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {loadTestData, lookupFacility} from "../util/TestUtils";

describe("FacilityServices Functional Tests", () => {

    // Test Hooks -----------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withCheckins: true,
            withFacilities: true,
            withGuests: true,
            withTemplates: true,
        });
    })

    // Test Methods --------------------------------------------------------

    describe("FacilityServices.all()", () => {

        it("should pass on active users", async () => {

            const OUTPUTS = await FacilityServices.all({ active: "" });
            OUTPUTS.forEach(OUTPUT => {
                if (!OUTPUT.active) {
                    expect.fail(`Facility '${OUTPUT.name}' was not active, should have been skipped`);
                }
            })

        })

        it("should pass on all users", async () => {

            const OUTPUTS = await FacilityServices.all();
            expect(OUTPUTS.length).equals(SeedData.FACILITIES.length);

        })

        it("should pass on included children", async () => {

            const facilities = await FacilityServices.all({
                withCheckins: "",
                withGuests: "",
                withTemplates: "",
            });
            facilities.forEach(facility => {
                expect(facility.checkins).to.exist;
                expect(facility.checkins.length).to.be.greaterThan(0);
                facility.checkins.forEach(checkin => {
                    expect(checkin.facilityId).to.equal(facility.id);
                });
                expect(facility.guests).to.exist;
                expect(facility.guests.length).to.be.greaterThan(0);
                facility.guests.forEach(guest => {
                    expect(guest.facilityId).to.equal(facility.id);
                });
                expect(facility.templates).to.exist;
                expect(facility.templates.length).to.be.greaterThan(0);
                facility.templates.forEach(template => {
                    expect(template.facilityId).to.equal(facility.id);
                });
            });

        })

        it("should pass on named Facilities", async () => {

            const PATTERN = "Ir"; // Should match First and Third

            const OUTPUTS = await FacilityServices.all({ name: PATTERN });
            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.name.toLowerCase()).to.include(PATTERN.toLowerCase());
            })

        })

        it("should pass on paginated Facilities", async () => {

            const LIMIT = 2;
            const OFFSET = 1;
            const INPUTS = await FacilityServices.all();

            const OUTPUTS = await FacilityServices.all({
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(OUTPUTS.length).to.equal(LIMIT);
            OUTPUTS.forEach((OUTPUT, index) => {
                compareFacilityOld(OUTPUT, INPUTS[index + OFFSET]);
            });

        })

    })

    describe("FacilityServices.checkins()", () => {

        it("should pass on all Checkins", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);

            const checkins = await FacilityServices.checkins(facility.id);
            checkins.forEach(checkin => {
                expect(checkin.facilityId).to.equal(facility.id);
            })

        })

    })

    describe("FacilityServices.exact()", () => {

        it("should fail on invalid name", async () => {

            const INVALID_NAME = "abra cadabra";

            try {
                await FacilityServices.exact(INVALID_NAME);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`name: Missing Facility '${INVALID_NAME}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included children", async () => {

            const facilities = await FacilityServices.all({
                withCheckins: "",
                withGuests: "",
                withTemplates: "",
            });
            facilities.forEach(async facility => {
                expect(facility.checkins).to.exist;
                facility.checkins.forEach(checkin => {
                    expect(checkin.facilityId).to.equal(facility.id);
                });
                expect(facility.guests).to.exist;
                facility.guests.forEach(guest => {
                    expect(guest.facilityId).to.equal(facility.id);
                });
                expect(facility.templates).to.exist;
                facility.templates.forEach(template => {
                    expect(template.facilityId).to.equal(facility.id);
                })
            });

        })

        it("should pass on valid names", async () => {

            const INPUTS = await FacilityServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await FacilityServices.exact(INPUT.name);
                compareFacilityOld(OUTPUT, INPUT);
            })

        })

    })

    describe("FacilityServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;

            try {
                await FacilityServices.find(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`facilityId: Missing Facility ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included children", async () => {

            const INPUTS = await FacilityServices.all({
                withCheckins: "",
                withGuests: "",
                withTemplates: "",
            });

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await FacilityServices.find(INPUT.id);
                expect(OUTPUT.checkins).to.exist;
                OUTPUT.checkins.forEach(checkin => {
                    expect(checkin.facilityId).to.equal(INPUT.id);
                });
                expect(OUTPUT.guests).to.exist;
                OUTPUT.guests.forEach(guest => {
                    expect(guest.facilityId).to.equal(INPUT.id);
                });
                expect(OUTPUT.templates).to.exist;
                OUTPUT.templates.forEach(template => {
                    expect(template.facilityId).to.equal(INPUT.id);
                })
            })

        })

        it("should pass on valid IDs", async () => {

            const INPUTS = await FacilityServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await FacilityServices.find(INPUT.id);
                compareFacilityOld(OUTPUT, INPUT);
            })

        })

    })

    describe("FacilityServices.guests()", () => {

        it("should pass on active Guests", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const guests = await FacilityServices.guests(facility.id, {
                active: "",
            });

            guests.forEach(guest => {
                expect(guest.active).to.be.true;
                expect(guest.facilityId).to.equal(facility.id);
            });

        })

        it("should pass on named Guests", async () => {

            const PATTERN = "IR"; // Match "First" and "Third";
            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const guests = await FacilityServices.guests(facility.id, {
                name: PATTERN,
            });

            expect(guests.length).to.be.greaterThan(0);
            guests.forEach(guest => {
                expect(guest.facilityId).to.equal(facility.id);
                expect(guest.firstName.toLowerCase()).to.include(PATTERN.toLowerCase());
            })

        })

        it("should pass on paginated Guests", async () => {

            const LIMIT = 1;
            const OFFSET = 1;
            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const guests = await FacilityServices.guests(facility.id, {
                limit: LIMIT,
                offset: OFFSET,
            });

            expect(guests.length).to.equal(LIMIT);

        })

    })

    describe("FacilityServices.insert()", () => {

        it("should fail on duplicate name", async () => {

            const INPUTS = await FacilityServices.all();
            const INPUT = {
                name: INPUTS[0].name,
                scope: "newscope",
            }

            try {
                await FacilityServices.insert(INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("is already in use");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on duplicate scope", async () => {

            const INPUTS = await FacilityServices.all();
            const INPUT = {
                name: "New Name",
                scope: INPUTS[0].scope,
            }

            try {
                await FacilityServices.insert(INPUT);
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

            const INPUT = {};

            try {
                await FacilityServices.insert(INPUT);
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

            const INPUT = {
                active: false,
                city: "Shangri",
                name: "Shangri La",
                scope: "sla",
                state: "LA",
            }

            const OUTPUT = await FacilityServices.insert(INPUT);
            expect(OUTPUT.id).to.exist;
            compareFacilityNew(OUTPUT, INPUT);

        })

    })

    describe("FacilityServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;

            try {
                await FacilityServices.remove(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`facilityId: Missing Facility ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid ID", async () => {

            const INPUT = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const OUTPUT = await FacilityServices.remove(INPUT.id);
            expect(OUTPUT.id).to.equal(INPUT.id);

            try {
                await FacilityServices.remove(INPUT.id);
                expect.fail(`Should have thrown NotFound after remove`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`facilityId: Missing Facility ${INPUT.id}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

    })

    describe("FacilityServices.templates()", () => {

        it("should pass on active Templates", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const templates = await FacilityServices.templates(facility.id, {
                active: "",
            });

            templates.forEach(template => {
                expect(template.active).to.be.true;
                expect(template.facilityId).to.equal(facility.id);
            });

        })

        it("should pass on named Templates", async () => {

            const PATTERN = "IR"; // Match "First" and "Third";
            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const templates = await FacilityServices.templates(facility.id, {
                name: PATTERN,
            });

            expect(templates.length).to.be.greaterThan(0);
            templates.forEach(template => {
                expect(template.facilityId).to.equal(facility.id);
                expect(template.name.toLowerCase()).to.include(PATTERN.toLowerCase());
            })

        })

        it("should pass on paginated Templates", async () => {

            const LIMIT = 1;
            const OFFSET = 1;
            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const templates = await FacilityServices.templates(facility.id, {
                limit: LIMIT,
                offset: OFFSET,
            });

            expect(templates.length).to.equal(LIMIT);

        })

    })


    describe("FacilityServices.update()", () => {

        it("should fail on duplicate name", async () => {

            const ORIGINAL = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUT = {
                name: SeedData.FACILITY_NAME_SECOND,
            }

            try {
                await FacilityServices.update(ORIGINAL.id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`name: Name '${INPUT.name}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on duplicate scope", async () => {

            const INPUTS = await FacilityServices.all();
            const INPUT = {
                id: INPUTS[1].id,
                scope: INPUTS[0].scope,
            }

            try {
                await FacilityServices.update(INPUT.id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`scope: Scope '${INPUT.scope}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;
            const ORIGINAL = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUT = {
                name: ORIGINAL.name + " UPDATED",
                scope: ORIGINAL.scope + " UPDATED",
            }

            try {
                await FacilityServices.update(INVALID_ID, INPUT);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`facilityId: Missing Facility ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on no changed data", async () => {

            const ORIGINAL = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUT = {
                id: ORIGINAL.id,
                active: ORIGINAL.active,
                address1: ORIGINAL.address1,
                address2: ORIGINAL.address2,
                city: ORIGINAL.city,
                email: ORIGINAL.email,
                name: ORIGINAL.name,
                phone: ORIGINAL.phone,
                scope: ORIGINAL.scope,
                state: ORIGINAL.state,
                zipCode: ORIGINAL.zipCode,
            }

            const OUTPUT = await FacilityServices.update(ORIGINAL.id, INPUT);
            compareFacilityOld(OUTPUT, INPUT);
            const UPDATED = await FacilityServices.find(ORIGINAL.id);
            compareFacilityOld(UPDATED, OUTPUT);

        })

        it("should pass on no updated data", async () => {

            const ORIGINAL = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUT = {};

            const OUTPUT = await FacilityServices.update(ORIGINAL.id, INPUT);
            compareFacilityOld(OUTPUT, INPUT);
            const UPDATED = await FacilityServices.find(ORIGINAL.id);
            compareFacilityOld(UPDATED, OUTPUT);

        })

        it("should pass on valid updated data", async () => {

            const ORIGINAL = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUT = {
                active: !ORIGINAL.active,
                address1: "New address1",
                scope: ORIGINAL.scope + "updated",
            }

            const OUTPUT = await FacilityServices.update(ORIGINAL.id, INPUT);
            compareFacilityOld(OUTPUT, INPUT);
            const UPDATED = await FacilityServices.find(ORIGINAL.id);
            compareFacilityOld(UPDATED, OUTPUT);

        })

    })

})

// Helper Objects ------------------------------------------------------------

export function compareFacilityNew(OUTPUT: Partial<Facility>, INPUT: Partial<Facility>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.address1).to.equal(INPUT.address1 ? INPUT.address1 : null);
    expect(OUTPUT.address2).to.equal(INPUT.address2 ? INPUT.address2 : null);
    expect(OUTPUT.city).to.equal(INPUT.city ? INPUT.city : null);
    expect(OUTPUT.email).to.equal(INPUT.email ? INPUT.email : null);
    expect(OUTPUT.name).to.equal(INPUT.name);
    expect(OUTPUT.phone).to.equal(INPUT.phone ? INPUT.phone : null);
    expect(OUTPUT.scope).to.equal(INPUT.scope);
    expect(OUTPUT.state).to.equal(INPUT.state ? INPUT.state : null);
    expect(OUTPUT.zipCode).to.equal(INPUT.zipCode ? INPUT.zipCode : null);
}

export function compareFacilityOld(OUTPUT: Partial<Facility>, INPUT: Partial<Facility>) {
    expect(OUTPUT.id).to.equal(INPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : OUTPUT.active);
    expect(OUTPUT.address1).to.equal(INPUT.address1 ? INPUT.address1 : null);
    expect(OUTPUT.address2).to.equal(INPUT.address2 ? INPUT.address2 : null);
    expect(OUTPUT.city).to.equal(INPUT.city ? INPUT.city : null);
    expect(OUTPUT.email).to.equal(INPUT.email ? INPUT.email : null);
    expect(OUTPUT.name).to.equal(INPUT.name ? INPUT.name : OUTPUT.name);
    expect(OUTPUT.phone).to.equal(INPUT.phone ? INPUT.phone : null);
    expect(OUTPUT.scope).to.equal(INPUT.scope ? INPUT.scope : OUTPUT.scope);
    expect(OUTPUT.state).to.equal(INPUT.state ? INPUT.state : null);
    expect(OUTPUT.zipCode).to.equal(INPUT.zipCode ? INPUT.zipCode : null);
}
