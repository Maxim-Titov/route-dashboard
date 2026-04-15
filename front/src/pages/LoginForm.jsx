import React from "react"

import AuthContext from "../context/AuthContext"
import { withNavigation } from "../utils/withNavigation"

import MessageModal from "../components/modals/MessageModal"

class LoginForm extends React.Component {
    static contextType = AuthContext

    constructor(props) {
        super(props)

        this.state = {
            // isRegister: false,
            data: {
                name: '',
                surname: '',
                login: '',
                password: ''
            },
            errors: {},
            renderErrorMessage: false,
            errorMessageHeader: '',
            errorMessageBody: ''
        }
    }

    login = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                login: this.state.data?.login,
                password: this.state.data?.password
            })
        })

        if (!res.ok) {
            this.setState({
                renderErrorMessage: true,
                errorMessageHeader: 'Увійти не вдалось',
                errorMessageBody: 'Перевірте введені данні'
            })

            throw new Error("Login failed")
        }

        const data = await res.json()

        this.context.login(data.access_token, data.user)
        this.props.navigate("/");

        return data
    }

    // setIsRegister = (value) => {
    //     this.setState({ isRegister: value })
    // }

    setRenderErrorMessage = (value) => {
        this.setState({ renderErrorMessage: value })
    }

    handleChange = (e) => {
        const { name, value } = e.target

        this.setState(prev => ({
            data: { ...prev.data, [name]: value },
            errors: { ...prev.errors, [name]: undefined }
        }))
    }

    render() {
        // const { isRegister } = this.state

        return (
            <div className="login-form-wrapper">
                <div className="login-form">
                    <div className="header">
                        <h2>Увійти</h2>
                    </div>

                    <div className="body">
                        <form id="login-form">
                            <div className="form-row">
                                <label htmlFor="login">Логін</label>
                                <input type="text" name="login" id="login" onChange={this.handleChange} />
                            </div>

                            <div className="form-row">
                                <label htmlFor="password">Пароль</label>
                                <input type="password" name="password" id="password" onChange={this.handleChange} />
                            </div>

                            <button type="button" onClick={this.login}>Увійти</button>
                        </form>
                    </div>
                </div>

                {this.state.renderErrorMessage && (
                    <MessageModal header={this.state.errorMessageHeader} body={this.state.errorMessageBody} action={this.setRenderErrorMessage} />
                )}
            </div>
        )
    }
}

export default withNavigation(LoginForm)