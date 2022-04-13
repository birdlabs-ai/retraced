import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import listActions from "../../../handlers/admin/listActions";
import getPgPool from "../../../persistence/pg";
import { AdminTokenStore } from "../../../models/admin_token/store";

@suite class ListActions {
    @test public async "ListActions#listActions()"() {
        let pool = getPgPool();
        try {
            await cleanup(pool);
            let res = await setup(pool);
            let result = await listActions({
                get: () => {
                    return `id=${res.id} token=${res.token}`;
                },
                params: {
                    projectId: "test",
                },
                query: {
                    environmentId: "test",
                },
            });
            expect(result.status).to.equal(200);
            expect(result.body).to.not.undefined;
        } catch (ex) {
            console.log(ex);
        } finally {
            await cleanup(pool);
        }
    }
}
async function setup(pool) {
    await pool.query("INSERT INTO project (id, name) VALUES ($1, $2)", ["test", "test"]);
    await pool.query("INSERT INTO environment (id, name, project_id) VALUES ($1, $2, $3)", ["test", "test", "test"]);
    await pool.query("INSERT INTO retraceduser (id, email) VALUES ($1, $2)", ["test", "test@test.com"]);
    await pool.query("INSERT INTO retraceduser (id, email) VALUES ($1, $2)", ["test1", "test1@test.com"]);
    await pool.query("INSERT INTO environmentuser (user_id, environment_id, email_token) VALUES ($1, $2, $3)", ["test", "test", "dummytoken"]);
    // await pool.query("INSERT INTO environmentuser (user_id, environment_id, email_token) VALUES ($1, $2, $3)", ["test1", "test", "dummytoken"]);
    let res = await AdminTokenStore.default().createAdminToken("test");
    await pool.query("INSERT INTO projectuser (id, project_id, user_id) VALUES ($1, $2, $3)", ["test", "test", "test"]);
    await pool.query("INSERT INTO projectuser (id, project_id, user_id) VALUES ($1, $2, $3)", ["test1", "test", "test1"]);
    await pool.query("INSERT INTO action (id, created, environment_id, event_count, first_active, action, last_active, project_id, display_template) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", ["test", new Date(), "test", 100, new Date(), "test", new Date(), "test", "test"]);
    // await pool.query("INSERT INTO deletion_request (id, created, backoff_interval, resource_kind, resource_id) VALUES ($1, $2, $3, $4, $5)", ["test", new Date(), 10000000, "test", "test"]);
    // await pool.query("INSERT INTO deletion_confirmation (id, deletion_request_id, retraceduser_id, visible_code) VALUES ($1, $2, $3, $4)", ["test", "test", "test", "test"]);
    return res;
}

async function cleanup(pool) {
    await pool.query(`DELETE FROM environmentuser WHERE environment_id=$1`, ["test"]);
    await pool.query(`DELETE FROM admin_token WHERE user_id=$1`, ["test"]);
    await pool.query(`DELETE FROM projectuser WHERE project_id=$1`, ["test"]);
    await pool.query(`DELETE FROM project WHERE id=$1`, ["test"]);
    await pool.query(`DELETE FROM token WHERE environment_id=$1`, ["test"]);
    await pool.query(`DELETE FROM environment WHERE name=$1`, ["test"]);
    await pool.query(`DELETE FROM retraceduser WHERE id=$1 OR id=$2`, ["test", "test1"]);
    await pool.query(`DELETE FROM deletion_request WHERE resource_id=$1`, ["test"]);
    await pool.query(`DELETE FROM deletion_confirmation WHERE id=$1`, ["test"]);
    await pool.query(`DELETE FROM action WHERE id=$1`, ["test"]);
}
