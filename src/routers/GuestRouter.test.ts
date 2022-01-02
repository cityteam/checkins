// GuestRouter.test ----------------------------------------------------------

// Functional Tests for GuestRouter.

// External Modules ----------------------------------------------------------

// Unfortunately, this is required on any test for superuser access
const customEnv = require("custom-env");
customEnv.env(true);

const chai = require("chai");
const expect = chai.expect;
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

// Internal Modules ----------------------------------------------------------

import app from "./ExpressApplication";
import { FORBIDDEN, OK } from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {authorization, AUTHORIZATION, loadTestData, lookupFacility} from "../util/TestUtils";

// Test Specifications -------------------------------------------------------

describe("GuestRouter Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withFacilities: true,
            withGuests: true,
            withUsers: true,
        });
    })

    // Test Methods ----------------------------------------------------------

    describe("GuestRouter GET /api/guests/:facilityId", () => {

        const PATH = "/api/guests/:facilityId";

        it("should fail for other facility admin", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);

            const response = await chai.request(app)
                .get(PATH.replace(":facilityId", "" + facility.id))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail for other facility regular", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_SECOND);

            const response = await chai.request(app)
                .get(PATH.replace(":facilityId", "" + facility.id))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should pass for current Facility admin", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);

            const response = await chai.request(app)
                .get(PATH.replace(":facilityId", "" + facility.id))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.length).to.be.greaterThan(0);

        })

        it("should pass for current Facility regular", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);

            const response = await chai.request(app)
                .get(PATH.replace(":facilityId", "" + facility.id))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.length).to.be.greaterThan(0);

        })

        // Unfortunately this works individually, but not when you do "npm run test"
        // because the SUPERUSER_SCOPE environment variable is not picked up properly
        // by OAuthOrchestrator for some reason.
        it.skip("should pass for superuser", async () => {

            const facility = await lookupFacility(SeedData.FACILITY_NAME_FIRST);

            const response = await chai.request(app)
                .get(PATH.replace(":facilityId", "" + facility.id))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_SUPERUSER));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.length).to.be.greaterThan(0);

        })

    })



})
