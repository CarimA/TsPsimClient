import WebSocket from 'ws';
import * as url from 'url'
import * as https from 'https'
import { Room, User, QueuedMessage, RoomMessage, PrivateMessage, UserCollection, RoomCollection, Utils, 
	SimpleEventDispatcher, EventDispatcher} from '../Index'

export class Client {
	private _socket? : WebSocket

	private _server : string
	private _port : number
	private _timeout : number
	private _loginServer : string
	private _deconstructedUrl : url.UrlWithStringQuery
	private _autoReconnect : number
	private _challstr : any
	private _isLoggedIn : boolean
	private _queuedMessages : Array<QueuedMessage>
	private _messageTypes : {[key: string]: (room: Room, isIntro: boolean, ...args: string[]) => void}

	private _rooms : RoomCollection
	private _users : UserCollection

	private _debug : any

	private _onConnect : SimpleEventDispatcher<Client> = new SimpleEventDispatcher<Client>()
	private _onReady : SimpleEventDispatcher<Client> = new SimpleEventDispatcher<Client>()
	private _onLogin : SimpleEventDispatcher<Client> = new SimpleEventDispatcher<Client>()
	private _onDisconnect : SimpleEventDispatcher<Client> = new SimpleEventDispatcher<Client>()
	private _onRoomJoin : EventDispatcher<Client, Room> = new EventDispatcher<Client, Room>()
	private _onRoomLeave : EventDispatcher<Client, Room> = new EventDispatcher<Client, Room>()
	private _onPrivateMessage : EventDispatcher<User, PrivateMessage> = new EventDispatcher<User, PrivateMessage>()

	constructor(opts : any) {
		this._server = opts.server || 'sim.smogon.com'
		this._port = opts.port || 8000
		this._timeout = opts.timeout || (30 * 1000)
		this._loginServer = opts.loginServer || "https://play.pokemonshowdown.com/~~showdown/action.php"
		this._deconstructedUrl = url.parse(this._loginServer)
		this._autoReconnect = opts.autoReconnect || (30 * 1000)
		this._isLoggedIn = false
		this._queuedMessages = new Array<QueuedMessage>()
		this._debug = opts.debug ? console.log : (... _ : any[]) => {}
		this._rooms = new RoomCollection(this)
		this._users = new UserCollection(this)
		this.handleQueue()
		this._messageTypes = {}
		this.createMessageTypes()
	}

	public connect(isRetrying : boolean = false) : void {
		if (isRetrying)
			this._debug('Retrying connection...')

		if (this.isConnected())
			this._debug('Already connected to Pokemon Showdown')
		
		const link = `ws://${this._server}:${this._port}/showdown/${100 + ~~(Math.random() * 900)}/${Array.from({ length: 8 }).map(() => 'abcdefghijklmnopqrstuvwxyz0123456789_'[~~(Math.random() * 37)]).join('')}/websocket`
		
		this._socket = new WebSocket(link)
		this._rooms = new RoomCollection(this)
		this._users = new UserCollection(this)

		this._socket.on('open', () => {
			this._onConnect.dispatch(this)
			this._debug(`Connected to ${this._server}`)
		})

		this._socket.on('message', (data : WebSocket.Data) => {
			this.handleData(data.toString())
		})

		this._socket.on('close', (socket : WebSocket, code : number, reason : string)  => {
			this._onDisconnect.dispatch(this)
			this._debug(`Connection closed: ${code} - ${reason}`)
			this.retryConnection()
		})
		
		this._socket.on('error', (socket : WebSocket, err : Error) => {
			this._onDisconnect.dispatch(this)
			this._debug(`Connection error: ${err.message}`)
			this.retryConnection()
		})
	}

	public disconnect() : void {
		this._socket?.readyState
		this._socket?.close()
	}

	public isConnected() : boolean {
		return (this._socket?.readyState === WebSocket.OPEN)
	}

	public isLoggedIn() : boolean {
		return (this.isConnected 
			&& this._isLoggedIn === true)
	}

	private retryConnection() : void {
		this._socket?.close()
		if (this._timeout) {
			this._debug(`Retrying connection in ${this._timeout / 1000} seconds`)
			setTimeout(this.connect.bind(this), this._timeout, true)
		}
	}

	private handleData(message : string) : void {
		if (message.substr(0, 1) !== 'a')
			return

		const data = JSON.parse(message.substr(1))
		if (data instanceof Array) {
			for (let index = 0; index < data.length; index++) {
				this.handleMessage(data[index])	
			}
		} else {
			this.handleMessage(data)
		}
	}

	private handleMessage(message : string) : void {
		if (!message)
			return
		
		if (message.indexOf('\n') > -1) {
			const split = message.split('\n')
			let room = 'lobby'
			let start = 0

			if (split[0].charAt(0) === '>') {
				start = 1
				room = split[0].substr(1)
				if (room === '')
					room = 'lobby'
			}

			for (let index = start; index < split.length; index++) {
				const firstItem = split[index].split('|')[1]
				if (firstItem && firstItem === 'init') {
					for (let j = index; j < split.length; j++) {
						this.handleLine(room, split[j], true)
						index = j
					}
				} else {
					this.handleLine(room, split[index])
				}
			}
		} else {
			this.handleLine('lobby', message)
		}
	}

	private handleLine(room : string, message : string, isIntro : boolean = false) : void {
		const args = message.split('|')
		if (args.length === 1)
			return

		const roomInstance = this._rooms.find(room)
		const type = args[1].toLowerCase()
		const messageType = this._messageTypes[type]
		if (messageType)
			messageType(roomInstance, isIntro, ...args.slice(2))
	}

	private createMessageTypes() : void {
		this._messageTypes = {
			'init': this.handleInit.bind(this),
			'deinit': this.handleDeinit.bind(this),
			'challstr': this.handleChallstr.bind(this),
			'updateuser': this.handleUpdateUser.bind(this),
			'chat': this.handleChat.bind(this),
			'c': this.handleChat.bind(this),
			'c:': this.handleTimestampedChat.bind(this),
			'pm': this.handlePrivateMessage.bind(this),
			'join': this.handleJoin.bind(this),
			'j': this.handleJoin.bind(this),
			'leave': this.handleLeave.bind(this),
			'l': this.handleLeave.bind(this),
			'name': this.handleRename.bind(this),
			'n': this.handleRename.bind(this)
		}
	}

	private handleInit(room : Room, isIntro : boolean, ...args : Array<string>) : void { 
		this._onRoomJoin.dispatch(this, room)
	}

	private handleDeinit(room : Room, isIntro : boolean, ...args : Array<string>) : void { 
		this._onRoomLeave.dispatch(this, room)
		this._rooms.remove(room)
	}

	private handleChallstr(room : Room, isIntro : boolean, ...args : Array<string>) : void {
		this._challstr = {
			id: args[0],
			str: args[1]
		}
		this._onReady.dispatch(this)
	}

	private handleUpdateUser(room : Room, isIntro : boolean, ...args : Array<string>) : void {
		if (!args[0].startsWith(' Guest')) {
			this._debug(`Successfully logged in as ${args[0].substr(1)}`)
			this._isLoggedIn = true
			this._onLogin.dispatch(this)
		}
	}

	private handleChat(room : Room, isIntro : boolean, ...args : Array<string>) : void {
		if (isIntro)
			return;

		const username = args[0]
		const user = this._users.find(username)
		const text = args.slice(1).join('|')
		const message = new RoomMessage(Utils.getRank(username), user, text, room, isIntro)
		room.handleMessage(message)
		room.assignAuth(user, username)
	}

	private handleTimestampedChat(room : Room, isIntro : boolean, ...args : Array<string>) : void {
		const timestamp = args[0]
		const username = args[1]
		const user = this._users.find(username)
		const text = args.slice(2).join('|')
		const message = new RoomMessage(Utils.getRank(username), user, text, room, isIntro)
		room.handleMessage(message)
		room.assignAuth(user, username)
	}

	private handlePrivateMessage(room : Room, isIntro : boolean, ...args : Array<string>) : void {
		const username = args[0]
		const user = this._users.find(username)
		const text = args.slice(2).join('|')
		const message = new PrivateMessage(Utils.getRank(username), user, text)
		this._onPrivateMessage.dispatch(user, message)
	}

	private handleJoin(room : Room, isIntro : boolean, ...args : Array<string>) : void {
		const username = args.join('|')
		const user = this._users.find(username)
		user.join(room)
		room.assignAuth(user, username)
	}

	private handleLeave(room : Room, isIntro : boolean, ...args : Array<string>) : void {
		const username = args.join('|')
		const user = this._users.find(username)
		user.leave(room)
	}

	private handleRename(room : Room, isIntro : boolean, ...args : Array<string>) : void {
		const newUsername = args[0]
		let oldUsername = args[1]

		// we do this because old usernames are already "sanitized" and will index wrong
		if (!Utils.isVoice(oldUsername))
			oldUsername = ` ${oldUsername}`

		var user = this._users.find(oldUsername)
		user.rename(newUsername)
		room.assignAuth(user, newUsername)
	}

	public login(username : string, password : string, retryLogin : boolean = false) : void {
		const retry = () => {
			this._debug(`Retrying login in ${this._autoReconnect /  1000} seconds`)
			setTimeout(this.login.bind(this), this._autoReconnect, username, password, retryLogin)
		}

		const data = `act=login&name=${Utils.toId(username)}&pass=${password}&challengekeyid=${this._challstr.id}&challenge=${this._challstr.str}`;
		const requestParams = {
			hostname: this._deconstructedUrl.hostname,
			port: this._deconstructedUrl.port,
			path: this._deconstructedUrl.pathname,
			agent: false,
			method: 'POST',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": data.length
			}
		}

		const request = https.request(requestParams, (response) => {
			response.setEncoding('utf8')
			let responseData = ''
			response.on('data', chunk => responseData += chunk)
			response.on('end', () => {
				if (responseData === ';') {
					throw new Error('Login failed: wrong credentials')
				}
				if (responseData.length < 50) {
					this._debug(`Login failed: ${responseData}`)
					retry()
				}
				if (responseData.includes('heavy load')) {
					this._debug(`Login failed: login server is currently under heavy load`)
					retry()
				}

				const login = JSON.parse(responseData.substr(1))
				if (login.actionsuccess) {
					const assertion = login.assertion
					this.send(`|/trn ${username},0,${assertion}`)
				} else {
					this._debug(`Login failed: ${login}`)
					retry()
				}
			})
		})

		request.on('error', (err) => {
			throw new Error(`Login failed: ${err}`)
			retry()
		})

		request.write(data)
		request.end()
	}

	private handleQueue() : void {
		const throttle = 500
		setInterval(() => {
			if (!this.isConnected)
				return;
				
			let message = this._queuedMessages.splice(0, 3)
			for (let index = 0; index < message.length; index++) {
				this.sendQueued(message[index])
			}
		}, throttle)
	}

	private sendQueued(queuedMessage : QueuedMessage) : void {
		if (!queuedMessage)
			return;

		queuedMessage.promiseResolve()
		const message = queuedMessage.message;	

		if (!message)
			return;

		if (!this.isConnected)
			return;

		this._debug(`Sending message: ${message}`)
		this._socket?.send(JSON.stringify(message))
	}

	public async send(message : string) : Promise<void> {
		let promiseResolve : (any)
		const promise = new Promise<void>((resolve, reject) => {
			promiseResolve = resolve
		})

		this._queuedMessages.push(new QueuedMessage(message, promiseResolve))
		return promise
	}

	public async join(...room : Array<string>) : Promise<any[]> {
		const promises = []
		for (let index = 0; index < room.length; index++) {
			promises.push(this.send(`|/join ${room[index]}`))
		}
		return Promise.all(promises)
	}

	public async setAvatar(avatar : string) : Promise<void> {
		return this.send(`|/avatar ${avatar}`)
	}

	public async setStatus(status : string) : Promise<void> {
		return this.send(`|/status ${status}`)
	}

	public getRoom(room : string) : Room | undefined {
		return this._rooms.get(room)
	}

	public getUser(username : string) : User | undefined {
		return this._users.get(username)
	}

	public get debug() {
		return this._debug
	}

	public get onConnect() {
		return this._onConnect.asEvent()
	}

	public get onReady() {
		return this._onReady.asEvent()
	}

	public get onLogin() {
		return this._onLogin.asEvent()
	}

	public get onDisconnect() {
		return this._onDisconnect.asEvent()
	}

	public get onRoomJoin() {
		return this._onRoomJoin.asEvent()
	}

	public get onRoomLeave() {
		return this._onRoomLeave.asEvent()
	}

	public get onPrivateMessage() {
		return this._onPrivateMessage.asEvent();
	}
}