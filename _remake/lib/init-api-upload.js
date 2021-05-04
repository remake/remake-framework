const path = require("upath");
const fileUpload = require("express-fileupload");
import { getLongUniqueId } from "./get-unique-id";
import { getUserData } from "./user-data";
import { capture, mkdirpAsync } from "../utils/async-utils";
import { getDirForUpload } from "../utils/directory-helpers";
import RemakeStore from "./remake-store";

const fileUploadMiddleware = fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export function initApiUpload({ app }) {
  // route for "/upload" and "/app_*/upload"
  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/upload/, fileUploadMiddleware, async (req, res) => {
    if (!req.isAuthenticated()) {
      res.json({ success: false, reason: "notAuthorized" });
      return;
    }

    let appName = req.appName;
    let username = req.urlData.pageParams.username;
    let currentUser = req.user;
    let [pageAuthor, pageAuthorError] = await capture(getUserData({ appName, username }));

    if (pageAuthorError) {
      res.json({ success: false, reason: "userData" });
      return;
    }

    if (username && !pageAuthor) {
      res.json({ success: false, reason: "notAuthorized" });
      return;
    }

    let isPageAuthor =
      currentUser && pageAuthor && currentUser.details.username === pageAuthor.details.username;

    if (!isPageAuthor) {
      res.json({ success: false, reason: "notAuthorized" });
      return;
    }

    if (!req.files || !req.files.file) {
      res.status(400).json({ success: false, reason: "noDataProvided" });
      return;
    }

    let file = req.files.file;
    let uploadPathDir = getDirForUpload({ appName, username });
    let [_, mkdirpError] = await capture(mkdirpAsync(uploadPathDir));

    if (mkdirpError) {
      res.status(400).json({ success: false, reason: "invalidSavePath" });
      return;
    }

    let fileName = "file_" + getLongUniqueId() + path.extname(file.name);
    let uploadPath = path.join(uploadPathDir, fileName);
    file.mv(uploadPath, function (err) {
      if (err) {
        return res.status(500).json({ success: false, reason: "processFailed" });
      }

      let filePath = "/uploads/" + username + "/" + fileName;
      res.json({ success: true, filePath });
    });
  });
}
