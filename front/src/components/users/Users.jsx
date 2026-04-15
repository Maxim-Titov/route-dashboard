import React from "react"
import { Plus } from "lucide-react"

import ViewHeader from "../ViewHeader"
import UsersList from "./UsersList"
import AddUserModal from "../modals/AddUserModal"

class Users extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            usersList: [],
            renderAddUserModal: false
        }
    }

    async componentDidMount() {
        await this.fetchUsers()
    }

    fetchUsers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users`)
            const data = await res.json()

            this.setState({
                usersList: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    setRenderAddUserModal = (value) => {
        this.setState({ renderAddUserModal: value })
    }

    render() {
        return (
            <div className="users-wrapper">
                {this.state.renderAddUserModal && (
                    <AddUserModal user={this.props.user} setRenderAddUserModal={this.setRenderAddUserModal} fetchUsers={this.fetchUsers} />
                )}

                <div className="container">
                    <div className="header">
                        <ViewHeader title='Команда' subtitle='Перегляд та керування учасниками' />

                        <div className="buttons-wrapper">
                            <button className={`add-user-button ${this.props.user?.role === 'user' ? 'forbidden' : ''}`} type="button" onClick={() => this.setRenderAddUserModal(true)}>
                                <Plus />
                                <p className="inter-font">Додати учасника</p>
                            </button>
                        </div>
                    </div>

                    <UsersList user={this.props.user} usersList={this.state.usersList} fetchUsers={this.fetchUsers} />
                </div>
            </div>
        )
    }
}

export default Users