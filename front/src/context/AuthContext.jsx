import React from "react"

const AuthContext = React.createContext()

export class AuthProvider extends React.Component {
	constructor(props) {
		super(props)

		const token = localStorage.getItem("token")
		const user = localStorage.getItem("user")

		this.state = {
			isAuth: !!token,
			token,
			user: user ? JSON.parse(user) : null,
			loading: false
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
			user: null
		})
	}

	render() {
		return (
			<AuthContext.Provider
				value={{
					...this.state,
					login: this.login,
					logout: this.logout
				}}
			>
				{this.props.children}
			</AuthContext.Provider>
		)
	}
}

export default AuthContext
