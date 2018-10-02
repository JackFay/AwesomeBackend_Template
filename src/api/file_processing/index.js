import { Router } from "express";
import multer from "multer";
import express from "express";
import * as processor from "./lib/files";
import protectedRoute from "../../protected_routes";

const upload = multer({ dest: "/var/lib/uploaded_files" });

export default () => {
  let api = Router();
  api.use(protectedRoute);
  api.use(express.static("/var/lib/uploaded_files"));
  api.post("/upload_file", upload.single("file"), (req, res) => {
    const fileName = req.file.filename;
    processor.uploadFile(fileName, res);
  });

  return api;
};
