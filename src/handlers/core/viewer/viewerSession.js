import * as uuid from "uuid";
import * as moment from "moment";

import getViewerToken from "../../../models/viewertoken/get";
import createViewersession from "../../../models/viewersession/create";
import getDisque from "../../../persistence/disque";

const disque = getDisque();

export default function handler(req) {
  return new Promise((resolve, reject) => {
    let session;
    let token;
    getViewerToken({
      viewer_token: req.body.token,
    })
      .then((t) => {
        token = t;
        // Note that, because these "viewer token" values are being read from redis,
        // all of the values are JSON strings, not their normal expected types, and
        // this is the form in which they'll be passed down in the JWT.
        return createViewersession({
          token,
        });
      })
      .then((s) => {
        session = s;
        const job = JSON.stringify({
          taskId: uuid.v4().replace(/-/g, ""),
          projectId: token.project_id,
          environmentId: token.environment_id,
          event: "viewer_session",
          timestamp: moment().unix(),
        });

        const opts = {
          retry: 600, // seconds
          async: true,
        };
        return disque.addjob("user_reporting_task", job, 0, opts);
      })
      .then(() => {
        resolve({
          status: 200,
          body: JSON.stringify(session),
        });
      })
      .catch(reject);
  });
};