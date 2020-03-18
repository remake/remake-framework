import { $ } from '../queryjs';

export default function () {
  $.on("change", "input[type='file'][data-i]", function (event) {
    console.log(23, arguments);
  });
}