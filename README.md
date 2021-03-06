# TsPsimClient
 
This is a TypeScript library that handles connection logic to Pokemon Showdown servers and wraps around some of the low-level parts of interacting with Psim from a bot. 

## Features

- Promise-based messages
- Automatically synchronized room and user data (including alt-tracking)
- yeah, that's about it for now, but hey it's not JavaScript

## Installation

TsPsimClient is available on npm, simply open up your terminal, point to your working directory and enter:

`npm install ts-psim-client --save`

If it's already in your package.json, just run `npm install`. If you have it installed and want to update, run `npm update ts-psim-client`.

## Version History

### Version 1.1.5
 - Added `Client#onPrivateMessage`
 - Various fixes

### Version 1.1.2

 - Added `Client#getUser`
 - Added `Client#getRoom`
 - Added a rules parameter to `Room#createTournament`

### Version 1.1.1

 - Fixed an issue with the message queue still processing while not connected to Pokemon Showdown
 - Fixed an issue with `Room#createTournament` not allowing it to set double/triple/etc-elimination tournaments.
 - Added `Utils.delay(number)`, example use: `await Utils.delay(1000)` to halt async method for 1 second

### Version 1.1.0

 - Fixed timeout/autoReconnect being used in the wrong places
 - Changed auth handling to be per-message rather than per-user
	- Added `Message#rank()`
 - Rooms now tracks users who have auth, even after they change display names
	- Added `Room#isVoice(User)`, `Room#isDriver(User)`, `Room#isModerator(User)`, `Room#isRoomOwner(User)` and `Room#isAdministrator(User)` which can check the user across renames. `Utils.isVoice(string)`, etc. can still be used to check individual message auth
 - Changed UserCollection to index users by a sanitized username without auth symbol, keeping user state across rooms
 - Added type signatures for the remainder of the functions (`() : void`, etc)
 - Cleanup removing unused imports

### Version 1.0.0

 - Initial Library

## Example Setup

```typescript
import * as config from './Config'
import { Client, Room, User, RoomMessage, Utils } from 'ts-psim-client'

const bot = new Client({})

bot.onReady.subscribe((client : Client) => {
	client.login(config.PsUsername, config.PsPassword, true)
})

bot.onLogin.subscribe((client : Client) => {
	client.join('botdevelopment')
	client.setAvatar('supernerd')
})

bot.onRoomJoin.subscribe((client : Client, room : Room) => {
	room.onUserJoin.subscribe((room : Room, user : User) => {
		if (Utils.isVoice(user)) {
			room.send(`Hello ${user.username}!`)
		}
	})

	room.onUserLeave.subscribe((room : Room, user : User) => {
		if (Utils.isVoice(user)) {
			room.send(`Goodbye ${user.username}!`)
		}
	})

	room.onMessage.subscribe((room : Room, message : RoomMessage) => {
		if (!message.isIntro && message.text.trim() === '(tada)') {
			message.reply('🎉🎉🎉')
		}
	})
})

bot.connect()
```

## Configuration

There are some configuration options that can be specified in the `Client` constructor:

```typescript
{
	server : string // The server you'll connect to. Defaults to 'sim.smogon.com'
	port : number // The port you'll connect to. Defaults to 8000
	timeout : number // The time (in milliseconds) you'll attempt to reconnect in if the connection is lost. Defaults to 30 seconds
	loginServer : string // The login server. defaults to 'https://play.pokemonshowdown.com/~~showdown/action.php'
	autoReconnect : number // The time (in milliseconds) you'll attempt to login again if your login is rejected for a non-credential related reason. defaults to 30 seconds
	debug : boolean // Logs messages from the library to the console. defaults to false
}
```

## Events

(todo)

## Credits

- [PartMan7](https://github.com/PartMan7) for the [PS-Client](https://github.com/PartMan7/PS-Client) library, of which some of this library's structure and design is inspired from (and in a few cases, a bit of connection logic directly ripped out)

## What's Next?

Not sure. Features will be developed on an as-needed basis for [CheirBot Redux](https://github.com/CarimA/CheirBotRedux). If you have any bugs or ideas, feel free to stick it in Issues or submit something of your own.