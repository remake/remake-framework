# Layout templates

* Every template in Remake uses Handlebars (https://handlebarsjs.com/)
* Every template in Remake gets access to the same template variables (https://docs.remaketheweb.com/templating/), as well as any data that you define in `/app/data/global-app-data.json`
  * ➡️ There are a lot of great things in this documentation page if you're just getting started with Remake! 👆🧐


# Tip

If you create a layout template, make sure you only load Remake's front-end library if the current user is the page's author.

```
{{#if isPageAuthor}}
  {{!-- Prevent loading the Remake framework if the page isn't editable --}}
  <script src="/js/remake-init.js"></script>
{{/if}}
```

This isn't strictly necessary, but will save your users from having to load the Remake library when it's unnecessary.



