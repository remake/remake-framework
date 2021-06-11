const test = require("ava");
import * as Remake from "./_remake/client-side";
import { JSDOM } from "jsdom";
const dom = new JSDOM(`<html><body></body></html>`);
const body = dom.window.document.body;
// Make elem.innerText work in JSDOM
// From: https://github.com/jsdom/jsdom/issues/1245
global.Element = dom.window.Element;
Object.defineProperty(global.Element.prototype, "innerText", {
  get() {
    return this.textContent;
  },
});

test("simple object with key", async t => {
  body.innerHTML = `<div object key:message="Hello, world!"></div>`;
  t.deepEqual(Remake.getSaveData(body), { message: "Hello, world!" });
});

test("nested object with key", async t => {
  body.innerHTML = `<div object key="mailbox">
    <div object key:message="Hello, world!"></div>
  </div>`;
  t.deepEqual(Remake.getSaveData(body), { mailbox: { message: "Hello, world!" } });
});

test("complex nested data", async t => {
  body.innerHTML = `<div object key=things>
    <div array key=items>
      <div object key=item>
        <div array key=todos>
          <div object key:text="@innerText">Hello, world!</div>
        </div>
      </div>
    </div>
  </div>`;
  t.deepEqual(Remake.getSaveData(body), {
    things: {
      items: [
        {
          item: {
            todos: [{ text: "Hello, world!" }],
          },
        },
      ],
    },
  });
});
