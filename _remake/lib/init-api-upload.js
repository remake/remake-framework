const path = require("upath");
import getUniqueId from "./get-unique-id";
import { getUserData } from "./user-data";
import { capture } from "../utils/async-utils";


export function initApiUpload ({app}) {

  // route for "/upload" and "/app_*/upload"
  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/upload/, async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    let appName = req.appName;
    let username = req.urlData.pageParams.username;
    let currentUser = req.user;
    let [pageAuthor, pageAuthorError] = await capture(getUserData({appName, username}));

    if (pageAuthorError) {
      res.json({success: false, reason: "userData"});
      return;
    }

    if (username && !pageAuthor) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    let isPageAuthor = currentUser && pageAuthor && currentUser.details.username === pageAuthor.details.username;

    if (!isPageAuthor) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    if (!req.files || !req.files.file) {
      res.status(400).json({success: false, reason: "noDataProvided"});
      return;
    }

    let file = req.files.file;
    let uploadPath = path.join(__dirname, "../../uploads", "asfasfasfasf" + path.extname(file.name));

    file.mv(uploadPath, function(err) {
      if (err) {
        console.log("err", err);
        return res.status(500).json({success: false, reason: "processFailed"});
      }

      res.json({success: true});
    });
  })

}





