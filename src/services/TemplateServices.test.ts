// TemplateServices.test -----------------------------------------------------

// Functional tests for TemplateServices.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import TemplateServices from "./TemplateServices";
import Template from "../models/Template";
import {BadRequest, NotFound} from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {loadTestData, lookupFacility, lookupTemplate} from "../util/TestUtils";

// Test Specifications -------------------------------------------------------

describe("TemplateServices Functional Tests", () => {

    // Test Hooks -----------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withFacilities: true,
            withTemplates: true,
        });
    })

    // Test Methods --------------------------------------------------------

    describe("TemplateServices.all()", () => {

        it("should pass on active Templates", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);

            const OUTPUTS = await TemplateServices.all(
                facility.id,
                {active: ""}
            );
            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facilityId).to.equal(facility.id);
                expect(OUTPUT.active).to.equal(true);
            })

        })

        it("should pass on all Templates", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);

            const OUTPUTS = await TemplateServices.all(facility.id);
            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facilityId).to.equal(facility.id);
            })

        })

        it("should pass on included parent", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);

            const OUTPUTS = await TemplateServices.all(facility.id, {
                withFacility: "",
            });
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facility).to.exist;
                expect(OUTPUT.facility.id).to.equal(facility.id);
            })

        })

        it("should pass on named Templates", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const PATTERN = "Ir";  // Should match First and Third

            const OUTPUTS = await TemplateServices.all(facility.id, {
                name: PATTERN,
            });
            expect(OUTPUTS.length).to.be.greaterThan(0);
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.facilityId).to.equal(facility.id);
                expect(OUTPUT.name.toLowerCase()).to.include(PATTERN.toLowerCase());
            })

        })

        it("should pass on paginated Templates", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const LIMIT = 1;
            const OFFSET = 1;

            const OUTPUTS = await TemplateServices.all(facility.id, {
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(OUTPUTS.length).to.equal(LIMIT);

        })

    })

    describe("TemplateServices.exact()", () => {

        it("should fail on invalid name", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INVALID_NAME = "abra cadabra";

            try {
                await TemplateServices.exact(facility.id, INVALID_NAME);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`name: Missing Template '${INVALID_NAME}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included parent", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await TemplateServices.all(facility.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await TemplateServices.exact(facility.id, INPUT.name, {
                    withFacility: ""
                });
                expect(OUTPUT.facility).to.exist;
                expect(OUTPUT.facility.id).to.equal(facility.id);
            })

        })

        it("should pass on valid names", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUTS = await TemplateServices.all(facility.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await TemplateServices.exact(facility.id, INPUT.name);
                compareTemplateOld(OUTPUT, INPUT);
                expect(OUTPUT.facilityId).to.equal(INPUT.facilityId);
            })

        })

    })

    describe("TemplateServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INVALID_ID = -1;

            try {
                await TemplateServices.find(facility.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`templateId: Missing Template ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included parent", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUTS = await TemplateServices.all(facility.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await TemplateServices.find(facility.id, INPUT.id, {
                    withFacility: ""
                });
                expect(OUTPUT.facility).to.exist;
                expect(OUTPUT.facility.id).to.equal(facility.id);
            })

        })

        it("should pass on valid IDs", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await TemplateServices.all(facility.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await TemplateServices.find(facility.id, INPUT.id);
                compareTemplateOld(OUTPUT, INPUT);
            })

        })

    })

    describe("TemplateServices.insert()", () => {

        it("should fail on duplicate name", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUTS = await TemplateServices.all(facility.id);
            const INPUT = {
                name: INPUTS[0].name,
            }

            try {
                await TemplateServices.insert(facility.id, INPUT);
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

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);
            const INPUT = {};

            try {
                await TemplateServices.insert(facility.id, INPUT);
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

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUT = {
                allMats: "1-100",
                name: "Brand New Template",
            }

            const OUTPUT = await TemplateServices.insert(facility.id, INPUT);
            compareTemplateNew(OUTPUT, INPUT);

        })

    })

    describe("TemplateServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INVALID_ID = -1;

            try {
                await TemplateServices.remove(facility.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`templateId: Missing Template ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}`)
                }
            }

        })

        it("should pass on valid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await TemplateServices.all(facility.id);
            await TemplateServices.remove(facility.id, INPUTS[0].id);

            try {
                await TemplateServices.remove(facility.id, INPUTS[0].id);
                expect.fail(`Should have thrown NotFound after remove`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`templateId: Missing Template ${INPUTS[0].id}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

    })

    describe("TemplateServices.update()", () => {

        it("should fail on duplicate name", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const INPUTS = await TemplateServices.all(facility.id);
            const INPUT = {
                allMats: "1-10",
                facilityId: facility.id,
                name: INPUTS[1].name,
            }

            try {
                await TemplateServices.update(facility.id, INPUTS[0].id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`name: Name '${INPUT.name}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid ID", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const INPUTS = await TemplateServices.all(facility.id);
            const INVALID_ID = -1;

            try {
                await TemplateServices.update(facility.id, INVALID_ID, INPUTS[0]);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`templateId: Missing Template ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on no changed data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);
            const ORIGINAL = await lookupTemplate(facility.id, SeedData.TEMPLATE_NAME_SECOND);
            const INPUT = {
                id: ORIGINAL.id,
                active: ORIGINAL.active,
                allMats: ORIGINAL.allMats,
                comments: ORIGINAL.comments,
                facilityId: ORIGINAL.facilityId,
                handicapMats: ORIGINAL.handicapMats,
                name: ORIGINAL.name,
                socketMats: ORIGINAL.socketMats,
                workMats: ORIGINAL.workMats,
            }

            const OUTPUT = await TemplateServices.update(INPUT.facilityId, INPUT.id, INPUT);
            compareTemplateOld(OUTPUT, INPUT);
            const UPDATED = await lookupTemplate(facility.id, SeedData.TEMPLATE_NAME_SECOND);
            compareTemplateOld(UPDATED, OUTPUT);

        })

        it("should pass on no updated data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const ORIGINAL = await lookupTemplate(facility.id, SeedData.TEMPLATE_NAME_THIRD);
            const INPUT = { id: ORIGINAL.id };

            const OUTPUT = await TemplateServices.update(facility.id, ORIGINAL.id, INPUT);
            compareTemplateOld(OUTPUT, INPUT);
            const UPDATED = await TemplateServices.find(facility.id, ORIGINAL.id);
            compareTemplateOld(UPDATED, OUTPUT);

        })

        it("should pass on valid updated data", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_THIRD);
            const ORIGINAL = await lookupTemplate(facility.id, SeedData.TEMPLATE_NAME_THIRD);
            const INPUT = {
                active: !ORIGINAL.active,
                allMats: "1-36",
            };

            const OUTPUT = await TemplateServices.update(facility.id, ORIGINAL.id, INPUT);
            compareTemplateOld(OUTPUT, INPUT);
            const UPDATED = await TemplateServices.find(facility.id, ORIGINAL.id);
            compareTemplateOld(UPDATED, OUTPUT);


        })

    })

})

// Helper Objects ------------------------------------------------------------

export function compareTemplateNew(OUTPUT: Partial<Template>, INPUT: Partial<Template>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.allMats).to.equal(INPUT.allMats);
    expect(OUTPUT.comments).to.equal(INPUT.comments ? INPUT.comments : null);
    expect(OUTPUT.facilityId).to.exist;
    expect(OUTPUT.handicapMats).to.equal(INPUT.handicapMats ? INPUT.handicapMats : null);
    expect(OUTPUT.name).to.equal(INPUT.name);
    expect(OUTPUT.socketMats).to.equal(INPUT.socketMats ? INPUT.socketMats : null);
    expect(OUTPUT.workMats).to.equal(INPUT.workMats ? INPUT.workMats : null);
}

export function compareTemplateOld(OUTPUT: Partial<Template>, INPUT: Partial<Template>) {
    expect(OUTPUT.id).to.equal(INPUT.id !== undefined ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : OUTPUT.active);
    expect(OUTPUT.allMats).to.equal(INPUT.allMats ? INPUT.allMats : OUTPUT.allMats);
    expect(OUTPUT.comments).to.equal(INPUT.comments ? INPUT.comments : OUTPUT.comments);
    expect(OUTPUT.facilityId).to.exist;
    expect(OUTPUT.handicapMats).to.equal(INPUT.handicapMats ? INPUT.handicapMats : OUTPUT.handicapMats);
    expect(OUTPUT.name).to.equal(INPUT.name ? INPUT.name : OUTPUT.name);
    expect(OUTPUT.socketMats).to.equal(INPUT.socketMats ? INPUT.socketMats : OUTPUT.socketMats);
    expect(OUTPUT.workMats).to.equal(INPUT.workMats ? INPUT.workMats : OUTPUT.workMats);
}

