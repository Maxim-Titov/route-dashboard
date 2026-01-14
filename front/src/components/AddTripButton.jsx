import React from "react"
import { Plus } from 'lucide-react'

class AddTripButton extends React.Component {
    render () {
        return (
            <button className="add-trip-button" type="button" style={{background: this.props.background}} onClick={() => this.props.setRenderTripsModal(true)}>
                <Plus />
                <p className="inter-font">Додати поїздку</p>
            </button>
        )
    }
}

export default AddTripButton