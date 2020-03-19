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

    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).send("No files were uploaded.");
      return;
    }

    let file = req.files.file;

    file.mv(path.join(__dirname, "../../uploads", "asfasfasfasf" + path.extname(file.name)), function(err) {
      if (err) {
        return res.status(500).send(err);
      }

      res.json({success: true});
    });
  })

}





