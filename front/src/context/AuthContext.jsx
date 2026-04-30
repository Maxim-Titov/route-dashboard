import React from "react"

const API_URL = import.meta.env.VITE_API_URL
const AuthContext = React.createContext()

export class AuthProvider extends React.Component {
	constructor(props) {
		super(props)

		const token = localStorage.getItem("token")
		const user = localStorage.getItem("user")

		this.state = {
			isAuth: false,
			token,
			user: user ? JSON.parse(user) : null,
			loading: true
		}
	}

	componentDidMount() {
		this.checkAuth()
	}

	checkAuth = async () => {
		const token = localStorage.getItem("token")

		if (!token) {
			this.setState({ isAuth: false, loading: false })
			return
		}

		this.setState({ loading: true })

		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
				method: "POST",
				credentials: "include"
			})

			if (!res.ok) {
				this.logout()
				return
			}

			const data = await res.json()

			localStorage.setItem("token", data.access_token)

			this.setState({
				isAuth: true,
				token: data.access_token,
				loading: false
			})
		} catch (e) {
			this.logout()
		}
	}

	login = (token, user) => {
		localStorage.setItem("token", token)
		localStorage.setItem("user", JSON.stringify(user))

		this.setState({
			isAuth: true,
			token,
			user
		})
	}

	logout = () => {
		localStorage.removeItem("token")
		localStorage.removeItem("user")

		this.setState({
			isAuth: false,
			token: null,
			user: null,
			loading: false
		})
	}

	refreshToken = async () => {
		try {
			const res = await fetch(`${API_URL}/auth/refresh`, {
				method: "POST",
				credentials: "include"
			})

			if (!res.ok) {
				this.logout()
				return null
			}

			const data = await res.json()

			localStorage.setItem("token", data.access_token)

			this.setState({
				token: data.access_token,
				isAuth: true
			})

			return data.access_token
		} catch (e) {
			this.logout()
			return null
		}
	}

	render() {
		return (
			<AuthContext.Provider
				value={{
					...this.state,
					login: this.login,
					logout: this.logout,
					refreshToken: this.refreshToken
				}}
			>
				{this.props.children}
			</AuthContext.Provider>
		)
	}
}

export default AuthContext
