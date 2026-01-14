import React from "react"

import ViewHeader from "../ViewHeader"
import TripsList from "./TripsList"
import AddTripButton from "../AddTripButton"
import FilterButton from "../FilterButton"
import AddTripModal from "../modals/AddTripModal"
import Filters from "./Filters"

// TODO: Додати фільтри

class Trips extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isFilters: false,
            sortTypeDesc: true,
            isError: false,

            filters: {
                dateFrom: '',
                dateTo: '',
                cityFrom: '',
                cityTo: '',
                stationCity: '',
                passengersFrom: '',
                passengersTo: '',
                hasFreeSeats: false,
                status: ["planned", "active", "completed", "cancelled"]
            },

            tripsToShow: this.props.tripsList
        }
    }

    parseNumber = (v) => v === '' ? null : Number(v)

    toggleFilters = () => {
        this.setState(prev => ({ isFilters: !prev.isFilters }))
    }

    toggleSort = () => {
        this.setState(prev => ({ sortTypeDesc: !prev.sortTypeDesc }))
    }

    setFilters = (name, value) => {
        this.setState(prev => ({
            filters: {
                ...prev.filters,
                [name]: value
            }
        }))
    }

    filterTrips = async () => {
        const { filters, sortTypeDesc } = this.state

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/trips/filter`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sort_by: sortTypeDesc ? 'desc' : 'asc',

                        date_from: filters.dateFrom || null,
                        date_to: filters.dateTo || null,

                        city_from: filters.cityFrom || null,
                        city_to: filters.cityTo || null,
                        station_city: filters.stationCity || null,

                        passengers_from: this.parseNumber(filters.passengersFrom),
                        passengers_to: this.parseNumber(filters.passengersTo),

                        has_free_seats: filters.hasFreeSeats,
                        status: filters.status.length ? filters.status : null
                    })
                }
            )

            const data = await res.json()

            console.log(data)

            if (data.error) {
                this.setState({ isError: true })
                return
            }

            this.setState({ tripsToShow: data })
        } catch (err) {
            console.error(err)
        }
    }

    resetFilters = () => {
        this.setState({
            sortTypeDesc: true,
            filters: {
                dateFrom: '',
                dateTo: '',
                cityFrom: '',
                cityTo: '',
                stationCity: '',
                passengersFrom: '',
                passengersTo: '',
                hasFreeSeats: false,
                status: ["planned", "active", "completed", "cancelled"]
            },
            tripsToShow: this.props.tripsList
        })
    }

    render() {
        return (
            <div className="trips-wrapper">
                {this.props.renderTripsModal && <AddTripModal setRenderTripsModal={this.props.setRenderTripsModal} fetchPassengers={this.props.fetchPassengers} fetchTrips={this.props.fetchTrips} fetchTripsCount={this.props.fetchTripsCount} />}
                
                <div className="container">
                    <div className="header">
                        <ViewHeader title='Поїздки' subtitle='Керуйте своїми поїздками' />

                        <div className="buttons-wrapper">
                            <FilterButton setIsFilters={this.toggleFilters} />
                            <AddTripButton setRenderTripsModal={this.props.setRenderTripsModal} />
                        </div>
                    </div>

                    {this.state.isFilters && (
                        <Filters
                            filters={this.state.filters}
                            sortTypeDesc={this.state.sortTypeDesc}
                            setFilters={this.setFilters}
                            onToggle={this.toggleSort}
                            onApply={this.filterTrips}
                            onReset={this.resetFilters}
                        />
                    )}

                    <TripsList tripsList={this.state.tripsToShow} fetchRoutes={this.props.fetchRoutes} fetchRoutesCount={this.props.fetchRoutesCount} fetchTrips={this.props.fetchTrips} fetchTripsCount={this.props.fetchTripsCount} fetchPassengers={this.props.fetchPassengers} fetchPassengersCount={this.props.fetchPassengersCount} />
                </div>
            </div>
        )
    }
}

export default Trips