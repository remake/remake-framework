Hi, welcome to Remake!

The current directory ("app") is where your Remake app will live.

All of the logic for the starter Trello clone app is in the file named "username.hbs" in the "/app/pages/" directory.

To build your own app from scratch:
- In `/app/assets`:
  - Keep `/app/assets/js/remake-init.js`
  - Keep `/app/assets/sass/remake.sass`
  - Keep `/app/assets/sass/main.sass`, but remove its contents
  - You can safely remove everything else
- In `/app/layouts`:
  - Replace the contents of `default.hbs` with the empty layout in the `_README.md` file
- In `/app/pages`:
  - Keep `index.hbs`, but remove its contents (this is the static front page of your app)
  - Keep `username.hbs`, but remove its contents (this is the dynamic part of your app, accessible at the url `/{{username}}`)

In the future the above will be automated. 

Thank you for trying out Remake! 

Reach out if you have any questions: david@remaketheweb.com