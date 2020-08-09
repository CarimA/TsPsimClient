import { User, Client, Utils } from '../Index'

export class UserCollection {
	private _client : Client
	private _users : Array<User>

	constructor(client : Client) {
		this._users = new Array<User>()
		this._client = client
	}

	public find(username : string) : User {
		const key = Utils.sanitizeUsername(username)
		let user = this.get(key)

		if (!user) {
			this._client.debug(`Could not find ${username} with key ${key}, creating new user`)
			const newLength = this._users.push(new User(username, this._client))
			user = this._users[newLength - 1]
		}

		return user
	}

	public get(username : string) : User | undefined {
		return this._users.find(user => user.username === username)
	}
}