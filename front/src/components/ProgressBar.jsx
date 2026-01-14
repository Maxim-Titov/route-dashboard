import React from "react"

class ProgressBar extends React.Component {
    render() {
        return (
            <div className={`progress-bar ${this.props.className}`}>
                <div className="progress-bar--header">
                    <p className="progress-bar--header-label">{this.props.label}</p>
                    <p className="progress-bar--header-value">{this.props.value}</p>
                </div>
                
                <div className="progress-bar--bar">
                    <div className="progress-bar--bar-value" style={{ width: `${this.props.value}%` }} />
                </div>
            </div>
        )
    }
}

export default ProgressBar