import React from "react"
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import LoginForm from "./pages/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";

class App extends React.Component {
	render() {
		return (
			<Routes>
				<Route path="/login" element={<LoginForm />} />

				<Route path="/" element={
					<ProtectedRoute>
						<Home />
					</ProtectedRoute>
				} />
			</Routes>
		)
	}
}

export default App