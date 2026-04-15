import React from "react"
import { Navigate } from "react-router-dom"

import AuthContext from "../context/AuthContext"

class ProtectedRoute extends React.Component {
	static contextType = AuthContext

	render() {
		const { isAuth, loading } = this.context

		if (loading) {
			return <div>Loading...</div>
		}

		if (!isAuth) {
			return <Navigate to="/login" replace />
		}

		return this.props.children
	}
}

export default ProtectedRoute