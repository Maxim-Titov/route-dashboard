import React from "react"
import { Save, X } from 'lucide-react'

import SearchPanel from "../SearchPanel"
import MessageModal from "./MessageModal"
import CitySearchInput from "../CitySearchInput"
import StationSearchInput from "../StationSearchInput"

class TripPassengersListModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tempPassengers: [...props.passengers],
            tempStations: props.passengerStations || props.passengers.map(() => ({
                city_id: null,
                city: '',
                station_id: null,
                station: ''
            })),
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
                tempPassengers: [...prev.tempPassengers, passenger],
                tempStations: [
                    ...prev.tempStations,
                    { city_id: null, city: '', station_id: null, station: '' }
                ]
            }
        })
    }

    removePassenger = (id) => {
        this.setState(prev => {
            const index = prev.tempPassengers.findIndex(p => p.id === id)

            return {
                tempPassengers: prev.tempPassengers.filter(p => p.id !== id),
                tempStations: prev.tempStations.filter((_, i) => i !== index)
            }
        })
    }

    handleCityChange = (index, value) => {
        this.setState(prev => {
            const tempStations = [...prev.tempStations]
            tempStations[index] = {
                ...tempStations[index],
                city_id: null,
                city: value,
                station_id: null,
                station: ''
            }
            return { tempStations }
        })
    }

    handleStationChange = (index, value) => {
        this.setState(prev => {
            const tempStations = [...prev.tempStations]

            tempStations[index] = {
                ...tempStations[index],
                station: value,
                station_id: null
            }

            return { tempStations }
        })
    }

    handleCitySelect = (index, city) => {
        this.setState(prev => {
            const tempStations = [...prev.tempStations]
            tempStations[index] = {
                ...tempStations[index],
                city_id: city.id,
                city: city.city,
                station_id: null,
                station: ''
            }
            return { tempStations }
        })
    }

    handleStationSelect = (index, station) => {
        this.setState(prev => {
            const tempStations = [...prev.tempStations]
            tempStations[index] = {
                ...tempStations[index],
                station_id: station.id,
                station: station.station_name
            }
            return { tempStations }
        })
    }

    onSave = () => {
        const maxPassengersCount = !this.state.tempMaxPassengers ? '0' : this.state.tempMaxPassengers

        if (maxPassengersCount < this.state.tempPassengers.length) {
            this.setIsError(true)
            return
        }

        this.props.onSave({
            passengers: this.state.tempPassengers,
            stations: this.state.tempStations,
            maxPassengers: maxPassengersCount
        })
    }

    render() {
        const maxPassengersCount = !this.state.tempMaxPassengers ? 0 : this.state.tempMaxPassengers

        return (
            <>
                {this.state.isError && <MessageModal header='Пасажирів забагато' body={`Пасажирів більше ніж зазначено в полі "Максимум пасажирів" (${maxPassengersCount})`} action={this.setIsError} />}

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
                                            {this.state.tempPassengers.map((p, index) => {
                                                const station = this.state.tempStations[index]

                                                return (
                                                    <li key={p.id}>
                                                        <div className="name">
                                                            <button
                                                                type="button"
                                                                onClick={() => this.removePassenger(p.id)}
                                                            >
                                                                <X />
                                                            </button>
                                                            <span>{p.first_name} {p.last_name}</span>
                                                        </div>

                                                        <div className="data">
                                                            <CitySearchInput
                                                                value={station.city}
                                                                placeholder="Місто"
                                                                onChange={(v) => this.handleCityChange(index, v)}
                                                                onSelect={(city) => this.handleCitySelect(index, city)}
                                                            />

                                                            <StationSearchInput
                                                                cityId={station.city_id}
                                                                value={station.station}
                                                                placeholder="Станція"
                                                                disabled={!station.city_id}
                                                                onSelect={(s) => this.handleStationSelect(index, s)}
                                                                onChange={(v) => this.handleStationChange(index, v)}
                                                            />
                                                        </div>
                                                    </li>
                                                )
                                            })}
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