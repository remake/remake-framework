const test = require("ava");
import * as Remake from "./_remake/client-side";

test("foo", t => {
  t.pass();
});

test("bar", async t => {
  t.deepEqual({ a: 1 }, { a: 1 });
});
