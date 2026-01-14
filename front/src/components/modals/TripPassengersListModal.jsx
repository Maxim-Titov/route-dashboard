import React from "react"
import { Save, X } from 'lucide-react'

import SearchPanel from "../SearchPanel"
import MessageModal from "./MessageModal"

class TripPassengersListModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tempPassengers: [...props.passengers],
            tempMaxPassengers: props.maxPassengers || '',
            isError: false
        }

        this.formRef = React.createRef()
    }

    setIsError = (value) => {
        this.setState({ isError: value })
    }

    handleMaxPassengersChange = (e) => {
        this.setState({ tempMaxPassengers: e.target.value })
    }

    handlePassengerSelect = (passenger) => {
        this.setState(prev => {
            if (
                prev.tempPassengers.find(p => p.id === passenger.id) ||
                prev.tempPassengers.length >= prev.tempMaxPassengers
            ) return prev

            return {
                tempPassengers: [...prev.tempPassengers, passenger]
            }
        })
    }

    removePassenger = (id) => {
        this.setState(prev => ({
            tempPassengers: prev.tempPassengers.filter(p => p.id !== id)
        }))
    }

    onSave = () => {
        const maxPassengersCount = !this.state.tempMaxPassengers ? '0' : this.state.tempMaxPassengers

        if (maxPassengersCount < this.state.tempPassengers.length ) {
            this.setIsError(true)
            return
        }

        this.props.onSave({
            passengers: this.state.tempPassengers,
            maxPassengers: maxPassengersCount
        })
    }

    render() {
        const maxPassengersCount = !this.state.tempMaxPassengers ? 0 : this.state.tempMaxPassengers

        return (
            <>
                {this.state.isError && <MessageModal header='Пасажирів забагато' body={`Пасажирів більше ніж зазначено в полі "Максимум пасажирів" (${maxPassengersCount})`} action={this.setIsError}/>}

                <div className="additional-modal-wrapper">
                    <div className="trip-passenger-list-modal">
                        <div className="header">
                            <h2>Пасажири</h2>
                        </div>

                        <div className="body">
                            <form id="passengers-list">
                                <div className="form-group">
                                    <label htmlFor="maxPassengers">Максимум пасажирів</label>
                                    <input
                                        className={`inter-font`}
                                        onChange={this.handleMaxPassengersChange}
                                        value={this.state.tempMaxPassengers}
                                        type="number"
                                        name="maxPassengers"
                                        id="max-passengers"
                                        placeholder="6"
                                    />
                                </div>

                                <div className={`form-group search ${maxPassengersCount > 0 ? 'active' : ''}`}>
                                    <SearchPanel onSelect={this.handlePassengerSelect} />

                                    {this.state.tempPassengers.length > 0 && (
                                        <ul className="selected-passengers">
                                            {this.state.tempPassengers.map(p => (
                                                <li key={p.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => this.removePassenger(p.id)}
                                                    >
                                                        <X />
                                                    </button>
                                                    <span>{p.first_name} {p.last_name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="footer">
                            <button
                                    className="no inter-font"
                                    type="button"
                                    onClick={() => this.props.setIsRenderTripPassengersModal(false)}
                                >
                                    <p>Скасувати</p>
                                </button>

                                <button
                                    className="yes inter-font"
                                    type="button"
                                    onClick={this.onSave}
                                >
                                    <Save />
                                    <p>Зберегти</p>
                                </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default TripPassengersListModal