import fs from "fs";
import { join } from "path";
import valid from "amphtml-validator";
import optimizer from "@ampproject/toolbox-optimizer";
import cheerio from "cheerio";
import express from "express";
import axios from "axios";

const app = express();
const html = fs.readFileSync(join(process.cwd() + "/test.html"), "utf-8");
const ampOptimizer = optimizer.create();

// const main = async () => {
app.get("/", async (req, res) => {
  // optimizando
  // purgando
  const $ = cheerio.load(html);
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

  const cssUri = $("link[rel$='stylesheet']").attr("href");
  const css = (await axios.get(`https://tftpedia.com/${cssUri}`)).data;
  $("link[rel$='stylesheet']").remove();

  $("head").append(`<style amp-custom>${css}</style>`);

  $("style").each((i, e) => {
    console.log(e.attribs);
    if ((e.attribs = {})) {
      $(e).remove();
    }
    // const cssExtra = $(e).remove();
    // console.log(cssExtra);
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

  const opti = await ampOptimizer.transformHtml($.html());

  // validando!

  validarAMP(opti);

  res.send(opti);
});
// main();

const validarAMP = (html) => {
  valid.getInstance().then(function (validator) {
    var result = validator.validateString(html);
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
};

app.listen(4200);
