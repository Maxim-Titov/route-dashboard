import React from "react"
import { Plus } from 'lucide-react'

class AddCityButton extends React.Component {
    render() {
        return (
            <button className="add-city-button" type="button" style={{ background: this.props.background }} onClick={() => this.props.setRenderCitiesModal(true)}>
                <Plus />
                <p className="inter-font">Додати місто</p>
            </button>
        )
    }
}

export default AddCityButton