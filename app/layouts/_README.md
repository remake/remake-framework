Start fresh with an empty layout:

```
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your App</title>
  <link rel="stylesheet" type="text/css" href="/css/remake.css">
  <link rel="stylesheet" type="text/css" href="/css/main.css">
</head>
<body>
  {{> yield }}
  {{#if isPageAuthor}}
    {{!-- Prevent loading the Remake framework if the page isn't editable --}}
    <script src="/js/remake-init.js"></script>
  {{/if}}
  <script src="/js/main.js"></script>
</body>
</html>
```