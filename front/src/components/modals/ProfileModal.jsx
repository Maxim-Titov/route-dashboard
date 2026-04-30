import React from "react"

class ProfileModal extends React.Component {
    render() {
        return (
            <div className="modal-wrapper">
                <div className="profile-modal">
                    <div className="header">
                        <h2>Профіль</h2>
                    </div>

                    <div className="body">
                        <p className="name-and-surname">{this.props.context?.user?.name} {this.props.context?.user?.surname}</p>
                        <p className="role">{this.props.context?.user?.role}</p>
                    </div>

                    <div className="footer">
                        <button
                            className="no inter-font"
                            type="button"
                            onClick={() => this.props.setIsRenderProfileModal(false)}
                        >
                            <p>Закрити</p>
                        </button>

                        <button
                            className="logout inter-font"
                            type="button"
                            onClick={() => this.props.return null}
                        >
                            <p>Вийти</p>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default ProfileModal