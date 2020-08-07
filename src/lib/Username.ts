export class Username {
	private _displayname : string
	private _username : string

	constructor(username : string) {
		this._displayname = username.substr(1).trim()
		this._username = this._displayname.toLowerCase()
	}

	public get displayname() : string {
		return this._displayname
	}

	public get username() : string {
		return this._username
	}
}
