// RefreshTokenServices.test -------------------------------------------------

// Functional tests for RefreshTokenServices.

// External Modules ----------------------------------------------------------


const chai = require("chai");
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import RefreshTokenServices from "./RefreshTokenServices";
import RefreshToken from "../models/RefreshToken";
import {BadRequest, NotFound} from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {loadTestData, lookupUser} from "../util/TestUtils";

// Test Specifications -------------------------------------------------------

describe("RefreshTokenServices Functional Tests", () => {

    // Test Hooks -----------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withRefreshTokens: true,
            withUsers: true,
        });
    })

    // Test Methods --------------------------------------------------------

    describe("RefreshTokenServices.all()", () => {

        it("should pass on active RefreshTokens", async () => {

            const NOW = new Date();

            const OUTPUTS = await RefreshTokenServices.all({ active: "" });
            OUTPUTS.forEach(OUTPUT => {
                if (OUTPUT.expires < NOW) {
                    expect.fail(`RefreshToken '${OUTPUT.token}' was not active, should have been skipped`);
                }
            })

        })

        it("should pass on all RefreshTokens", async () => {

            const OUTPUTS = await RefreshTokenServices.all();
            expect(OUTPUTS.length).to.equal(SeedData.REFRESH_TOKENS_SUPERUSER.length);

        })

        it("should pass on included children", async () => {

            const OUTPUTS = await RefreshTokenServices.all({
                withUser: "",
            });
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.user).to.exist;
                expect(OUTPUT.user.id).to.equal(OUTPUT.userId);
            })

        })

        it("should pass on paginated RefreshTokens", async () => {

            const LIMIT = 1;
            const OFFSET = 1;

            const OUTPUTS = await RefreshTokenServices.all({
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(OUTPUTS.length).equals(LIMIT);

        })


    })

    describe("RefreshTokenServices.exact()", () => {

        it("should fail on invalid token", async () => {

            const INVALID_TOKEN = "abra cadabra";

            try {
                await RefreshTokenServices.exact(INVALID_TOKEN);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect((error as Error).message).to.include
                        (`token: Missing RefreshToken '${INVALID_TOKEN}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }

            }

        })

        it("should pass on included children", async () => {

            const INPUTS = await RefreshTokenServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await RefreshTokenServices.exact(INPUT.token, {
                    withUser: "",
                });
                expect(OUTPUT.user).to.exist;
                expect(OUTPUT.user.id).to.equal(INPUT.userId);
            });

        })

        it("should pass on valid tokens", async () => {

            const INPUTS = await RefreshTokenServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await RefreshTokenServices.exact(INPUT.token);
                expect(OUTPUT.id).to.equal(INPUT.id);
                expect(OUTPUT.accessToken).to.equal(INPUT.accessToken);
                expect(OUTPUT.expires).to.equal(INPUT.expires);
                expect(OUTPUT.token).to.equal(INPUT.token);
                expect(OUTPUT.user).to.not.exist;
            });

        })

    })

    describe("RefreshTokenServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;

            try {
                await RefreshTokenServices.find(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect((error as Error).message).to.include
                        (`tokenId: Missing RefreshToken ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included parent", async () => {

            const INPUTS = await RefreshTokenServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await RefreshTokenServices.find(INPUT.id, {
                    withUser: "",
                });
                expect(OUTPUT.user).to.exist;
                expect(OUTPUT.user.id).to.equal(INPUT.userId);
            });

        })

        it("should pass on valid IDs", async () => {

            const INPUTS = await RefreshTokenServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await RefreshTokenServices.find(INPUT.id);
                expect(OUTPUT.id).to.equal(INPUT.id);
                expect(OUTPUT.accessToken).to.equal(INPUT.accessToken);
                expect(OUTPUT.expires).to.equal(INPUT.expires);
                expect(OUTPUT.token).to.equal(INPUT.token);
                expect(OUTPUT.userId).to.equal(INPUT.userId);
            });

        })

    })

    describe("RefreshTokenServices.insert()", () => {

        it("should fail on duplicate data", async () => {

            const EXISTING = await RefreshTokenServices.all();
            const INPUT = {
                accessToken: "newaccesstoken",
                expires: new Date(),
                token: EXISTING[0].token,
                userId: EXISTING[0].userId,
            }

            try {
                await RefreshTokenServices.insert(INPUT);
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
                await RefreshTokenServices.insert(INPUT);
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
                accessToken: "newaccesstoken",
                expires: new Date(),
                token: "inserted token value",
                userId: USER.id,
            }

            const OUTPUT = await RefreshTokenServices.insert(INPUT);
            expect(OUTPUT.id).to.exist;
            expect(OUTPUT.accessToken).to.equal(INPUT.accessToken);
            expect(OUTPUT.expires).to.exist; // Clock skew
            expect(OUTPUT.token).to.equal(INPUT.token);
            expect(OUTPUT.userId).to.equal(INPUT.userId);

        })

    })

    describe("RefreshTokenServices.purge()", () => {

        it("should only purge old expired RefreshTokens", async () => {

            const ONE_DAY = 24 * 60 * 60 * 1000; // One day (milliseconds)
            const ONE_HOUR = 60 * 60 * 1000;     // One hour (milliseconds)
            const user = await lookupUser(SeedData.USER_USERNAME_SECOND_REGULAR);
            await RefreshToken.bulkCreate([
                {
                    accessToken: "old1",
                    expires: new Date(new Date().getTime() - (ONE_DAY * 2)),
                    token: "two-days-old",
                    userId: user.id,
                },
                {
                    accessToken: "old2",
                    expires: new Date(new Date().getTime() - (ONE_DAY * 3)),
                    token: "three-days-old",
                    userId: user.id,
                },
                {
                    accessToken: "new1",
                    expires: new Date(new Date().getTime() - ONE_HOUR),
                    token: "one-hour-old",
                    userId: user.id,
                }
            ])
            const originals = await RefreshToken.findAll({
                where: { userId: user.id }
            });
            expect(originals.length).to.equal(3);

            await RefreshTokenServices.purge();
            const leftovers = await RefreshToken.findAll({
                where: { userId: user.id }
            });
            expect(leftovers.length).to.equal(1);
            expect(leftovers[0].accessToken).to.equal("new1");

        })

    })


    describe("RefreshTokenServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;

            try {
                await RefreshTokenServices.remove(INVALID_ID);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect((error as Error).message).to.include
                        (`tokenId: Missing RefreshToken ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid input", async () => {

            const INPUT = await RefreshTokenServices.all();
            const OUTPUT = await RefreshTokenServices.remove(INPUT[0].id);
            expect(OUTPUT.id).to.equal(INPUT[0].id);

            try {
                await RefreshTokenServices.remove(INPUT[0].id);
                expect.fail(`Should have thrown NotFound after remove`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`tokenId: Missing RefreshToken ${INPUT[0].id}`);
                } else {
                    expect.fail(`Should have thrown NotFound`);
                }
            }

        })

    })

    describe("RefreshTokenServices.update()", () => {

        it("should fail on duplicate token", async () => {

            const ORIGINAL = await RefreshTokenServices.all();
            const INPUT = {
                accessToken: ORIGINAL[0].accessToken,
                expires: ORIGINAL[0].expires,
                token: ORIGINAL[1].token,
                userId: ORIGINAL[0].userId,
            }

            try {
                await RefreshTokenServices.update(ORIGINAL[0].id, INPUT);
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
            const ORIGINAL = await RefreshTokenServices.all();
            const INPUT = {
                accessToken: ORIGINAL[0].accessToken,
                expires: ORIGINAL[0].expires,
                token: ORIGINAL[0].token + " UPDATED",
                userId: ORIGINAL[0].userId,
            }

            try {
                await RefreshTokenServices.update(INVALID_ID, INPUT);
                expect.fail(`Should have thrown NotFound`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`tokenId: Missing RefreshToken ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

    })

})
