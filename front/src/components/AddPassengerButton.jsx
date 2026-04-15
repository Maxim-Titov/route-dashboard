import React from "react"
import { Plus } from 'lucide-react'

class AddPassengerButton extends React.Component {
    render() {
        return (
            <button className={`add-passenger-button ${this.props.role === 'user' ? 'forbidden' : ''}`} type="button" onClick={() => this.props.setRenderPassengersModal(true)}>
                <Plus />
                <p className="inter-font">Додати пасажира</p>
            </button>
        )
    }
}

export default AddPassengerButton