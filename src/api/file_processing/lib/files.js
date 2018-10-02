import fs from "fs";
import db from "../../../db.js";

export function uploadFile(oldFileName, res) {
  const fileName = "whatever ya wanna call it";
  const insertFileSql = `INSERT INTO TBL_NAME (file_path) VALUES ('${fileName}')`;

  fs.rename(
    `/var/lib/uploaded_images/${oldFileName}`,
    `/var/lib/uploaded_images/${fileName}.jpg`,
    async err => {
      if (err) {
        return res.status(500).send(err);
      } else {
        try {
          let result = await db.query(insertImageSql);
          const fileId = result.insertId;
          // at this point the file has been uploaded to disk storage, renamed to {fileName}, and inserted in a sql table

          return res.send("{whatever}");
        } catch (err) {
          return res.status(500).send(err);
        }
      }
    }
  );
}
