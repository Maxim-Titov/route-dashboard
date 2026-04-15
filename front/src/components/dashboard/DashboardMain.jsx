import React from "react"

import ViewHeader from "../ViewHeader"
import GeneralStatistics from "./GeneralStatistics"
import QuickActions from "./QuickActions"
import PopularRoutes from "./PopularRoutes"
import AddCityModal from "../modals/AddCityModal"
import AddRouteModal from "../modals/AddRouteModal"
import AddTripModal from "../modals/AddTripModal"
import AddPassengerModal from "../modals/AddPassangerModal"

class DashboardMain extends React.Component {
    render() {
        return (
            <div className="dashboard-wrapper">
                {this.props.renderCitiesModal && (
                    <AddCityModal user={this.props.user} setRenderCitiesModal={this.props.setRenderCitiesModal} fetchCities={this.props.fetchCities} fetchCitiesCount={this.props.fetchCitiesCount} />
                )}

                {this.props.renderRoutesModal && (
                    <AddRouteModal user={this.props.user} setRenderRoutesModal={this.props.setRenderRoutesModal} fetchRoutes={this.props.fetchRoutes} fetchRoutesCount={this.props.fetchRoutesCount} />
                )}

                {this.props.renderPassengersModal && (
                    <AddPassengerModal user={this.props.user} setRenderPassengersModal={this.props.setRenderPassengersModal} fetchTripsCount={this.props.fetchTripsCount} fetchPassengers={this.props.fetchPassengers} fetchPassengersCount={this.props.fetchPassengersCount} />
                )}

                {this.props.renderTripsModal && (
                    <AddTripModal user={this.props.user} setRenderTripsModal={this.props.setRenderTripsModal} fetchPassengers={this.props.fetchPassengers} fetchTrips={this.props.fetchTrips} fetchTripsCount={this.props.fetchTripsCount} />
                )}

                <div className="container">
                    <ViewHeader title={`Вітаємо, ${this.props.user?.name}!`} subtitle={"Ось що відбувається з поїздками сьогодні"} />
                    <GeneralStatistics citiesCount={this.props.citiesCount} routesCount={this.props.routesCount} tripsCount={this.props.tripsCount} passengersCount={this.props.passengersCount} />
                    <QuickActions role={this.props.user?.role} setRenderCitiesModal={this.props.setRenderCitiesModal} setRenderRoutesModal={this.props.setRenderRoutesModal} setRenderTripsModal={this.props.setRenderTripsModal} setRenderPassengersModal={this.props.setRenderPassengersModal} />
                    <PopularRoutes generateRightForm={this.props.generateRightForm} />
                </div>
            </div>
        )
    }
}

export default DashboardMain