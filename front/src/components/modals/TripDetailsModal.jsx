import React from "react"
import { X, Clock, Users, MapPin, GitCommitVertical, MapPinCheckInside } from 'lucide-react'

import SetDriverModal from "./SetDriverModal"
import TicketModal from "./TicketModal"

import { formatPhone } from "../../utils/formatPhoneNumber"

class TripDetailsModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            renderSetDriverModal: false,
            renderTicketModal: false,
            ticketData: {
                "passenger": "",
                "data": "",
                "from_station": "",
                "price": 0
            }
        }
    }

    setDriver = async (driver) => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/users/set`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        user_id: driver,
                        trip_id: this.props.id
                    })
                }
            )

            if (res.status === 401) {
                const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include"
                })

                if (!refreshRes.ok) {
                    return null
                }

                const data = await refreshRes.json()
                localStorage.setItem("token", data.access_token)

                res = await fetch(
                    `${import.meta.env.VITE_API_URL}/users/set`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            user_id: driver,
                            trip_id: this.props.id
                        })
                    }
                )
            }

            const data = await res.json()

            return data
        } catch (err) {
            console.error(err)
        }
    }

    getPrice = async (passanger_id, city_id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/ticket/price`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        trip_id: this.props.id,
                        passanger_id: passanger_id,
                        city_id: city_id
                    })
                }
            )

            const data = await res.json()

            return data
        } catch (err) {
            console.error(err)
        }
    }

    writeToJournal = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/journal/write`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: this.props.user?.id,
                        entity_type: 'trips',
                        action: 'edit',
                        description: `Видалення водія "${this.props.data?.user_name} ${this.props.data?.user_surname}" для поїздки "${this.props.name}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    setRenderSetDriverModal = (value) => {
        this.setState({ renderSetDriverModal: value })
    }

    setRenderTicketModal = (value) => {
        this.setState({ renderTicketModal: value })
    }

    setTicketData = (passanger, data, from_station, price) => {
        this.setState({
            ticketData: {
                "passenger": passanger,
                "data": data,
                "from_station": from_station,
                "price": price
            }
        })
    }

    render() {
        const { id, name, data } = this.props

        return (
            <div className="modal-wrapper">
                {this.state.renderSetDriverModal && (
                    <SetDriverModal user={this.props.user} tripId={id} tripName={name} setDriver={this.setDriver} setRenderSetDriverModal={this.setRenderSetDriverModal} setRenderTripDetailsModal={this.props.setRenderTripDetailsModal} fetchTrips={this.props.fetchTrips} />
                )}

                {this.state.renderTicketModal && (
                    <TicketModal ticketData={this.state.ticketData} formatTimeFromSeconds={this.props.formatTimeFromSeconds} setRenderTicketModal={this.setRenderTicketModal} />
                )}

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
                                <p>{data.from} <span>{data.from_station_name} ({data.from_station_address})</span></p>
                            </div>

                            <div className="stations">
                                {data.stations.map((station, index) => (
                                    <div key={index} className="station">
                                        <GitCommitVertical />
                                        <p>{station.city} <span>{station.station_name} ({station.station_address})</span></p>
                                    </div>
                                ))}
                            </div>

                            <div className="to">
                                <MapPinCheckInside />
                                <p>{data.to} <span>{data.to_station_name} ({data.to_station_address})</span></p>
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
                                                <span>{formatPhone(passenger.phone)}</span>

                                                <button className="inter-font" onClick={async () => {
                                                    const from_station = data.passengerStations[index]
                                                    const price = await this.getPrice(passenger.id, data.passengerStations[index].city_id)
                                                    this.setTicketData(passenger, data, from_station, price)
                                                    this.setRenderTicketModal(true)

                                                }}>Квиток</button>
                                            </p>
                                        </li>
                                    </ul>
                                ))}
                            </div>
                        </div>

                        <div className="user-card">
                            <div className="title">
                                <p>Водій</p>
                            </div>

                            <div className="user-info">
                                {data.user_name && data.user_surname && data.user_login ? (
                                    <div className="driver">
                                        <p>{data.user_name} {data.user_surname} <span className="login">({data.user_login})</span></p>
                                        <X size={18} className="unset" onClick={async () => {
                                            await this.setDriver(0)
                                            await this.writeToJournal()
                                            await this.props.fetchTrips()

                                            this.props.setRenderTripDetailsModal(false)
                                        }} />
                                    </div>
                                ) : (
                                    <button className={this.props.user?.role === 'user' ? 'forbidden' : ''} type="button" onClick={() => this.setRenderSetDriverModal(true)}>Призначити водія</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {data.status !== 'cancelled' && (
                        <div className="footer">
                            <button className={this.props.user?.role === 'user' ? 'forbidden' : ''} type="button" onClick={() => this.props.setTripStatus(id, 'cancelled')}>Скасувати поїздку</button>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default TripDetailsModal