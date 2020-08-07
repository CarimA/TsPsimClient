import { Message, Room, User } from '../Index'

export class RoomMessage extends Message {
	private _room : Room
	private _isIntro : boolean

	constructor(user : User, text : string, room : Room, isIntro : boolean) {
		super(user, text)
		this._room = room
		this._isIntro = isIntro
	}

	public async reply(message : string) : Promise<void> {
		return this._room.send(message)
	}

	public get user() : User {
		return this._user
	}

	public get text() : string {
		return this._text
	}

	public get room() : Room {
		return this._room
	}

	public get isIntro() : boolean {
		return this._isIntro
	}
}
