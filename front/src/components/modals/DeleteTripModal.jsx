import React from "react"

class DeleteTripModal extends React.Component {
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
                        <button className="yes" type="button" onClick={() => {
                            this.props.onDelete(this.props.tripId)
                        }}>Так</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeleteTripModal