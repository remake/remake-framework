# Partials

Any template files put into this directory can be accessed from templates in the `/pages` directory.


# Adding a partial to a page template

In `app-index.hbs`, for example:

```
{{> say-hello}}
```


# The partial file

In order to include the above partial, you'd need to create `/app/partials/say-hello.hbs` and add the following code:

```
<div>Hello {{currentUser.details.username}}</div>
```

Your partial file will have access to all the template variables from the page it's included in.


# Handlebars docs

To learn more, read about partials in the Handlebars.js docs: https://handlebarsjs.com/guide/partials.html

