import React from "react"

import AddCityButton from "../AddCityButton"
import AddRouteButton from "../AddRouteButton"
import AddTripButton from "../AddTripButton"
import AddPassengerButton from "../AddPassengerButton"

class QuickActions extends React.Component {
    render() {
        return (
            <div className="quick-actions">
                <h2>Швидкі дії</h2>

                <div className="actions">
                    <AddCityButton background='#F5F7FA' setRenderCitiesModal={this.props.setRenderCitiesModal}/>
                    <AddRouteButton background='#F7EEDB' setRenderRoutesModal={this.props.setRenderRoutesModal} />
                    <AddTripButton background='#76B5A9' setRenderTripsModal={this.props.setRenderTripsModal}/>
                    <AddPassengerButton setRenderPassengersModal={this.props.setRenderPassengersModal} />
                </div>
            </div>
        )
    }
}

export default QuickActions