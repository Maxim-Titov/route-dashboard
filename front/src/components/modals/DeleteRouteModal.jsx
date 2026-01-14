import React from "react"

class DeleteRouteModal extends React.Component {
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
                        <button className="yes" type="button" onClick={() => {
                            this.props.onDelete(this.props.routeId)
                        }}>Так</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeleteRouteModal