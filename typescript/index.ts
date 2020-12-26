import fs from "fs";
import { join } from "path";
import valid from "amphtml-validator";
import optimizer from "@ampproject/toolbox-optimizer";
const html = fs.readFileSync(join(process.cwd() + "/test.html"), "utf-8");
console.log(html);
const ampOptimizer = optimizer.create();

const main = async () => {
  const opti = await ampOptimizer.transformHtml(html);
  valid.getInstance().then(function (validator) {
    var result = validator.validateString(opti);
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
main();
