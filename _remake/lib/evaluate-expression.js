const evalMemo = new WeakMap();

export function evalExpression(expression, replacements) {
  if (evalMemo.has(expression)) return evalMemo.get(expression);
  Object.entries(replacements).forEach(([replacementKey, replacementValue]) => {
    expression = expression.replace(replacementKey, replacementValue);
  });
  if (/^[\n\s]*if.*\(.*\)/.test(expression) || /^(let|const)/.test(expression)) {
    expression = `(() => { ${expression} })()`;
  }
  const ret = new (Object.getPrototypeOf(async function () {}).constructor)(
    [],
    `return ${expression}`
  );
  evalMemo.set(expression, ret);
  return res;
}
