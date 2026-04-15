import React from "react"

class DeleteCityModal extends React.Component {
    writeToJournal = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/journal/write`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: this.props.user?.id,
                        entity_type: 'cities',
                        action: 'delete',
                        description: `Видалення міста "${this.props.cityName}"`
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
                        <h2>Ви впевнені, що хочете видалити це місто?</h2>
                    </div>

                    <div className="body">
                        <p><span>Місто:</span> {this.props.cityName}</p>
                    </div>

                    <div className="footer">
                        <button className="no" type="button" onClick={() => this.props.setRenderDeleteCityModal(false)}>Ні</button>
                        <button className="yes" type="button" onClick={() => {
                            this.props.onDelete(this.props.cityId)
                            this.writeToJournal()
                            this.props.setRenderDeleteCityModal(false)
                        }}>Так</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeleteCityModal