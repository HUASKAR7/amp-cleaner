import fs from "fs";
import { join } from "path";
import valid from "amphtml-validator";
import optimizer from "@ampproject/toolbox-optimizer";
import cheerio from "cheerio";
import express from "express";

const app = express();
const html = fs.readFileSync(join(process.cwd() + "/test.html"), "utf-8");
const ampOptimizer = optimizer.create();

// const main = async () => {
app.get("/", async (req, res) => {
  // optimizando
  const opti = await ampOptimizer.transformHtml(html);
  // purgando
  const $ = cheerio.load(opti);
  $("base").remove();
  // $("link").each((i, e) => {
  //   $(e).remove();
  // });

  $("img").each((i, e) => {
    // $(e).remove();
    e.tagName = "amp-img";
  });

  $("a").each((i, e) => {
    $(e).removeAttr("routerlink");
  });
  $("style").each((i, e) => {
    console.log($(e).html());
  });

  $("*").each((i, e) => {
    const array = Object.keys(e.attribs);
    for (var i = 0; i < array.length; i++) {
      if (array[i].indexOf("ng") != -1) {
        const hash = array[i].trim().toString();
        $(e).removeAttr(hash);
        $(e).addClass(hash);
      }
    }
  });

  $("app-champ-card").each((i, e) => {
    e.tagName = "div";
  });
  $("app-root").each((i, e) => {
    e.tagName = "div";
  });
  $("app-header").each((i, e) => {
    e.tagName = "div";
  });
  $("router-outlet").each((i, e) => {
    e.tagName = "div";
  });
  $("app-champ-home-page").each((i, e) => {
    e.tagName = "div";
  });

  // validando!
  // console.log($.html());
  valid.getInstance().then(function (validator) {
    var result = validator.validateString($.html());
    (result.status === "PASS" ? console.log : console.error)(result.status);
    for (var ii = 0; ii < result.errors.length; ii++) {
      var error = result.errors[ii];
      var msg =
        "line " + error.line + ", col " + error.col + ": " + error.message;
      if (error.specUrl !== null) {
        msg += " (see " + error.specUrl + ")";
      }
      (error.severity === "ERROR" ? console.error : console.warn)(msg);
    }
  });

  res.send($.html());
});
// main();
app.listen(4200);
