import { User, Client, Room } from '../Index'

export class UserCollection {
	private _client : Client
	private _users : {[key: string]: User}

	constructor(client : Client) {
		this._users = {}
		this._client = client
	}

	public find(username : string) : User {
		username = username.trim()
		if (!this.get(username))
			this._users[username] = new User(username, this._client)

		return this.get(username)
	}

	public remove(user : User) : boolean {
		if (this._users[user.username]) {
			delete this._users[user.username]
			return true
		}

		return false
	}

	private get(username : string) : User {
		return this._users[username]
	}
}