// OAuthTokenRouter.test -----------------------------------------------------

// Functional Tests for OAuthTokenRouter.

// External Modules ----------------------------------------------------------


import {USER_USERNAME_SUPERUSER} from "../util/SeedData";

const chai = require("chai");
const expect = chai.expect;
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

import {PasswordTokenRequest, RefreshTokenRequest} from "@craigmcc/oauth-orchestrator";

// Internal Modules ----------------------------------------------------------

import app from "../routers/ExpressApplication";
import { NO_CONTENT, OK, UNAUTHORIZED } from "../util/HttpErrors";
import {AUTHORIZATION, loadTestData} from "../util/TestUtils";

// Test Specifications -------------------------------------------------------

describe("OAuthTokenRouter Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withUsers: true,
        });
    })

    // Test Methods ----------------------------------------------------------

    const PATH = "/oauth/token";

    describe("OAuthTokenRouter DELETE /oauth/token", () => {

        it("should pass on valid revoke token request", async () => {

            // Request an access token
            const request1: PasswordTokenRequest = {
                grant_type: "password",
                password: USER_USERNAME_SUPERUSER, // For tests, we hashed the username
                scope: "superuser",
                username: USER_USERNAME_SUPERUSER,
            }
            const response1 = await chai.request(app)
                .post(PATH)
                .send(request1);
            expect(response1).to.have.status(OK);
            expect(response1).to.be.json;
            expect(response1.body.access_token).to.exist;
            const authorization = `Bearer ${response1.body.access_token}`;

            // Revoke this access token
            const response2 = await chai.request(app)
                .delete(PATH)
                .set(AUTHORIZATION, authorization);
            expect(response2).to.have.status(NO_CONTENT);

            // The previous access token should no longer be usable
            const response3 = await chai.request(app)
                .delete(PATH)
                .set(AUTHORIZATION, authorization);
            expect(response3).to.have.status(UNAUTHORIZED);

        })


    })

    describe("OAuthTokenRouter POST /oauth/token", () => {

        it("should pass on valid PASSWORD grant type request", async () => {

            const request: PasswordTokenRequest = {
                grant_type: "password",
                password: USER_USERNAME_SUPERUSER, // For tests, we hashed the username
                scope: "superuser",
                username: USER_USERNAME_SUPERUSER,
            }

            const response = await chai.request(app)
                .post(PATH)
                .send(request);
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.access_token).to.exist;

        })

        // NOTE - Refresh tokens are turned off, so cannot test this
        it.skip("should pass on valid REFRESH grant type request", async () => {

            // Request an access token
            const request1: PasswordTokenRequest = {
                grant_type: "password",
                password: USER_USERNAME_SUPERUSER, // For tests, we hashed the username
                scope: "superuser",
                username: USER_USERNAME_SUPERUSER,
            }
            const response1 = await chai.request(app)
                .post(PATH)
                .send(request1);
            expect(response1).to.have.status(OK);
            expect(response1).to.be.json;
            expect(response1.body.access_token).to.exist;
            expect(response1.body.refresh_token).to.exist;
            const authorization = `Bearer ${response1.body.access_token}`;

            // Use the refresh token to request a new access token and refresh token
            const request2: RefreshTokenRequest = {
                grant_type: "refresh_token",
                refresh_token: response1.body.refresh_token,
            }
            const response2 = await chai.request(app)
                .post(PATH)
                .set(AUTHORIZATION, authorization)
                .send(request2);
            expect(response2).to.have.status(OK);
            expect(response2.body.access_token).to.exist;
            expect(response2.body.refresh_token).to.exist;

            // The previous access token should no longer be valid
            const response3 = await chai.request(app)
                .delete(PATH)
                .set(AUTHORIZATION, authorization);
            expect(response3).to.have.status(UNAUTHORIZED);

        })

    })

})
