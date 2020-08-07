import { Client, Room, Username, Utils } from '../Index'
import { v4 as uuidv4 } from 'uuid';

export class User {
	private _Id : string
	private _name : Username
	private _client : Client
	private _rooms : Array<Room>
	private _oldNames : Array<Username>

	constructor(name : string, client : Client) {
		this._Id = uuidv4();
		this._name = new Username(name)
		this._client = client
		this._rooms = new Array<Room>()
		this._oldNames = new Array<Username>()
	}

	public rename(newName : string) : void {
		this._client.debug(`Renaming ${this._name.displayname} to ${newName}`)
		this._oldNames.push(this._name)
		this._name = new Username(newName)
	}

	public join(room : Room) : void {
		this._client.debug(`${this._name.displayname} joined ${room.name}`)
		this._rooms.push(room)
		room.join(this)
	}

	public leave(room : Room) : void {
		this._client.debug(`${this._name.displayname} left ${room.name}`)
		const index = this._rooms.indexOf(room)
		if (index > -1)
			this._rooms.splice(index, 1)

		room.leave(this)
	}

	public async send(message : string) : Promise<void> {
		return this._client.send(`|/w ${this.username}, ${message}`)
	}

	public get Id() : string {
		return this._Id
	}

	public get username() : string {
		return this._name.username
	}

	public get displayName() : string {
		return this._name.displayname
	}

	public get roomCount() : number {
		return this._rooms.length
	}

	public get alts() : Array<Username> {
		return this._oldNames
	}
}