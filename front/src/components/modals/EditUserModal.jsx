import React from "react"
import { Save } from "lucide-react"

class EditUserModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            userData: {
                id: 0,
                name: '',
                surname: '',
                login: '',
                isAdmin: false
            },
            errors: {}
        }
    }

    componentDidMount() {
        this.setState({ userData: this.props.userData })
    }

    editUser = async () => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/user/edit`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        user_id: this.state.userData?.id,
                        name: this.state.userData?.name,
                        surname: this.state.userData?.surname,
                        login: this.state.userData?.login,
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
                    return null
                }

                const data = await refreshRes.json()
                localStorage.setItem("token", data.access_token)

                res = await fetch(
                    `${import.meta.env.VITE_API_URL}/user/edit`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            user_id: this.state.userData?.id,
                            name: this.state.userData?.name,
                            surname: this.state.userData?.surname,
                            login: this.state.userData?.login,
                            is_admin: this.state.userData?.isAdmin
                        })
                    }
                )
            }

            const data = await res.json()
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
                        action: 'edit',
                        description: `Редагування користувача "${this.state.userData?.name} ${this.state.userData?.surname}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    validateForm = () => {
        let { name, surname, login } = this.state.userData
        const errors = {}

        if (!name.trim()) errors.name = "Імʼя обовʼязкове"
        if (!surname.trim()) errors.surname = "Прізвище обовʼязкове"
        if (!login.trim()) errors.login = "Логін обовʼязковий"

        this.setState({ errors })

        return Object.keys(errors).length === 0
    }

    onEdit = async () => {
        if (!this.validateForm()) return

        await this.editUser()
        await Promise.all([
            this.writeToJournal(),
            this.props.fetchUsers(),
        ])

        this.props.setRenderEditUserModal(false)
    }

    handleChange = (e) => {
        const { name, type, value, checked } = e.target

        this.setState(prev => ({
            userData: { ...prev.userData, [name]: type === "checkbox" ? checked : value },
            errors: { ...prev.errors, [name]: undefined }
        }))
    }

    render() {
        const { userData, errors } = this.state

        return (
            <div className="modal-wrapper">
                <div className="add-user-modal">
                    <div className="header">
                        <h2>Редагувати учасника</h2>
                    </div>

                    <div className="body">
                        <form id="user-info-form">
                            <div className="form-row">
                                <label htmlFor="login">Логін</label>
                                <input type="text" name="login" id="login" value={userData.login} onChange={this.handleChange} />
                            </div>

                            <div className="form-row">
                                <label htmlFor="name">Ім'я</label>
                                <input type="text" name="name" id="name" value={userData.name} onChange={this.handleChange} />
                            </div>

                            <div className="form-row">
                                <label htmlFor="surname">Прізвище</label>
                                <input type="text" name="surname" id="surname" value={userData.surname} onChange={this.handleChange} />
                            </div>

                            <div className="form-row">
                                <label><input type="checkbox" name="isAdmin" id="isAdmin" checked={userData.isAdmin} onChange={this.handleChange} />Адміністратор</label>
                            </div>
                        </form>
                    </div>

                    <div className="footer">
                        <button
                            className="no inter-font"
                            type="button"
                            onClick={() => this.props.setRenderEditUserModal(false)}
                        >
                            <p>Скасувати</p>
                        </button>

                        <button
                            className="yes inter-font"
                            type="button"
                            onClick={this.onEdit}
                        >
                            <Save />
                            <p>Зберегти</p>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default EditUserModal