import React from "react"
import { X, Clock, Users, MapPin, GitCommitVertical, MapPinCheckInside } from 'lucide-react'

import { formatPhone } from "../../utils/formatPhoneNumber"

class TripDetailsModal extends React.Component {
    render() {
        const {id, name, data} = this.props

        return (
            <div className="modal-wrapper">
                <div className="trip-details-modal">
                    <div className="header">
                        <div className="title">
                            <h2>{`${name}`}</h2>
                            <p>Деталі маршруту на {new Date(data.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>


                        <div className="icon-wrapper close" onClick={() => this.props.setRenderTripDetailsModal(false)}>
                            <X />
                        </div>
                    </div>

                    <div className="body">
                        <div className="info-card">
                            <div className="time">
                                <p>Виїзд</p>

                                <div>
                                    <Clock />
                                    {this.props.formatTimeFromSeconds(data.time)}
                                </div>
                            </div>

                            <div className="passengers">
                                <p>Пасажири</p>

                                <div>
                                    <Users />
                                    {data.passengersCount} / {data.maxPassengers}
                                </div>
                            </div>
                        </div>

                        <div className="route-card">
                            <div className="title">
                                <p>Маршрут</p>
                            </div>

                            <div className="from">
                                <MapPin />
                                <p>{data.from}</p>
                            </div>

                            <div className="stations">
                                {data.stations.map((station, index) => (
                                    <div key={index} className="station">
                                        <GitCommitVertical />
                                        <p>{station.city}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="to">
                                <MapPinCheckInside />
                                <p>{data.to}</p>
                            </div>
                        </div>

                        <div className="passengers-card">
                            <div className="title">
                                <p>Пасажири</p>
                            </div>

                            <div className="passengers">
                                {data.passengers.map((passenger, index) => (
                                    <ul key={index} className="passenger">
                                        <li>
                                            <p>
                                                <span>{passenger.first_name} {passenger.last_name}</span>
                                                <span>{new Date(passenger.date_of_birth).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                <span>{formatPhone(passenger.phone)}</span>
                                            </p>
                                        </li>
                                    </ul>
                                ))}
                            </div>
                        </div>
                    </div>

                    {data.status !== 'cancelled' && (
                        <div className="footer">
                            <button type="button" onClick={() => this.props.setTripStatus(id, 'cancelled')}>Скасувати поїздку</button>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default TripDetailsModal