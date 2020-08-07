import { User } from '../Index'

export class Message {
	protected _user : User
	protected _text : string
	protected _rank : string

	constructor(rank : string, user : User, text : string) {
		this._rank = rank
		this._user = user
		this._text = text
	}

	public async reply(message : string) : Promise<void> {
		
	}

	public get rank() : string {
		return this._rank
	}

	public get user() : User {
		return this._user
	}

	public get text() : string {
		return this._text
	}
}