const _ = require("lodash");

const validateSession = require("../security/validateSession");
const checkAccess = require("../security/checkAccess");
const getActor = require("../models/actor/get");

const handler = (req) => {
  return new Promise((resolve, reject) => {
    validateSession("admin", req.get("Authorization"))
      .then((claims) => {
        return checkAccess({
          user_id: claims.user_id,
          project_id: req.params.projectId,
        });
      })
      .then((valid) => {
        if (!valid) {
          reject({ status: 401, err: new Error("Unauthorized") });
          return;
        }
        return getActor({
          project_id: req.params.projectId,
          environment_id: req.query.environment_id,
          actor_id: req.params.actorId,
        });
      })
      .then((actor) => {
        resolve({ actor: actor });
      })
      .catch(reject);
  });
};

module.exports = handler;