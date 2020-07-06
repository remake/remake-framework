# Pages

Pages are special in Remake. Remake doesn't want you to think about routing, so it makes routing to pages as flexible as possible.

This means that a plain old page named `hello-world.hbs` will match ALL of the following routes:

* `https://your-app.com/hello-world`
* `https://your-app.com/john-doe/hello-world`
* `https://your-app.com/john-doe/hello-world/4567`

This means you don't have to nest pages in a particular directory structure or add special configuration to get them working.

All you pages can just be right inside the `/pages` directory and they'll do they're best to render at the appropriate time.

# Special pages

There are a few special pages you should know about:

* `index.hbs` will render when the root of your app is loaded up (e.g. `https://your-app.com/`)
* `app-index.hbs` will render when a user's username -- and no other parameters -- are in the url (e.g. `https://your-app.com/jane-doe`, but NOT `https://your-app.com/jane-doe/some-page-name`)
* All the templates in `/pages/user` are for rendering special account-level pages (e.g. the sign up page, the login page, the forgot password page, and the reset password page). They have special names that can't be changed, but you have complete control over their HTML and CSS.

# Layouts

In order to use a layout other than the default one, add the following to the top of a page template:

```
{{ layout "layout-name" }}
```




