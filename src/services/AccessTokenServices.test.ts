// AccessTokenServices.test --------------------------------------------------

// Functional tests for AccessTokenServices.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import AccessTokenServices from "./AccessTokenServices";
import AccessToken from "../models/AccessToken";
import {BadRequest, NotFound} from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {loadTestData, lookupUser} from "../util/TestUtils";

// Test Specifications -------------------------------------------------------

describe("AccessTokenServices Functional Tests", () => {

    // Test Hooks -----------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withAccessTokens: true,
            withUsers: true,
        });
    })

    // Test Methods --------------------------------------------------------

    describe("AccessTokenServices.all()", () => {

        it("should pass on active AccessTokens", async () => {

            const NOW = new Date();

            const OUTPUTS = await AccessTokenServices.all({ active: "" });
            OUTPUTS.forEach(OUTPUT => {
                if (OUTPUT.expires < NOW) {
                    expect.fail(`AccessToken '${OUTPUT.token}' was not active, should have been skipped`);
                }
            })

        })

        it("should pass on all AccessTokens", async () => {

            const OUTPUTS = await AccessTokenServices.all();
            expect(OUTPUTS.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);

        })

        it("should pass on included children", async () => {

            const OUTPUTS = await AccessTokenServices.all({
                withUser: "",
            });
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.user).to.exist;
                expect(OUTPUT.user.id).to.equal(OUTPUT.userId);
            })

        })

        it("should pass on paginated AccessTokens", async () => {

            const LIMIT = 1;
            const OFFSET = 1;

            const OUTPUTS = await AccessTokenServices.all({
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(OUTPUTS.length).equals(LIMIT);

        })


    })

    describe("AccessTokenServices.exact()", () => {

        it("should fail on invalid token", async () => {

            const INVALID_TOKEN = "abra cadabra";

            try {
                await AccessTokenServices.exact(INVALID_TOKEN);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect((error as Error).message).to.include
                        (`token: Missing AccessToken '${INVALID_TOKEN}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }

            }

        })

        it("should pass on included children", async () => {

            const INPUTS = await AccessTokenServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await AccessTokenServices.exact(INPUT.token, {
                    withUser: "",
                });
                expect(OUTPUT.user).to.exist;
                expect(OUTPUT.user.id).to.equal(INPUT.userId);
            });

        })

        it("should pass on valid tokens", async () => {

            const INPUTS = await AccessTokenServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await AccessTokenServices.exact(INPUT.token);
                expect(OUTPUT.id).to.equal(INPUT.id);
                expect(OUTPUT.expires).to.equal(INPUT.expires);
                expect(OUTPUT.scope).to.equal(INPUT.scope);
                expect(OUTPUT.token).to.equal(INPUT.token);
                expect(OUTPUT.user).to.not.exist;
            });

        })

    })

    describe("AccessTokenServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;

            try {
                await AccessTokenServices.find(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect((error as Error).message).to.include
                        (`tokenId: Missing AccessToken ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included parent", async () => {

            const INPUTS = await AccessTokenServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await AccessTokenServices.find(INPUT.id, {
                    withUser: "",
                });
                expect(OUTPUT.user).to.exist;
                expect(OUTPUT.user.id).to.equal(INPUT.userId);
            });

        })

        it("should pass on valid IDs", async () => {

            const INPUTS = await AccessTokenServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await AccessTokenServices.find(INPUT.id);
                expect(OUTPUT.id).to.equal(INPUT.id);
                expect(OUTPUT.expires).to.equal(INPUT.expires);
                expect(OUTPUT.scope).to.equal(INPUT.scope);
                expect(OUTPUT.token).to.equal(INPUT.token);
                expect(OUTPUT.userId).to.equal(INPUT.userId);
            });

        })

    })

    describe("AccessTokenServices.insert()", () => {

        it("should fail on duplicate data", async () => {

            const EXISTING = await AccessTokenServices.all();
            const INPUT = {
                expires: new Date(),
                scope: "newscope",
                token: EXISTING[0].token,
                userId: EXISTING[0].userId,
            }

            try {
                await AccessTokenServices.insert(INPUT);
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
                await AccessTokenServices.insert(INPUT);
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

            const USER = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const INPUT = {
                expires: new Date(),
                scope: "newscope",
                token: "inserted token value",
                userId: USER.id,
            }

            const OUTPUT = await AccessTokenServices.insert(INPUT);
            expect(OUTPUT.id).to.exist;
            expect(OUTPUT.expires).to.exist; // Clock skew
            expect(OUTPUT.scope).to.equal(INPUT.scope);
            expect(OUTPUT.token).to.equal(INPUT.token);
            expect(OUTPUT.userId).to.equal(INPUT.userId);

        })

    })

    describe("AccessTokenServices.purge()", () => {

        it("should only purge old expired AccessTokens", async () => {

            const ONE_DAY = 24 * 60 * 60 * 1000; // One day (milliseconds)
            const ONE_HOUR = 60 * 60 * 1000;     // One hour (milliseconds)
            const user = await lookupUser(SeedData.USER_USERNAME_FIRST_REGULAR);
            await AccessToken.bulkCreate([
                {
                    expires: new Date(new Date().getTime() - (ONE_DAY * 2)),
                    scope: "oldertoken",
                    token: "two-days-old",
                    userId: user.id,
                },
                {
                    expires: new Date(new Date().getTime() - (ONE_DAY * 3)),
                    scope: "oldertoken",
                    token: "three-days-old",
                    userId: user.id,
                },
                {
                    expires: new Date(new Date().getTime() - ONE_HOUR),
                    scope: "newertoken",
                    token: "one-hour-old",
                    userId: user.id,
                }
            ])
            const originals = await AccessToken.findAll({
                where: { userId: user.id }
            });
            expect(originals.length).to.equal(3);

            await AccessTokenServices.purge();
            const leftovers = await AccessToken.findAll({
                where: { userId: user.id }
            });
            expect(leftovers.length).to.equal(1);
            expect(leftovers[0].scope).to.equal("newertoken");

        })

    })

    describe("AccessTokenServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;

            try {
                await AccessTokenServices.remove(INVALID_ID);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect((error as Error).message).to.include
                        (`tokenId: Missing AccessToken ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid input", async () => {

            const INPUT = await AccessTokenServices.all();
            const OUTPUT = await AccessTokenServices.remove(INPUT[0].id);
            expect(OUTPUT.id).to.equal(INPUT[0].id);

            try {
                await AccessTokenServices.remove(INPUT[0].id);
                expect.fail(`Should have thrown NotFound after remove`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`tokenId: Missing AccessToken ${INPUT[0].id}`);
                } else {
                    expect.fail(`Should have thrown NotFound`);
                }
            }

        })

    })

    describe("AccessTokenServices.update()", () => {

        it("should fail on duplicate token", async () => {

            const ORIGINAL = await AccessTokenServices.all();
            const INPUT = {
                expires: ORIGINAL[0].expires,
                scope: ORIGINAL[0].scope,
                token: ORIGINAL[1].token,
                userId: ORIGINAL[0].userId,
            }

            try {
                await AccessTokenServices.update(ORIGINAL[0].id, INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include
                        (`token: Token '${INPUT.token}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;
            const ORIGINAL = await AccessTokenServices.all();
            const INPUT = {
                expires: ORIGINAL[0].expires,
                scope: ORIGINAL[0].scope,
                token: ORIGINAL[0].token + " UPDATED",
                userId: ORIGINAL[0].userId,
            }

            try {
                await AccessTokenServices.update(INVALID_ID, INPUT);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`tokenId: Missing AccessToken ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

    })

})
