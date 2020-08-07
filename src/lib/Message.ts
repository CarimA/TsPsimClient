import { User } from '../Index'

export class Message {
	protected _user : User
	protected _text : string

	constructor(user : User, text : string) {
		this._user = user
		this._text = text
	}

	public async reply(message : string) : Promise<void> {
		
	}
}