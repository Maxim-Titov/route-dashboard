import React from "react"
import { Users, Calendar, Clock, Info, Edit2, Trash2 } from 'lucide-react'

import TripDetailsModal from "../modals/TripDetailsModal"
import EditTripModal from "../modals/EditTripModal"
import DeleteTripModal from "../modals/DeleteTripModal"

class TripsList extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            renderDeleteTripModal: false,
            renderEditTripModal: false,
            renderTripDetailsModal: false,
            tripId: null,
            tripName: null,
            tripData: {
                from: '',
                to: '',
                date: '',
                time: '',
                status: '',
                passengersCount: '',
                maxPassengers: '',
                stations: [],
                passengers: []
            },
            isFail: false,
            failMessage: ''
        }
    }

    setIsFail = (value) => {
        this.setState({ isFail: value })
    }

    setFailMessage = (value) => {
        this.setState({ failMessage: value })
    }

    deleteTrip = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/trips/delete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        trip_id: id
                    })
                }
            )

            const data = await res.json()

            if (!data.success) {
                this.setIsFail(true)
                this.setFailMessage(data.message)
            }

            return data
        } catch (err) {
            console.error(err)
        }
    }

    tripStations = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/trips/stations`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        trip_id: id
                    })
                }
            )

            const data = await res.json()

            return data
        } catch (err) {
            console.error(err)
        }
    }

    tripPassengers = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/trips/passengers`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        trip_id: id
                    })
                }
            )

            const data = await res.json()

            return data
        } catch (err) {
            console.error(err)
        }
    }

    setTripStatus = async (id, status) => {
        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/trips/status/set`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        trip_id: id,
                        status: status
                    })
                }
            )

            await this.props.fetchTrips()
        } catch (err) {
            console.error(err)
        }
    }

    onDelete = async (id) => {
        await this.deleteTrip(id)

        if (this.state.isFail) {
            return
        }

        await this.props.fetchRoutes()
        await this.props.fetchRoutesCount()
        await this.props.fetchTrips()
        await this.props.fetchTripsCount()
        await this.props.fetchPassengers()
        await this.props.fetchPassengersCount()

        this.setRenderDeleteTripModal(false)
    }

    setRenderDeleteTripModal = (value) => {
        this.setState({ renderDeleteTripModal: value })
    }

    setRenderEditTripModal = (value) => {
        this.setState({ renderEditTripModal: value })
    }

    setRenderTripDetailsModal = (value) => {
        this.setState({ renderTripDetailsModal: value })
    }

    setTrip = (id, name, data) => {
        this.setState({
            tripId: id,
            tripName: name,
            tripData: data
        })
    }

    formatTimeFromSeconds = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }

    formatStatus = (status) => {
        switch (status) {
            case 'planned':
                return 'Заплановано'
            case 'active':
                return 'В дорозі'
            case 'completed':
                return 'Завершено'
            case 'cancelled':
                return 'Скасовано'
            default:
                return 'Заплановано'
        }
    }

    render() {        
        const { tripsList } = this.props

        const trips = tripsList.map((trip) => ({
            id: trip.id,
            from: trip.from_city,
            to: trip.to_city,
            status: trip.status,
            date: trip.date,
            time: trip.time,
            passengersCount: trip.passengers_count,
            maxPassengers: trip.max_passengers_count,
        }));
        
        return (
            <div className="trips-list">
                {trips.map((trip, index) => (
                    <div className="card" key={index}>
                        <div className="header">
                            <div className="route">
                                <div className="info">
                                    #{trip.id} {trip.from} → {trip.to}
                                </div>

                                <div className="status">
                                    {this.formatStatus(trip.status)}
                                </div>
                            </div>

                            <div className="actions">
                                <div className="icon-wrapper info" onClick={async () => {
                                    const stations = await this.tripStations(trip.id)
                                    const passengers = await this.tripPassengers(trip.id)

                                    this.setTrip(
                                        trip.id,
                                        `#${trip.id} ${trip.from} → ${trip.to}`,
                                        {
                                            from: trip.from,
                                            to: trip.to,
                                            date: trip.date,
                                            time: trip.time,
                                            status: trip.status,
                                            passengersCount: trip.passengersCount,
                                            maxPassengers: trip.maxPassengers,
                                            stations,
                                            passengers
                                        }
                                    )

                                    this.setState({ renderTripDetailsModal: true })
                                }}>
                                    <Info />
                                </div>
                                
                                <div className="icon-wrapper edit" onClick={async () => {
                                    const stations = await this.tripStations(trip.id)
                                    const passengers = await this.tripPassengers(trip.id)

                                    this.setTrip(
                                        trip.id,
                                        `#${trip.id} ${trip.from} → ${trip.to}`,
                                        {
                                            from: trip.from,
                                            to: trip.to,
                                            date: trip.date,
                                            time: this.formatTimeFromSeconds(trip.time),
                                            status: trip.status,
                                            passengersCount: trip.passengersCount,
                                            maxPassengers: trip.maxPassengers,
                                            stations,
                                            passengers
                                        }
                                    )
                                    this.setRenderEditTripModal(true)
                                }}>
                                    <Edit2 />
                                </div>

                                <div className="icon-wrapper trash" onClick={() => {
                                    this.setTrip(
                                        trip.id,
                                        `${trip.from} → ${trip.to}`,
                                        {
                                            from: trip.from,
                                            to: trip.to,
                                            date: trip.date,
                                            time: trip.time,
                                            maxPassengers: trip.maxPassengers
                                        }
                                    );
                                    this.setRenderDeleteTripModal(true);
                                }}>
                                    <Trash2 />
                                </div>
                            </div>
                        </div>

                        <div className="content">
                            <div className="date">
                                <Calendar />
                                <span>{new Date(trip.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}</span>
                            </div>

                            <div className="time">
                                <Clock />
                                <span>{this.formatTimeFromSeconds(trip.time)}</span>
                            </div>

                            <div className="passengers-count">
                                <Users />
                                <span>{trip.passengersCount} / {trip.maxPassengers}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {this.state.renderTripDetailsModal && <TripDetailsModal
                    id={this.state.tripId}
                    name={this.state.tripName}
                    data={this.state.tripData}
                    formatTimeFromSeconds={this.formatTimeFromSeconds}
                    setRenderTripDetailsModal={this.setRenderTripDetailsModal}
                    setTripStatus={this.setTripStatus}
                />}

                {this.state.renderEditTripModal && <EditTripModal 
                    id={this.state.tripId}
                    data={this.state.tripData}
                    setRenderEditTripModal={this.setRenderEditTripModal}
                    setTripStatus={this.setTripStatus}
                    formatStatus={this.formatStatus}
                    fetchRoutes={this.props.fetchRoutes}
                    fetchRoutesCount={this.props.fetchRoutesCount}
                    fetchTrips={this.props.fetchTrips}
                    fetchTripsCount={this.props.fetchTripsCount}
                    fetchPassengers={this.props.fetchPassengers}
                    fetchPassengersCount={this.props.fetchPassengersCount} 
                />}

                {this.state.renderDeleteTripModal && (
                    <DeleteTripModal
                        setRenderDeleteTripModal={this.setRenderDeleteTripModal}
                        tripId={this.state.tripId}
                        tripName={this.state.tripName}
                        onDelete={this.onDelete}
                    />
                )}
            </div>
        )
    }
}

export default TripsList