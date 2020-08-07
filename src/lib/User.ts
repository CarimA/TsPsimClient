import { Client, Room } from '../Index'

export class User {
	private _name : string
	private _client : Client
	private _rooms : Array<Room>
	private _oldNames : Array<string>

	constructor(name : string, client : Client) {
		this._name = name
		this._client = client
		this._rooms = new Array<Room>()
		this._oldNames = new Array<string>()
	}

	public rename(newName : string) {
		this._oldNames.push(this._name)
		this._name = newName
	}

	public join(room : Room) {
		this._rooms.push(room)
		room.join(this)
	}

	public leave(room : Room) {
		const index = this._rooms.indexOf(room)
		if (index > -1)
			this._rooms.splice(index, 1)

		room.leave(this)
	}

	public async send(message : string) : Promise<void> {
		return this._client.send(`|/w ${this.username}, ${message}`)
	}

	public get username() {
		return this._name.substr(1).trim().toLowerCase()
	}

	public get rank() {
		return this._name.substr(0, 1)
	}

	public get displayName() {
		return this._name.trim()
	}

	public get roomCount() {
		return this._rooms.length
	}
}