// UserRouter.test -----------------------------------------------------------

// Functional Tests for UserRouter.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

// Internal Modules ----------------------------------------------------------

import app from "./ExpressApplication";
import { FORBIDDEN, NOT_FOUND, OK } from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {authorization, AUTHORIZATION, loadTestData, lookupUser} from "../util/TestUtils";

// Test Specifications -------------------------------------------------------

describe("UserRouter Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withUsers: true,
        });
    })

    // Test Methods ----------------------------------------------------------

    describe("UserRouter GET /api/users/exact/:username", () => {

        const PATH = "/api/users/exact/:username";

        it("should fail on authenticated admin", async () => {

            const response = await chai.request(app)
                .get(PATH.replace(":username", SeedData.USER_USERNAME_SUPERUSER))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on authenticated regular", async () => {

            const response = await chai.request(app)
                .get(PATH.replace(":username", SeedData.USER_USERNAME_SUPERUSER))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should pass on invalid username", async () => {

            const INVALID_USERNAME = "Invalid Username";

            const response = await chai.request(app)
                .get(PATH.replace(":username", INVALID_USERNAME))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_SUPERUSER));
            expect(response).to.have.status(NOT_FOUND);
            expect(response).to.be.json;
            expect(response.body.message).to.include(`username: Missing User '${INVALID_USERNAME}'`);

        })

        it("should fail on unauthenticated request", async () => {

            const response = await chai.request(app)
                .get(PATH.replace(":username", SeedData.USER_USERNAME_SUPERUSER));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.context).to.equal("OAuthMiddleware.requireSuperuser");
            expect(response.body.message).to.equal("No access token presented");

        })

        it("should pass on authenticated superuser", async () => {

            const response = await chai.request(app)
                .get(PATH.replace(":username", SeedData.USER_USERNAME_SUPERUSER))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_SUPERUSER));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.username).to.equal(SeedData.USER_USERNAME_SUPERUSER);
            expect(response.body.password).to.equal("");

        })

    })

    describe("UserRouter GET /api/users", () => {

        const PATH = "/api/users";

        it("should fail on authenticated admin", async () => {

            const response = await chai.request(app)
                .get(PATH)
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on authenticated regular", async () => {

            const response = await chai.request(app)
                .get(PATH)
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on unauthenticated request", async () => {

            const response = await chai.request(app)
                .get(PATH);
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.context).to.equal("OAuthMiddleware.requireSuperuser");
            expect(response.body.message).to.equal("No access token presented");

        })

        it("should pass on authenticated superuser", async () => {

            const response = await chai.request(app)
                .get(PATH)
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_SUPERUSER));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.length).to.equal(SeedData.USERS.length);

        })

    })

    describe("UserRouter GET /api/users/:userId", () => {

        const PATH = "/api/users/:userId";

        it("should fail on authenticated admin", async () => {

            const user = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);

            const response = await chai.request(app)
                .get(PATH.replace(":userId", "" + user.id))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on authenticated regular", async () => {

            const user = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);

            const response = await chai.request(app)
                .get(PATH.replace(":userId", "" + user.id))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on unauthenticated request", async () => {

            const user = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);

            const response = await chai.request(app)
                .get(PATH.replace(":userId", "" + user.id));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.context).to.equal("OAuthMiddleware.requireSuperuser");
            expect(response.body.message).to.equal("No access token presented");
            expect(response.body.status).to.equal(403);

        })

        it("should pass on authenticated superuser", async () => {

            const user = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);

            const response = await chai.request(app)
                .get(PATH.replace(":userId", "" + user.id))
                .set(AUTHORIZATION, await authorization(SeedData.USER_USERNAME_SUPERUSER));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(user.id);
            expect(response.body.password).to.equal("");

        })

    })

})
