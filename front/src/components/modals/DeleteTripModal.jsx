import React from "react"

class DeleteTripModal extends React.Component {
    writeToJournal = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/journal/write`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: this.props.user?.id,
                        entity_type: 'trips',
                        action: 'delete',
                        description: `Видалення поїздки "#${this.props.tripId} ${this.props.tripName}"`
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
                        <h2>Ви впевнені, що хочете видалити цю поїздку?</h2>
                    </div>

                    <div className="body">
                        <p><span>Поїздка:</span> {`#${this.props.tripId}`} {this.props.tripName}</p>
                    </div>

                    <div className="footer">
                        <button className="no" type="button" onClick={() => this.props.setRenderDeleteTripModal(false)}>Ні</button>
                        <button className="yes" type="button" onClick={async () => {
                            await this.writeToJournal()
                            this.props.onDelete(this.props.tripId)
                        }}>Так</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeleteTripModal