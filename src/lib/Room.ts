import { Client, User, RoomMessage, EventDispatcher, Utils } from '../Index'

export class Room {
	private _name : string
	private _client : Client
	private _users : Array<User>

	private _onMessage : EventDispatcher<Room, RoomMessage>
	private _onUserJoin : EventDispatcher<Room, User>
	private _onUserLeave : EventDispatcher<Room, User>

	private _voices : Array<User>
	private _drivers : Array<User>
	private _moderators : Array<User>
	private _roomOwners : Array<User>
	private _administrators : Array<User>
	
	constructor(name : string, client : Client) {
		this._name = name
		this._client = client
		this._users = new Array<User>()
		this._onMessage = new EventDispatcher<Room, RoomMessage>()
		this._onUserJoin = new EventDispatcher<Room, User>()
		this._onUserLeave = new EventDispatcher<Room, User>()

		this._voices = new Array<User>()
		this._drivers = new Array<User>()
		this._moderators = new Array<User>()
		this._roomOwners = new Array<User>()
		this._administrators = new Array<User>()
	}

	public async send(message : string) : Promise<void> {
		return this._client.send(`${this._name}|${message}`)
	}

	public assignAuth(user : User, roomDisplayname : string) : void {
		const outcomes = []
		if (!this.isVoice(user) && Utils.isVoice(roomDisplayname)) {
			this._voices.push(user)
			outcomes.push('voice')
		}
		
		if (!this.isDriver(user) && Utils.isDriver(roomDisplayname)) {
			this._drivers.push(user)
			outcomes.push('driver')
		}

		if (!this.isModerator(user) && Utils.isModerator(roomDisplayname)) {
			this._moderators.push(user)
			outcomes.push('moderator')
		}

		if (!this.isRoomOwner(user) && Utils.isRoomOwner(roomDisplayname)) {
			this._roomOwners.push(user)
			outcomes.push('roomowner')
		}

		if (!this.isAdministrator(user) && Utils.isAdministrator(roomDisplayname)) {
			this._administrators.push(user)
			outcomes.push('administrator')
		}

		if (outcomes.length > 0)
			this._client.debug(`${user.displayName} was assigned ${outcomes.join(', ')} in ${this._name}`)
	}

	public join(user : User) : void {
		this._users.push(user)
		this._onUserJoin.dispatch(this, user)
	}

	public leave(user : User) : void {
		const index = this._users.indexOf(user)
		if (index > -1)
			this._users.splice(index, 1)

		this._onUserLeave.dispatch(this, user)
	}

	public handleMessage(message : RoomMessage) : void {
		this._onMessage.dispatch(this, message)
	}

	public isVoice(user : User) : boolean {
		return this._voices.includes(user)
	}

	public isDriver(user : User) : boolean {
		return this._drivers.includes(user)
	}

	public isModerator(user : User) : boolean {
		return this._moderators.includes(user)
	}

	public isRoomOwner(user : User) : boolean {
		return this._roomOwners.includes(user)
	}

	public isAdministrator(user : User) : boolean {
		return this._administrators.includes(user)
	}

	public async createTournament(name : string, format : string = 'gen8ou', type : string = '2 elimination', playerCap : number = 32,
		autostart : number = 5, autodq : number = 1, scouting : boolean = true, forceTimer : boolean = true) : Promise<void> {
		if (type.endsWith('elimination')) {
			const rounds = type.split(' ')[0]
			await this.send(`/tour new ${format}, 'elimination', ${rounds}`)
		} else {
			await this.send(`/tour new ${format}, ${type}`)
		}

		if (name) 
			await this.send(`/tour name ${name}`)

		await this.send(`/tour cap ${playerCap}`)
		await this.send(`/tour autostart ${autostart}`)
		await this.send(`/tour autodq ${autodq}`)
		await this.send(`/tour scouting ${scouting ? 'allow' : 'disallow'}`)
		return this.send(`/tour forcetimer ${forceTimer ? 'on' : 'off'}`)
	}

	public get name() : string {
		return this._name
	}

	public get onMessage() {
		return this._onMessage.asEvent()
	}

	public get onUserJoin() {
		return this._onUserJoin.asEvent()
	}

	public get onUserLeave() {
		return this._onUserLeave.asEvent()
	}
}
