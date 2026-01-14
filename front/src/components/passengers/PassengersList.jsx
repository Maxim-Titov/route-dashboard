import React from "react"
import { Edit2, Trash2 } from 'lucide-react'

import EditPassengerModal from "../modals/EditPaasengerModal"
import DeletePassengerModal from "../modals/DeletePassengerModal"

import { formatPhone } from "../../utils/formatPhoneNumber"

class PassengersList extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            renderDeletePassengerModal: false,
            renderEditPassengerModal: false,
            passengerId: null,
            passengerName: null,
            passengerData: {
                name: '',
                surname: '',
                phone: '',
                dateOfBirth: '',
                note: ''
            },
        }
    }

    deletePassenger = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/passengers/delete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        passenger_id: id
                    })
                }
            )

            const data = await res.json()
            return data
        } catch (err) {
            console.error(err)
        }
    }

    onDelete = async (id) => {
        await this.deletePassenger(id)
        await this.props.fetchPassengers()
        await this.props.fetchTripsCount()
        await this.props.fetchPassengersCount()
    }

    setRenderDeletePassengerModal = (value) => {
        this.setState({ renderDeletePassengerModal: value })
    }

    setRenderEditPassengerModal = (value) => {
        this.setState({ renderEditPassengerModal: value })
    }

    setPassenger = (id, name, data) => {
        this.setState({
            passengerId: id,
            passengerName: name,
            passengerData: data
        })
    }
    
    render() {
        const { passengersList, searchQuery, generateRightForm, fetchPassengers } = this.props;

        // Визначаємо, кого показувати: всі пасажири або відфільтровані
        const passengersToShow = (searchQuery && searchQuery.length > 0)
            ? passengersList.filter((passenger) =>
                searchQuery.some((q) => q.id === passenger.id)
            )
            : passengersList;

        const passengers = passengersToShow.map((passenger) => ({
            id: passenger.id,
            name: passenger.name,
            surname: passenger.surname,
            tripsCount: passenger.trips_count,
            phone: passenger.phone,
            dateOfBirth: passenger.date_of_birth,
            note: passenger.note
        }));

        return (
            <div className={`passengers-list ${this.props.viewType}`}>
                {passengers.map((passenger, index) => (
                    <div className="card" key={index}>
                        <div className="header">
                            <div className="info">
                                <p className="full-name">
                                    <span className="name">{passenger.name}</span> <span className="surname">{passenger.surname}</span>
                                </p>
                                <p className="trips-count">{passenger.tripsCount} {generateRightForm(passenger.tripsCount)}</p>
                            </div>

                            <div className="actions">
                                <div className="icon-wrapper edit" onClick={() => {
                                    this.setPassenger(
                                        passenger.id,
                                        `${passenger.name} ${passenger.surname}`,
                                        {
                                            name: passenger.name,
                                            surname: passenger.surname,
                                            phone: passenger.phone,
                                            dateOfBirth: passenger.dateOfBirth,
                                            note: passenger.note
                                        }
                                    );
                                    this.setRenderEditPassengerModal(true);
                                }}>
                                    <Edit2 />
                                </div>

                                <div className="icon-wrapper trash" onClick={() => {
                                    this.setPassenger(
                                        passenger.id,
                                        `${passenger.name} ${passenger.surname}`,
                                        {
                                            name: passenger.name,
                                            surname: passenger.surname,
                                            phone: passenger.phone,
                                            dateOfBirth: passenger.dateOfBirth,
                                            note: passenger.note
                                        }
                                    );
                                    this.setRenderDeletePassengerModal(true);
                                }}>
                                    <Trash2 />
                                </div>
                            </div>
                        </div>

                        <div className="content">
                            <div className="details">
                                <p><span>Телефон:</span> {formatPhone(passenger.phone)}</p>
                                <p><span>Дата народження:</span> <span>{new Date(passenger.dateOfBirth).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                            </div>

                            {passenger.note && (
                                <div className="note">
                                    <p className="note-title">Замітка:</p>
                                    <p className="note-text">{passenger.note}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {this.state.renderEditPassengerModal && (
                    <EditPassengerModal
                        setRenderEditPassengerModal={this.setRenderEditPassengerModal}
                        passengerId={this.state.passengerId}
                        passengerData={this.state.passengerData}
                        fetchPassengers={fetchPassengers}
                    />
                )}

                {this.state.renderDeletePassengerModal && (
                    <DeletePassengerModal
                        setRenderDeletePassengerModal={this.setRenderDeletePassengerModal}
                        passengerId={this.state.passengerId}
                        passengerName={this.state.passengerName}
                        onDelete={this.onDelete}
                    />
                )}
            </div>
        )
    }
}

export default PassengersList