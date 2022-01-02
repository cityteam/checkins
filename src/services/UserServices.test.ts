// UserServices.test ---------------------------------------------------------

// Functional tests for UserServices.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import UserServices from "./UserServices";
import {BadRequest, NotFound} from "../util/HttpErrors";
import * as SeedData from "../util/SeedData";
import {loadTestData, lookupUser} from "../util/TestUtils";

// Test Specifications ------------------------------------------------------

describe("UserServices Functional Tests", () => {

    // Test Hooks -----------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await loadTestData({
            withAccessTokens: true,
            withRefreshTokens: true,
            withUsers: true,
        });
    })

    // Test Methods --------------------------------------------------------

    describe("UserServices.accessTokens()", () => {

        it("should pass on active AccessTokens", async () => {

            const NOW = new Date().getTime();
            const INPUT = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);

            const OUTPUTS = await UserServices.accessTokens(INPUT.id, {
                active: "",
            });
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.expires.getTime()).to.be.greaterThanOrEqual(NOW);
                expect(OUTPUT.userId).to.equal(INPUT.id);
            });

        })

        it("should pass on all AccessTokens", async () => {

            const INPUT = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);

            const OUTPUTS = await UserServices.accessTokens(INPUT.id);
            expect(OUTPUTS.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
            OUTPUTS.forEach(result => {
                expect(result.userId).to.equal(INPUT.id);
            });

        })

        it("should pass on paginated AccessTokens", async () => {

            const LIMIT = 1;
            const OFFSET = 1;
            const user = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);

            const accessTokens = await UserServices.accessTokens(user.id);
            const paginateds = await UserServices.accessTokens(user.id, {
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(paginateds.length).to.equal(LIMIT);
            paginateds.forEach((paginated, index) => {
                expect(paginated.id).to.equal(accessTokens[index + OFFSET].id);
                expect(paginated.userId).to.equal(user.id);
            });

        })

    })

    describe("UserServices.all()", () => {

        it("should pass on active Users", async () => {

            const OUTPUTS = await UserServices.all({ active: "" });
            OUTPUTS.forEach(OUTPUT => {
                if (!OUTPUT.active) {
                    expect.fail(`User '${OUTPUT.username}' was not active, should have been skipped`);
                }
            })

        })

        it("should pass on all Users", async () => {

            const OUTPUTS = await UserServices.all();
            expect(OUTPUTS.length).equals(SeedData.USERS.length);

        })

        it("should pass on included children", async () => {

            const OUTPUTS = await UserServices.all({
                withAccessTokens: "",
                withRefreshTokens: "",
            });
            OUTPUTS.forEach(OUTPUT => {
                expect(OUTPUT.accessTokens).to.exist;
                if (OUTPUT.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(OUTPUT.accessTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
                } else {
                    expect(OUTPUT.accessTokens.length).to.equal(0);
                }
                expect(OUTPUT.refreshTokens).to.exist;
                if (OUTPUT.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(OUTPUT.refreshTokens.length).to.equal(SeedData.REFRESH_TOKENS_SUPERUSER.length);
                } else {
                    expect(OUTPUT.refreshTokens.length).to.equal(0);
                }
            })

        })

        it("should pass on paginated Users", async () => {

            const LIMIT = 3;
            const OFFSET = 1;
            const INPUTS = await UserServices.all();

            const OUTPUTS = await UserServices.all({
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(OUTPUTS.length).equals(LIMIT);
            OUTPUTS.forEach((OUTPUT, index) => {
                expect(OUTPUT.id).to.equal(INPUTS[index + OFFSET].id);
            });

        })

        it("should pass on username matched Users", async () => {

            const PATTERN = "irst";

            const results = await UserServices.all({
                username: PATTERN,
            });
            results.forEach(result => {
                expect(result.username).to.include(PATTERN);
            })

        })

    })

    describe("UserServices.exact()", () => {

        it("should fail on invalid username", async () => {

            const INVALID_USERNAME = "abra cadabra";

            try {
                await UserServices.exact(INVALID_USERNAME);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`username: Missing User '${INVALID_USERNAME}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included children", async () => {

            const OUTPUTS = await UserServices.all({
                withAccessTokens: "",
                withRefreshTokens: "",
            });
            OUTPUTS.forEach(async OUTPUT => {
                const user = await UserServices.exact(OUTPUT.username);
                expect(user.accessTokens).to.exist;
                if (user.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(user.accessTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
                } else {
                    expect(user.accessTokens.length).to.equal(0);
                }
                expect(user.refreshTokens).to.exist;
                if (user.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(user.refreshTokens.length).to.equal(SeedData.REFRESH_TOKENS_SUPERUSER.length);
                } else {
                    expect(user.refreshTokens.length).to.equal(0);
                }
            });

        })

        it("should pass on valid usernames", async () => {

            const INPUTS = await UserServices.all();

            INPUTS.forEach(async (INPUT) => {
                const OUTPUT = await UserServices.exact(INPUT.username);
                expect(OUTPUT.id).to.equal(INPUT.id);
            })

        })

    })

    describe("UserServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;

            try {
                await UserServices.find(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`userId: Missing User ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included children", async () => {

            const INPUTS = await UserServices.all({
                withAccessTokens: "",
                withRefreshTokens: "",
            });

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await UserServices.find(INPUT.id);
                expect(OUTPUT.accessTokens).to.exist;
                if (OUTPUT.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(OUTPUT.accessTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
                } else {
                    expect(OUTPUT.accessTokens.length).to.equal(0);
                }
                expect(OUTPUT.refreshTokens).to.exist;
                if (OUTPUT.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(OUTPUT.refreshTokens.length).to.equal(SeedData.REFRESH_TOKENS_SUPERUSER.length);
                } else {
                    expect(OUTPUT.refreshTokens.length).to.equal(0);
                }
            })

        })

        it("should pass on valid IDs", async () => {

            const INPUTS = await UserServices.all();

            INPUTS.forEach(async (INPUT) => {
                const OUTPUT = await UserServices.find(INPUT.id);
                expect(OUTPUT.id).to.equal(INPUT.id);
                expect(OUTPUT.password).to.equal("");
            })

        })

    })

    describe("UserServices.insert()", () => {

        it("should fail on duplicate username", async () => {

            const EXISTING = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const INPUT = {
                name: "dummy",
                password: "dummy",
                scope: "dummy",
                username: EXISTING.username,
            };

            try {
                await UserServices.insert(INPUT);
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
                await UserServices.insert(INPUT);
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
                active: true,
                name: "Inserted User",
                password: "insertedpassword",
                scope: "superuser",
                username: "inserted",
            };

            const OUTPUT = await UserServices.insert(INPUT);
            expect(OUTPUT.id).to.exist;
            expect(OUTPUT.active).to.equal(INPUT.active);
            expect(OUTPUT.name).to.equal(INPUT.name);
            expect(OUTPUT.password).to.equal(""); // It was redacted
            expect(OUTPUT.scope).to.equal(INPUT.scope);
            expect(OUTPUT.username).to.equal(INPUT.username);

            const FOUND = await UserServices.find(OUTPUT.id);
            expect(FOUND).to.exist;
            // @ts-ignore
            expect(FOUND.name).to.equal(INPUT.name);

        })

    })

    describe("UserServices.refreshTokens()", () => {

        it("should pass on active RefreshTokens", async () => {

            const NOW = new Date().getTime();
            const user = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);

            const results = await UserServices.refreshTokens(user.id, {
                active: "",
            });
            results.forEach(result => {
                expect(result.expires.getTime()).to.be.greaterThanOrEqual(NOW);
                expect(result.userId).to.equal(user.id);
            });

        })

        it("should pass on all RefreshTokens", async () => {

            const user = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const results = await UserServices.refreshTokens(user.id);
            expect(results.length).to.equal(SeedData.REFRESH_TOKENS_SUPERUSER.length);
            results.forEach(result => {
                expect(result.userId).to.equal(user.id);
            });

        })

        it("should pass on paginated RefreshTokens", async () => {

            const LIMIT = 1;
            const OFFSET = 1;

            const user = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const refreshTokens = await UserServices.refreshTokens(user.id);
            const paginateds = await UserServices.refreshTokens(user.id, {
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(paginateds.length).to.equal(LIMIT);
            paginateds.forEach((paginated, index) => {
                expect(paginated.id).to.equal(refreshTokens[index + OFFSET].id);
                expect(paginated.userId).to.equal(user.id);
            });

        })

    })

    describe("UserServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;

            try {
                await UserServices.remove(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`userId: Missing User ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }
        })

        it("should pass on valid input", async () => {

            const INPUT = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const OUTPUT = await UserServices.remove(INPUT.id);
            expect(OUTPUT.id).to.equal(INPUT.id);

            try {
                await UserServices.remove(INPUT.id);
                expect.fail(`Should have thrown NotFound after remove`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`userId: Missing User ${INPUT.id}`);
                } else {
                    expect.fail(`Should have thrown NotFound`);
                }
            }

        })

    })

    describe("UserServices.update()", () => {

        it("should fail on duplicate username", async () => {

            const ORIGINAL = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const INPUT = {
                active: ORIGINAL.active,
                name: ORIGINAL.name,
                scope: ORIGINAL.scope,
                username: SeedData.USER_USERNAME_FIRST_ADMIN,
            }

            try {
                await UserServices.update(ORIGINAL.id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include
                        (`username: Username '${INPUT.username}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid ID", async () => {

            const INVALID_ID = -1;
            const ORIGINAL = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const INPUT = {
                active: ORIGINAL.active,
                name: ORIGINAL.name,
                password: "",
                scope: ORIGINAL.scope,
                username: ORIGINAL.username,
            }

            try {
                await UserServices.update(INVALID_ID, INPUT);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                        (`userId: Missing User ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid update data", async () => {

            const ORIGINAL = await lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const INPUT = {
                active: !ORIGINAL.active,
                name: ORIGINAL.name + " UPDATED",
                password: "newpassword",
                scope: ORIGINAL.scope + " UPDATED",
                username: ORIGINAL.username,
            }

            const OUTPUT = await UserServices.update(ORIGINAL.id, INPUT);
            expect(OUTPUT.active).to.equal(INPUT.active);
            expect(OUTPUT.name).to.equal(INPUT.name);
            expect(OUTPUT.password).to.equal("");
            expect(OUTPUT.scope).to.equal(INPUT.scope);
            expect(OUTPUT.username).to.equal(INPUT.username);

            const UPDATED = await UserServices.find(ORIGINAL.id); // Pick up password redact
            expect(UPDATED.active).to.equal(OUTPUT.active);
            expect(UPDATED.name).to.equal(OUTPUT.name);
            expect(UPDATED.password).to.equal("");
            expect(UPDATED.scope).to.equal(OUTPUT.scope);
            expect(UPDATED.username).to.equal(OUTPUT.username);

        })


    })


})
