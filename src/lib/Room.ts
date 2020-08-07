import { Client, User, RoomMessage, EventDispatcher } from '../Index'

export class Room {
	private _name : string
	private _client : Client
	private _users : Array<User>

	private _onMessage : EventDispatcher<Room, RoomMessage>
	private _onUserJoin : EventDispatcher<Room, User>
	private _onUserLeave : EventDispatcher<Room, User>
	
	constructor(name : string, client : Client) {
		this._name = name
		this._client = client
		this._users = new Array<User>()
		this._onMessage = new EventDispatcher<Room, RoomMessage>()
		this._onUserJoin = new EventDispatcher<Room, User>()
		this._onUserLeave = new EventDispatcher<Room, User>()
	}

	public async send(message : string) : Promise<void> {
		return this._client.send(`${this._name}|${message}`)
	}

	public join(user : User) {
		this._users.push(user)
		this._onUserJoin.dispatch(this, user)
	}

	public leave(user : User) {
		const index = this._users.indexOf(user)
		if (index > -1)
			this._users.splice(index, 1)

		this._onUserLeave.dispatch(this, user)
	}

	public handleMessage(message : RoomMessage) {
		this._onMessage.dispatch(this, message)
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

	public get name() {
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
