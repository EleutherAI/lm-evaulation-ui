const json2html = require("node-json2html");
const fs = require("fs-extra");

const fileName = process.argv.slice(2)[0];

let template_model_config = {
  "<>": "ul",
  html: [
    {
      "<>": "li",
      html: "model: ${model}",
    },
    { "<>": "li", html: "model_args: ${model_args}" },
    { "<>": "li", html: "num_fewshot: ${num_fewshot}" },
    { "<>": "li", html: "batch_size: ${batch_size}" },
    { "<>": "li", html: "device: ${device}" },
    { "<>": "li", html: "no_cache: ${no_cache}" },
    { "<>": "li", html: "limit: ${limit}" },
    { "<>": "li", html: "bootstrap_iters: ${bootstrap_iters}" },
  ],
};

let template_table_header = {
  "<>": "tr",
  html: [
    { "<>": "th", html: "Task" },
    { "<>": "th", html: "Version" },
    { "<>": "th", html: "Metric" },
    { "<>": "th", html: "Value" },
    { "<>": "th", html: "" },
    { "<>": "th", html: "Stderr" },
  ],
};

let template_table_body = {
  "<>": "tr",
  html: [
    {
      "<>": "tr",
      html: [
        { "<>": "td", html: "${name}" },
        { "<>": "td", html: "${version}" },
        {
          "<>": "td",
          html: (obj) => {
            return json2html.toText(Object.keys(obj)[0]);
          },
        },
        {
          "<>": "td",
          html: (obj) => {
            return json2html.toText(Object.values(obj)[0]);
          },
        },
        { "<>": "td", html: "±" },
        {
          "<>": "td",
          html: (obj) => {
            return json2html.toText(Object.values(obj)[1]);
          },
        },
      ],
    },
    {
      "<>": "tr",
      html: [
        { "<>": "td", html: "" },
        { "<>": "td", html: "" },
        {
          "<>": "td",
          html: (obj) => {
            return json2html.toText(Object.keys(obj)[2]);
          },
        },
        {
          "<>": "td",
          html: (obj) => {
            return json2html.toText(Object.values(obj)[2]);
          },
        },
        { "<>": "td", html: "±" },
        {
          "<>": "td",
          html: (obj) => {
            return json2html.toText(Object.values(obj)[3]);
          },
        },
      ],
    },
  ],
};

if (fileName) {
  let rawdata = fs.readFileSync(fileName);
  let parsedData = JSON.parse(rawdata);

  writeHtmlFromScoresJson(parsedData, `output/${fileName}_output.html`);
}

function writeHtmlFromScoresJson(jsonFile, htmlTableFile) {
  let data = jsonFile[0];

  const formattedData = Object.keys(data.versions).map((item) => {
    return { ...data.results[item], name: item, version: data.versions[item] };
  });

  let model_config = json2html.transform(data.config, template_model_config);
  let table_header = json2html.transform(data, template_table_header);
  let table_body = json2html.transform(formattedData, template_table_body);

  let header =
    "<!DOCTYPE html>" +
    '<html lang="en">\n' +
    "<head><title>Model performance</title><link href='../styles.css' rel='stylesheet'></head>";
  let body =
    '<div class="content"><h1>LM performance table</h1><br /><div class="model-config">' +
    model_config +
    '</div><table class="output-table" id="my_table">\n<thead>' +
    table_header +
    "\n</thead>\n<tbody>\n" +
    table_body +
    "\n</tbody>\n</table></div>";
  body = "<body>" + body + "</body>";

  let html = header + body + "</html>";

  fs.writeFile(htmlTableFile, html, (err) => {
    if (err) throw err;
  });
}
