import React from "react"

class MessageModal extends React.Component {
    render() {
        return (
            <div className="message-modal-wrapper">
                <div className="message-modal">
                    <div className="header">
                        <h2>
                            {this.props.header}
                        </h2>
                    </div>

                    <div className="body">
                        <p>{this.props.body}</p>
                    </div>

                    <div className="footer">
                        <button type="button" className="inter-font yes" onClick={() => this.props.action(false)}>Гаразд</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default MessageModal