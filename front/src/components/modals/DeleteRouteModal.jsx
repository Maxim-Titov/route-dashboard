import React from "react"

class DeleteRouteModal extends React.Component {
    writeToJournal = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/journal/write`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: this.props.user?.id,
                        entity_type: 'routes',
                        action: 'delete',
                        description: `Видалення маршруту "${this.props.routeName}"`
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
                        <h2>Ви впевнені, що хочете видалити цей маршрут?</h2>
                    </div>

                    <div className="body">
                        <p><span>Маршрут:</span> {this.props.routeName}</p>
                    </div>

                    <div className="footer">
                        <button className="no" type="button" onClick={() => this.props.setRenderDeleteRouteModal(false)}>Ні</button>
                        <button className="yes" type="button" onClick={async () => {
                            this.props.onDelete(this.props.routeId)
                            await this.writeToJournal()
                            this.props.setRenderDeleteRouteModal(false)
                        }}>Так</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeleteRouteModal