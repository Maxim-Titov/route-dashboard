import React from "react"
import { X } from 'lucide-react'

import { formatPhone } from "../../utils/formatPhoneNumber"

class PassengerDetailsModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tripsList: []
        }
    }

    async componentDidMount() {
        await this.fetchPassengerTrips()
    }

    fetchPassengerTrips = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/passengers/trips`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        passenger_id: this.props.id
                    })
                }
            )

            const data = await res.json()

            this.setState({
                tripsList: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    calculateAge = (dateString) => {
        if (!dateString) return null

        const birthDate = new Date(dateString)
        const today = new Date()

        let age = today.getFullYear() - birthDate.getFullYear()

        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }

        return age
    }

    formatTimeFromSeconds = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }

    generateRightForm = (num) => {
        if (num % 10 == 1) {
            return "рік"
        } else if (num % 10 >= 2 && num % 10 <= 4) {
            return "роки"
        } else {
            return "років"
        }
    }

    render() {
        const { data } = this.props

        return (
            <div className="modal-wrapper">
                <div className="passenger-details-modal">
                    <div className="header">
                        <div className="title">
                            <h2>#{this.props.id} {data.name} {data.surname}</h2>
                            <p>{new Date(data.dateOfBirth).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) || 'Не вказано'} <span className="age">({this.calculateAge(data.dateOfBirth)} {this.generateRightForm(this.calculateAge(data.dateOfBirth))})</span></p>
                        </div>


                        <div className="icon-wrapper close" onClick={() => this.props.setRenderPassengerDetailsModal(false)}>
                            <X />
                        </div>
                    </div>

                    <div className="body">
                        <div className="passenger-info-card">
                            <div className="title">
                                <p>Про пасажира</p>
                            </div>

                            <div className="info">
                                <p><span className="label">Телефон:</span> {formatPhone(data.phone) || 'Не вказано'}</p>
                            </div>
                        </div>

                        <div className="note-card">
                            <div className="title">
                                <p>Замітка</p>
                            </div>

                            <div className="info">
                                <p>{data.note || 'Не вказано'}</p>
                            </div>
                        </div>

                        <div className="trips-card">
                            <div className="title">
                                <p>Поїздки</p>
                            </div>

                            <div className="info">
                                {this.state.tripsList.length === 0 ? (
                                    <p>Поїздок немає</p>
                                ) : (
                                    <ul>
                                        {this.state.tripsList.map((trip, index) => (
                                            <li key={index}>
                                                <p>
                                                    <span className="id">#{trip.id}</span> <span className="trip-route">{trip.city_from} ➝ {trip.city_to}</span>
                                                </p>
                                                <p className="date">{new Date(trip.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                <p className="time">{this.formatTimeFromSeconds(trip.time)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PassengerDetailsModal