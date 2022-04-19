import { suite, test } from "mocha-typescript";
import createSavedSearch from "../../../handlers/enterprise/createSavedSearch";
import getPgPool from "../../../persistence/pg";
import { createEnterpriseToken } from "../../../handlers/createEnterpriseToken";
import { expect } from "chai";
import { AdminTokenStore } from "../../../models/admin_token/store";
import create from "../../../models/api_token/create";
import CustReq from "../../mock-classes/CustomRequest";

@suite class CreateSavedSearch {
    @test public async "CreateSavedSearch#createSavedSearch()"() {
        let pool = getPgPool();
        try {
            await cleanup(pool);
            await setup(pool);
            await createEnterpriseToken(`token=test`, "test", "test", {
                display_name: "test",
            });
            const req = new CustReq();
            req.body = {
                name: "test",
                actions: [],
                actor_ids: [],
                start: +new Date(),
            };
            let res = await createSavedSearch(req);
            expect(res).to.not.be.undefined;
            expect(res.body).to.not.undefined;
        } catch (ex) {
            console.log(ex);
        } finally {
            await cleanup(pool);
        }
    }
    @test public async "CreateSavedSearch#createSavedSearch() without start time"() {
        let pool = getPgPool();
        try {
            await cleanup(pool);
            await setup(pool);
            await createEnterpriseToken(`token=test`, "test", "test", {
                display_name: "test",
            });
            const req = new CustReq();
            req.body = {
                name: "test",
                actions: [],
                actor_ids: [],
            };
            let res = await createSavedSearch(req);
            expect(res).to.not.be.undefined;
            expect(res.body).to.not.undefined;
        } catch (ex) {
            console.log(ex);
        } finally {
            await cleanup(pool);
        }
    }
    @test public async "CreateSavedSearch#createSavedSearch() with invalid start time"() {
        let pool = getPgPool();
        try {
            await cleanup(pool);
            await setup(pool);
            await createEnterpriseToken(`token=test`, "test", "test", {
                display_name: "test",
            });
            const req = new CustReq();
            req.body = {
                name: "test",
                actions: [],
                actor_ids: [],
                start: "randomInvalid value",
            };
            let res = await createSavedSearch(req);
            expect(res).to.not.be.undefined;
            expect(res.body).to.not.undefined;
        } catch (ex) {
            console.log(ex);
        } finally {
            await cleanup(pool);
        }
    }
    @test public async "CreateSavedSearch#createSavedSearch() throws Missing required 'name' field"() {
        let pool = getPgPool();
        try {
            await cleanup(pool);
            await setup(pool);
            await createEnterpriseToken(`token=test`, "test", "test", {
                display_name: "test",
            });
            const req = new CustReq();
            req.body = {
                name: undefined,
                actions: [],
                actor_ids: [],
                start: "",
            };
            await createSavedSearch(req);
            throw new Error(`Expected error "Missing required 'name' field" to be thrown`);
        } catch (ex) {
            expect(ex.status).to.equal(400);
            expect(ex.err.message).to.equal("Missing required 'name' field");
        } finally {
            await cleanup(pool);
        }
    }
    // @test public async "CreateSavedSearch#createSavedSearch() throws search id is invalid"() {
    //     let pool = getPgPool();
    //     let savedSearchId = "testt";
    //     try {
    //         await cleanup(pool);
    //         await setup(pool);
    //         await createEnterpriseToken(`token=test`, "test", "test", {
    //             display_name: "test",
    //         });
    //         let res = await createSavedSearch({
    //             get: () => {
    //                 return `token=test`;
    //             },
    //             body: {
    //                 saved_search_id: savedSearchId,
    //             },
    //         });
    //         throw new Error(`Expected error "Saved search not found (id=${savedSearchId})' to be thrown`);
    //     } catch (ex) {
    //         expect(ex.status).to.equal(404);
    //         expect(ex.err.message).to.equal(`Saved search not found (id=${savedSearchId})`);
    //     } finally {
    //         await cleanup(pool);
    //     }
    // }
}
async function setup(pool) {
    await pool.query("INSERT INTO project (id, name) VALUES ($1, $2)", ["test", "test"]);
    await pool.query("INSERT INTO environment (id, name, project_id) VALUES ($1, $2, $3)", ["test", "test", "test"]);
    await pool.query("INSERT INTO retraceduser (id, email) VALUES ($1, $2)", ["test", "test@test.com"]);
    await pool.query("INSERT INTO environmentuser (user_id, environment_id, email_token) VALUES ($1, $2, $3)", ["test", "test", "dummytoken"]);
    await pool.query("INSERT INTO projectuser (id, project_id, user_id) VALUES ($1, $2, $3)", ["test", "test", "test"]);
    await pool.query("INSERT INTO invite (id, created, email, project_id) VALUES ($1, $2, $3, $4)", ["test", new Date(), "test@test.com", "test"]);
    await pool.query("INSERT INTO saved_search (id, name, project_id, environment_id, group_id, query_desc) VALUES ($1, $2, $3, $4, $5, $6)", ["test", "test", "test", "test", "test", "Select all actors from Pune"]);
    let res = await AdminTokenStore.default().createAdminToken("test");
    await create("test", "test", {
        name: "test",
        disabled: false,
    }, undefined, "test");
    return res;
}

async function cleanup(pool) {
    await pool.query(`DELETE FROM admin_token WHERE user_id=$1`, ["test"]);
    await pool.query(`DELETE FROM environmentuser WHERE user_id=$1`, ["test"]);
    await pool.query(`DELETE FROM environment WHERE name=$1`, ["test"]);
    await pool.query(`DELETE FROM project WHERE name=$1 OR name=$2`, ["test", "test1"]);
    await pool.query(`DELETE FROM projectuser WHERE project_id=$1`, ["test"]);
    await pool.query(`DELETE FROM token WHERE environment_id=$1`, ["test"]);
    await pool.query(`DELETE FROM retraceduser WHERE email=$1`, ["test@test.com"]);
    await pool.query(`DELETE FROM eitapi_token WHERE environment_id=$1`, ["test"]);
    await pool.query(`DELETE FROM invite WHERE project_id=$1`, ["test"]);
    await pool.query(`DELETE FROM active_search WHERE project_id=$1`, ["test"]);
    await pool.query(`DELETE FROM saved_search WHERE project_id=$1`, ["test"]);
}
