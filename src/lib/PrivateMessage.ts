import { Message, User } from '../Index'

export class PrivateMessage extends Message {
	constructor(user : User, text : string) {
		super(user, text)
	}

	public async reply(message : string) : Promise<void> {
		return this._user.send(message)
	}

	public get user() : User {
		return this._user
	}

	public get text() : string {
		return this._text
	}
}