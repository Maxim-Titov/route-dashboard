import React from "react"
import { Plus } from 'lucide-react'

class AddRouteButton extends React.Component {
    render() {
        return (
            <button className={`add-route-button ${this.props.role === 'user' ? 'forbidden' : ''}`} type="button" style={{ background: this.props.background }} onClick={() => this.props.setRenderRoutesModal(true)}>
                <Plus />
                <p className="inter-font">Додати маршрут</p>
            </button>
        )
    }
}

export default AddRouteButton