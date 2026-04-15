import React from "react"

class DeleteUserModal extends React.Component {
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
                        action: 'delete',
                        description: `Видалення користувача "${this.props.userName}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    render() {
        return (
            <div className="modal-wrapper">
                <div className="confirm-modal">
                    <div className="header">
                        <h2>Ви впевнені, що хочете видалити цього користувача?</h2>
                    </div>

                    <div className="body">
                        <p><span>Користувач:</span> {this.props.userName}</p>
                    </div>

                    <div className="footer">
                        <button className="no" type="button" onClick={() => this.props.setRenderDeleteUserModal(false)}>Ні</button>
                        <button className="yes" type="button" onClick={() => {
                            this.props.onDelete(this.props.userId)
                            this.writeToJournal()
                            this.props.setRenderDeleteUserModal(false)
                        }}>Так</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeleteUserModal