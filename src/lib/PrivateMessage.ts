import { Message, User } from '../Index'

export class PrivateMessage extends Message {
	constructor(rank : string, user : User, text : string) {
		super(rank, user, text)
	}

	public async reply(message : string) : Promise<void> {
		return this._user.send(message)
	}
}