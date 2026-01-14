import React from "react"

import AuthContext from "../context/AuthContext"
import { withNavigation } from "../utils/withNavigation"

import MessageModal from "../components/modals/MessageModal"

class LoginForm extends React.Component {
    static contextType = AuthContext

    constructor(props) {
        super(props)

        this.state = {
            isRegister: false,
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
            headers: { "Content-Type": "application/json" },
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

    register = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/user/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: this.state.data?.name,
                        surname: this.state.data?.surname,
                        login: this.state.data?.login,
                        password: this.state.data?.password
                    })
                }
            )

            const data = await res.json()

            console.log(data)

            if (data.detail === 'Registration disabled') {
                this.setState({
                    renderErrorMessage: true,
                    errorMessageHeader: 'Реєстрація відключенна',
                    errorMessageBody: 'Наразі реєстрація відключенна, спробуйте пізніше'
                })
                return
            }

            this.context.login(data.access_token, data.user);
            this.props.navigate("/");

            return data
        } catch (err) {
            console.error(err)
        }
    }

    setIsRegister = (value) => {
        this.setState({ isRegister: value })
    }

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
        const { isRegister } = this.state

        return (
            <div className="login-form-wrapper">
                <div className="login-form">
                    <div className="header">
                        <h2>
                            {isRegister ? "Зареєструватись" : "Увійти"}
                        </h2>
                    </div>

                    <div className="body">
                        {isRegister
                            ? (
                                <form id="register-form">
                                    <div className="form-row">
                                        <label htmlFor="name">Ім'я</label>
                                        <input type="text" name="name" id="name" onChange={this.handleChange} />
                                    </div>

                                    <div className="form-row">
                                        <label htmlFor="surname">Прізвище</label>
                                        <input type="text" name="surname" id="surname" onChange={this.handleChange} />
                                    </div>

                                    <div className="form-row">
                                        <label htmlFor="login">Логін</label>
                                        <input type="text" name="login" id="login" onChange={this.handleChange} />
                                    </div>

                                    <div className="form-row">
                                        <label htmlFor="password">Пароль</label>
                                        <input type="password" name="password" id="password" onChange={this.handleChange} />
                                    </div>

                                    <button type="button" onClick={this.register}>Зареєструватись</button>
                                </form>
                            )
                            : (
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
                            )
                        }
                    </div>

                    <div className="footer">
                        {!isRegister
                            ? (
                                <div className="register">
                                    <p>Немає аккаунта? <span onClick={() => this.setIsRegister(true)}>Зареєструватись</span></p>
                                </div>
                            )
                            : (
                                <div className="login">
                                    <p>Є аккаунт? <span onClick={() => this.setIsRegister(false)}>Увійти</span></p>
                                </div>
                            )
                        }
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