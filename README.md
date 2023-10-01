<p align="center">
  <a href="https://storybook.js.org/">
    <img src="https://user-images.githubusercontent.com/364330/98124113-bc603180-1e80-11eb-882e-e2246940c7a4.png" alt="Remake" width="400" />
  </a>
</p>

<p align="center">Build full-stack web apps with only HTML and CSS</p>

<br/>

<p align="center">
  <a href="https://github.com/remake/remake-cli/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/remake/remake-cli" alt="License" />
  </a>
  <a href="https://discord.gg/FB3gNxw">
    <img src="https://img.shields.io/badge/discord-join-7289DA.svg?logo=discord&longCache=true&style=flat" alt="Discord Channel" />
  </a>
  <a href="https://github.com/sponsors/remake">
    <img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&link=<url>" alt="Sponsor" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=remaketheweb">
    <img src="https://badgen.net/twitter/follow/remaketheweb?icon=twitter&label=%40remake" alt="Remake Twitter" />
  </a>
</p>

Remake is an open-source framework for creating editable web apps with just a few custom HTML attributes.

💎 Simple, easy-to-learn syntax<br>
👨‍👩‍👧‍👦 User accounts & database built-in<br>
✍️ Inline editing & uploads for all users<br>
🚫 **No backend coding!** (unless you want to 👩‍💻)<br>

<b><a href="https://docs.remaketheweb.com/">👉 Get started with the full docs! 📖</a></b>

## 🤔 Why Remake?

> "Remake gives me an entirely new feeling of comfort around coding. It's what I imagine web development should be." — [Arav Narula](https://twitter.com/HeyArav)

![Diagram of how Remake works](https://user-images.githubusercontent.com/364330/98125645-b5d2b980-1e82-11eb-909f-527bf0ff224e.png)

Remake does what most frameworks do in 100 lines of code in 1 line of HTML.

```html
<h1 object key:text="@innerText" edit:text>{{text}}</h1>
```

This 👆 is a full app that users can login to. Each user can edit & share their own copy of this site! 📰 📰 📰

## 👩‍🎨 Let people use something you designed — *right away.*

### Remake is

<details>
  <summary><b>🏭 Full-stack apps with just front-end code</b></summary>
  
  Remake takes care of the rest: user accounts, persistent data, instant deployments, and routing. Each user gets their own account and data.
</details>

<details>
  <summary><b>🛩 Real apps — not just prototypes</b></summary>
  
  Remake feels like prototyping because it was designed to. The goal was to make web development feel like using a single template and a single JSON file.
</details>

<details>
  <summary><b>🎨 100% control of your design</b></summary>
  
  Remake is open source. You own the code. There's no platform lock-in and you have 100% control over your app's design.
</details>

<details>
  <summary><b>🌍 Secure, scalable, and fast</b></summary>
  
  Highly secure authentication. And server-rendered, so your pages load quickly even on low-power devices and slow connections.
</details>

## 👩‍🏫 Get started

### 1. Install [Node.js (12.16+)](https://nodejs.org/)

### 2. Create a project using the Remake CLI

```sh
npx remake create my-app
```

### 3. Run the project

```sh
cd my-app
npm run dev
```

You now have an app running at `http://localhost:3000`. Your app's code is in the `/app` directory and your database is in the `/app/data` directory.

<b><a href="https://recipes.remaketheweb.com/">👉 Dive into the recipes 🤿</a></b>

## 👨‍🏭 What can you build?

Remake is **perfect for building page builders,** where each of your users can edit their own content.

- **[Todo app](https://docs.remaketheweb.com/a-simple-example-app/)** (Build time: 3 min)
- **[Trello clone](https://kanban.remakeapps.com/)** (Build time: 27 min)
- **[Resume builder](https://resume-builder.remakeapps.com/)** (Build time: 42 min)
- [**Reading list builder**](https://shelfpageapp.remakeapps.com/) (Build time: 31 min)

<b><a href="https://ideas.remaketheweb.com/">👉 Other project ideas 👩‍💻</a></b>

![Trello clone built with Remake](https://user-images.githubusercontent.com/364330/98126081-2f6aa780-1e83-11eb-8367-e582daaf8997.png)

<p align="center">⬆️ A Trello clone app built in Remake</p>

## 💾 Tech Stack

✨ Built on `Express.js`<br> ✨ Uses `Passport.js` and `Bcrypt` to secure user accounts<br> ✨ `Handlebars` renders templates server-side<br> ✨ One-click file uploads with `express-fileupload`<br> ✨ One line instant deploy with `remake deploy`<br> ✨ Syncs client state and server state automatically<br> ✨ Built-in inline edit popovers<br>

## 🚀 Remake’s Mission

⚖️ Remake's goal is to equalize power on the internet.

A few companies own the platforms the rest of us publish on — but owning our own platform is usually out of the question. Remake lets you build your own platform with very little effort — using just HTML & CSS.

<b><a href="https://discord.gg/FB3gNxw">👉 Join our Discord community 💬</a></b>

## 👩‍💻 Contributing

Remake is open-source and contributions are desired 😍

If you identify with Remake's mission, we'd be delighted to have you:

- Test & report bugs
- Suggest features / fix issues
- Improve the documentation
- Or [just email me!](mailto:david@remaketheweb.com)

<b><a href="https://github.com/remake/remake-cli/issues/new?assignees=&labels=&template=feature_request.md&title=My%20first%20issue">👉 Create your first issue</a></b>

## 👩‍💻 Our Contributors

- [Andrew de Jong](https://gitlab.com/android4682)
- [Grady O'Connell](https://github.com/flipcoder)
- [Alyssa X](https://alyssax.com/)
- [Painatalman](https://github.com/Painatalman)
- [Joe Masilotti](https://masilotti.com/)
- [Catalin Tudorache](https://charlietango.co/)

## 🧪 Cross-Browser Testing

This project is tested with [BrowserStack](https://www.browserstack.com/).