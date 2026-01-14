import React from "react"

class DeletePassengerModal extends React.Component {
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
                        <button className="yes" type="button" onClick={() => {
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