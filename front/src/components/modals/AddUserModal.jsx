import React from "react"
import { Save } from 'lucide-react'

import MessageModal from "./MessageModal"

class AddUserModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            userData: {
                login: '',
                password: '',
                name: '',
                surname: '',
                isAdmin: false
            },
            errors: {},
            renderErrorMessage: false,
            errorMessageHeader: '',
            errorMessageBody: ''
        }

        this.formRef = React.createRef()
    }

    register = async () => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/user/register`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        name: this.state.userData?.name,
                        surname: this.state.userData?.surname,
                        login: this.state.userData?.login,
                        password: this.state.userData?.password,
                        is_admin: this.state.userData?.isAdmin
                    })
                }
            )

            if (res.status === 401) {
                const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include"
                })

                if (!refreshRes.ok) {
                    context.logout()
                    return null
                }

                const data = await refreshRes.json()
                localStorage.setItem("token", data.access_token)

                res = await fetch(
                    `${import.meta.env.VITE_API_URL}/user/register`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            name: this.state.userData?.name,
                            surname: this.state.userData?.surname,
                            login: this.state.userData?.login,
                            password: this.state.userData?.password,
                            is_admin: this.state.userData?.isAdmin
                        })
                    }
                )
            }

            const data = await res.json()

            if (data.detail === 'Registration disabled') {
                this.setState({
                    renderErrorMessage: true,
                    errorMessageHeader: 'Реєстрація відключенна',
                    errorMessageBody: 'Наразі реєстрація відключенна, спробуйте пізніше'
                })
                return
            }

            await this.props.fetchUsers()

            return data
        } catch (err) {
            console.error(err)
        }
    }

    writeToJournal = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/journal/write`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: this.props.user?.id,
                        entity_type: 'users',
                        action: 'create',
                        description: `Створення нового користувача "${this.state.userData?.name} ${this.state.userData?.surname}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    setRenderErrorMessage = (value) => {
        this.setState({ renderErrorMessage: value })
    }

    handleChange = (e) => {
        const { name, type, value, checked } = e.target

        this.setState(prev => ({
            userData: { ...prev.userData, [name]: type === "checkbox" ? checked : value },
            errors: { ...prev.errors, [name]: undefined }
        }))
    }

    render() {
        return (
            <>
                <div className="modal-wrapper">
                    <div className="add-user-modal">
                        <div className="header">
                            <h2>Додати учасника</h2>
                        </div>

                        <div className="body">
                            <form id="register-form">
                                <div className="form-row">
                                    <label htmlFor="login">Логін</label>
                                    <input type="text" name="login" id="login" onChange={this.handleChange} />
                                </div>

                                <div className="form-row">
                                    <label htmlFor="password">Пароль</label>
                                    <input type="password" name="password" id="password" onChange={this.handleChange} />
                                </div>

                                <div className="form-row">
                                    <label htmlFor="name">Ім'я</label>
                                    <input type="text" name="name" id="name" onChange={this.handleChange} />
                                </div>

                                <div className="form-row">
                                    <label htmlFor="surname">Прізвище</label>
                                    <input type="text" name="surname" id="surname" onChange={this.handleChange} />
                                </div>

                                <div className="form-row">
                                    <label><input type="checkbox" name="isAdmin" id="isAdmin" onChange={this.handleChange} />Адміністратор</label>
                                </div>
                            </form>
                        </div>

                        <div className="footer">
                            <button
                                className="no inter-font"
                                type="button"
                                onClick={() => this.props.setRenderAddUserModal(false)}
                            >
                                <p>Скасувати</p>
                            </button>

                            <button
                                className="yes inter-font"
                                type="button"
                                onClick={async () => {
                                    await this.register()
                                    await this.writeToJournal()
                                    await this.props.setRenderAddUserModal(false)
                                }}
                            >
                                <Save />
                                <p>Зберегти</p>
                            </button>
                        </div>
                    </div>
                </div>

                {this.state.renderErrorMessage && (
                    <MessageModal header={this.state.errorMessageHeader} body={this.state.errorMessageBody} action={this.setRenderErrorMessage} />
                )}
            </>
        )
    }
}

export default AddUserModal