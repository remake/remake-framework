About the files in this directory:

# global-app-data.json

Data in this file will be accessible from every layout, page, and partial template for every user.

Use it to specify your app's name, navigation links, or any other static data that's globally accessible for all users.

# user-starting-data.json

Data in this file is the starting data that every user will receive after signing up.

If a user signs up and you change this file afterwards, they won't get the updated data.

To get a user's current data, look in the directory `/_remake-data/user-app-data` and find the JSON file with the user's username.