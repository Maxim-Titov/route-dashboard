import React from "react"

class DeleteCityModal extends React.Component {
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
                        }}>Так</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeleteCityModal