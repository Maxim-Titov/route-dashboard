import React from "react"
import { Save, X, Plus } from 'lucide-react'

import MessageModal from "./MessageModal"
import CitySearchInput from "../CitySearchInput"
import StationSearchInput from "../StationSearchInput"

class TripStationsListModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tempStations: props.stations?.length
                ? props.stations
                : [{ city_id: null, city: '', station_id: null, station: '', order: 1 }],
            resultsList: {},
            isError: false
        }
    }

    setIsError = (value) => {
        this.setState({ isError: value })
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

    searchCities = async (index, query) => {
        if (!query || query.length < 2) {
            this.setState(prev => ({
                resultsList: { ...prev.resultsList, [index]: [] }
            }))
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/cities/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ q: query })
            })

            const data = await res.json()

            this.setState(prev => ({
                resultsList: { ...prev.resultsList, [index]: data }
            }))
        } catch (err) {
            console.error(err)
            this.setState(prev => ({
                resultsList: { ...prev.resultsList, [index]: [] }
            }))
        }
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

    addStationInput = () => {
        this.setState(prev => ({
            tempStations: [
                ...prev.tempStations,
                { city_id: null, city: '', station_id: null, station: '', order: prev.tempStations.length + 1 }
            ]
        }))
    }

    removeStation = (index) => {
        this.setState(prev => ({
            tempStations: prev.tempStations.filter((_, i) => i !== index)
        }))
    }

    onSave = () => {
        const invalid = this.state.tempStations.some(
            s => !s.city_id || !s.station_id
        )

        if (invalid) {
            this.setIsError(true)
            return
        }

        this.props.onSave(
            this.state.tempStations.map((s, i) => ({
                ...s,
                order: i + 1
            }))
        )
    }

    render() {
        return (
            <>
                {this.state.isError && (
                    <MessageModal
                        header="Невірна станція"
                        body="Є введені станції, яких нема в базі"
                        action={this.setIsError}
                    />
                )}

                <div className="additional-modal-wrapper">
                    <div className="trip-station-list-modal">
                        <div className="header">
                            <h2>Зупинки</h2>
                        </div>

                        <div className="body">
                            <form id="stations-list">
                                {this.state.tempStations.map((station, index) => (
                                    <div className="form-group" key={index}>
                                        <label htmlFor="city">Місто {index + 1}</label>

                                        <div className="row">
                                            <div>
                                                <div className="search-input">
                                                    <CitySearchInput
                                                        value={station.city}
                                                        placeholder="Місто"
                                                        onChange={(v) => this.handleCityChange(index, v)}
                                                        onSelect={(city) => this.handleCitySelect(index, city)}
                                                    />
                                                </div>

                                                <div className="search-input">
                                                    <StationSearchInput
                                                        cityId={station.city_id}
                                                        value={station.station || station.station_name}
                                                        placeholder="Станція"
                                                        disabled={!station.city_id}
                                                        onSelect={(s) => this.handleStationSelect(index, s)}
                                                        onChange={(v) => this.handleStationChange(index, v)}
                                                    />
                                                </div>
                                            </div>

                                            {this.state.tempStations.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="remove-button"
                                                    onClick={() => this.removeStation(index)}
                                                >
                                                    <X />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button className="add-button" type="button" onClick={this.addStationInput}>
                                    <Plus />
                                    <span>Додати зупинку</span>
                                </button>
                            </form>
                        </div>

                        <div className="footer">
                            <button
                                className="no inter-font"
                                type="button"
                                onClick={() => this.props.setIsRenderTripStationsModal(false)}
                            >
                                <p>Скасувати</p>
                            </button>

                            <button
                                className="yes inter-font"
                                type="button"
                                onClick={this.onSave}
                            >
                                <Save /><p>Зберегти</p>
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default TripStationsListModal
