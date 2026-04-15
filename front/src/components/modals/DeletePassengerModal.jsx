import React from "react"

class DeletePassengerModal extends React.Component {
    writeToJournal = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/journal/write`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: this.props.user?.id,
                        entity_type: 'passengers',
                        action: 'delete',
                        description: `Видалення пасажира "#${this.props.passengerId} ${this.props.passengerName}"`
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
                        <h2>Ви впевнені, що хочете видалити цього пасажира?</h2>
                    </div>

                    <div className="body">
                        <p><span>Пасажир:</span> {this.props.passengerName}</p>
                    </div>

                    <div className="footer">
                        <button className="no" type="button" onClick={() => this.props.setRenderDeletePassengerModal(false)}>Ні</button>
                        <button className="yes" type="button" onClick={async () => {
                            await this.writeToJournal()
                            this.props.onDelete(this.props.passengerId)
                            this.props.setRenderDeletePassengerModal(false)
                        }}>Так</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeletePassengerModal