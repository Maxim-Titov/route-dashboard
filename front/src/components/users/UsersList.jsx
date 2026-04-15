import React from "react"
import { Edit2, Trash2 } from "lucide-react"

import EditUserModal from "../modals/EditUserModal"
import DeleteUserModal from "../modals/DeleteUserModal"

class UsersList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            renderEditUserModal: false,
            renderDeleteUserModal: false,
            userData: {
                id: 0,
                name: '',
                surname: '',
                login: '',
                isAdmin: false
            }
        }
    }

    deleteUser = async (id) => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/user/delete`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        user_id: id
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
                    `${import.meta.env.VITE_API_URL}/user/delete`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            user_id: id
                        })
                    }
                )
            }

            const data = await res.json()

            await this.props.fetchUsers()

            return data
        } catch (err) {
            console.error(err)
        }
    }

    setRenderEditUserModal = (value) => {
        this.setState({ renderEditUserModal: value })
    }

    setRenderDeleteUserModal = (value) => {
        this.setState({ renderDeleteUserModal: value })
    }

    setRenderMessageModal = (value) => {
        this.setState({ renderMessageModal: value })
    }

    setUserData = (data) => {
        this.setState({ userData: data })
    }

    renderRole = (role) => {
        switch (role) {
            case 'admin':
                return 'Адміністратор'
            case 'user':
                return 'Водій'
        }
    }

    render() {
        const { usersList } = this.props

        const users = usersList.map((user) => ({
            id: user.id,
            login: user.login,
            name: user.name,
            surname: user.surname,
            role: user.role,
            created_at: user.created_at
        }));

        return (
            <div className="users-list">
                {users.map((user, index) => (
                    <div className="card" key={index}>
                        <div className="header">
                            <div className="name-and-login">
                                <p className="name">{user.name} {user.surname}</p>
                                <p className="login">{user.login}</p>
                            </div>

                            <div className="actions">
                                <div className={`icon-wrapper edit ${this.props.user?.role === 'user' ? 'forbidden' : ''}`} onClick={() => {
                                    this.setUserData({
                                        id: user.id,
                                        name: user.name,
                                        surname: user.surname,
                                        login: user.login,
                                        isAdmin: user.role === 'admin' ? true : false
                                    })
                                    this.setRenderEditUserModal(true)
                                }}>
                                    <Edit2 />
                                </div>

                                <div className={`icon-wrapper trash ${this.props.user?.role === 'user' ? 'forbidden' : ''}`} onClick={() => {
                                    this.setUserData({
                                        id: user.id,
                                        name: user.name,
                                        surname: user.surname,
                                        login: user.login,
                                        isAdmin: user.role === 'admin' ? true : false
                                    })
                                    this.setRenderDeleteUserModal(true)
                                }}>
                                    <Trash2 />
                                </div>
                            </div>
                        </div>

                        <div className="content">
                            <div className="details">
                                <p><span>Роль:</span> {this.renderRole(user.role)}</p>
                                <p><span>Зареєстровано:</span> {new Date(user.created_at).toLocaleString("uk-UA", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                })}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {this.state.renderEditUserModal && (
                    <EditUserModal user={this.props.user} userData={this.state.userData} fetchUsers={this.props.fetchUsers} setRenderEditUserModal={this.setRenderEditUserModal} />
                )}

                {this.state.renderDeleteUserModal && (
                    <DeleteUserModal user={this.props.user} userName={this.state.userData?.name + " " + this.state.userData?.surname} userId={this.state.userData?.id} setRenderDeleteUserModal={this.setRenderDeleteUserModal} onDelete={this.deleteUser} />
                )}
            </div>
        )
    }
}

export default UsersList