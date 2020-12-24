To Run:
- Need to pass in location of .env
- Ex: node -r dotenv/config app.js dotenv_config_path=./secrets/.env


Getting set up with gmail auth tokens

https://console.cloud.google.com/apis
- create a project
- get client id and secret
- leave scope empty

https://developers.google.com/oauthplayground
- add client id and secret to the settings
- add https://mail.google.com/ as scope
- copy refresh token
- redirect uri is oauthplayground

In the 'secrets' folder, we expect a 'credentials.json' and a 'token.json'

- in credentials we need (client_id, client_secret and redirect_uris)
- in token we just care about refresh_token
- access token is grabbed on the fly from the refresh token

Taken from this tutorial

Sending Emails with Node.js Using SMTP, Gmail, and OAuth2
- https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1

Used this verbatim to finally get things working: 
- https://www.youtube.com/watch?v=-rcRf7yswfM