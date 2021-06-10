const test = require("ava");
import * as Remake from "./_remake/client-side";
import { JSDOM } from "jsdom";
const dom = new JSDOM(`<html>
  <body>
    <button class="button" aria-expanded="true">Im A Button</button>
  </body>
</html>`);
const body = dom.window.document.body;

test("simple object with key", async t => {
  body.innerHTML = `<div object key:message="Hello, world!"></div>`;
  t.deepEqual(Remake.getSaveData(body), { message: "Hello, world!" });
});

test("nested object with key", async t => {
  body.innerHTML = `<div object key="mailbox"><div object key:message="Hello, world!"></div></div>`;
  t.deepEqual(Remake.getSaveData(body), { mailbox: { message: "Hello, world!" } });
});
