import React from "react"
import { Save, X, Plus } from 'lucide-react'

import MessageModal from "./MessageModal"

class TripStationsListModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tempStations: props.stations?.length ? [...props.stations] : [{ id: null, city: '' }],
            resultsList: {},
            isError: false
        }
    }

    setIsError = (value) => {
        this.setState({ isError: value })
    }

    handleStationChange = (index, value) => {
        this.setState(prev => {
            const tempStations = [...prev.tempStations]
            tempStations[index] = { id: null, city: value } // id скидаємо, бо користувач щось пише
            return { tempStations }
        })
        this.searchCities(index, value)
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

    handleSelect = (index, city) => {
        console.log(city)

        this.setState(prev => {
            const tempStations = [...prev.tempStations]
            tempStations[index] = city // {id, city, order}
            return {
                tempStations,
                resultsList: { ...prev.resultsList, [index]: [] }
            }
        })
    }

    addStationInput = () => {
        this.setState(prev => ({
            tempStations: [...prev.tempStations, { id: null, city: '' }]
        }))
    }

    removeStation = (index) => {
        this.setState(prev => ({
            tempStations: prev.tempStations.filter((_, i) => i !== index),
            resultsList: Object.fromEntries(
                Object.entries(prev.resultsList).filter(([k]) => Number(k) !== index)
            )
        }))
    }

    onSave = () => {
        // перевірка: всі станції повинні мати id
        const invalid = this.state.tempStations.filter(s => !s.id || !s.city.trim())
        if (invalid.length > 0) {
            this.setIsError(true)
            return
        }

        this.props.onSave(this.state.tempStations)
    }

    render() {
        console.log(this.state.tempStations)

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
                                            <div className="search-input">
                                                <input
                                                    type="text"
                                                    className="inter-font"
                                                    placeholder={`Зупинка ${index + 1}`}
                                                    value={station.city}
                                                    onChange={(e) => this.handleStationChange(index, e.target.value)}
                                                    name="city"
                                                    id="city"
                                                />

                                                {this.state.resultsList[index]?.length > 0 && (
                                                    <ul className="autocomplete-dropdown">
                                                        {this.state.resultsList[index].map(city => (
                                                            <li key={city.id} onClick={() => this.handleSelect(index, { ...city, order: index + 1 })}>
                                                                {city.city}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            {this.state.tempStations.length > 1 && (
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
