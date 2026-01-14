import React from "react"

class ViewHeader extends React.Component {
    render () {
        return (
            <div className="view-header">
                <h2>{this.props.title}</h2>
                <p>{this.props.subtitle}</p>
            </div>
        )
    }
}

export default ViewHeader