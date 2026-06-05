Install deps: 
> npm install


Get a discord token:\
https://discord.com/developers/applications\
Create a new application, name it\
In the left-hand menu, click on the Bot tab.\
Under the Privileged Gateway Intents section, toggle on Presence Intent, Server Members Intent, and Message Content Intent (message permissions).\
Scroll up to the Build-A-Bot section and click Reset Token\
put it in the next step


Create a .env file:\
TOKEN=<Token From Discord>


To invite the bot to a server:\
Go to the OAuth2 tab in the left menu, then select URL Generator.\
Under Scopes, check the bot box.\
Under Bot Permissions, give it View Channels, Send Messages, Manage Messages.\
Copy the generated URL at the bottom of the page, paste it into a new web browser tab, select server.