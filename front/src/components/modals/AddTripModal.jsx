import React from "react"
import { Save } from 'lucide-react'

import TripPassengersListModal from "./TripPassengersListModal"
import TripStationsListModal from "./TripStationsListModal"
import MessageModal from "./MessageModal"
import CitySearchInput from "../CitySearchInput"
import StationSearchInput from "../StationSearchInput"

class AddTripModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tripData: {
                from: '',
                from_id: null,
                from_station: '',
                from_station_id: null,

                to: '',
                to_id: null,
                to_station: '',
                to_station_id: null,

                date: '',
                time: '',
                passengers: [],
                maxPassengers: '',
                passengerStations: [],
                stations: []
            },
            errors: {},
            isRenderTripPassengersModal: false,
            isRenderTripStationsModal: false,
            isFail: false,
            failMessage: ''
        }

        this.formRef = React.createRef()
    }

    addTrip = async () => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/trips/add`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        credentials: "include",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        city_from: this.state.tripData.from_id,
                        city_to: this.state.tripData.to_id,
                        from_station_id: this.state.tripData.from_station_id,
                        to_station_id: this.state.tripData.to_station_id,
                        date: this.state.tripData?.date,
                        time: this.state.tripData?.time,
                        max_passengers: this.parseNumber(this.state.tripData?.maxPassengers),
                        passenger_ids: this.state.tripData?.passengers.map(p => p.id),
                        passenger_stations: this.state.tripData?.passengerStations,
                        stations: this.state.tripData?.stations
                    })
                }
            )

            if (res.status === 401) {
                const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include"
                })

                if (!refreshRes.ok) {
                    context.logout()
                    return null
                }

                const data = await refreshRes.json()
                localStorage.setItem("token", data.access_token)

                res = await fetch(
                    `${import.meta.env.VITE_API_URL}/trips/add`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            city_from: this.state.tripData.from_id,
                            city_to: this.state.tripData.to_id,
                            from_station_id: this.state.tripData.from_station_id,
                            to_station_id: this.state.tripData.to_station_id,
                            date: this.state.tripData?.date,
                            time: this.state.tripData?.time,
                            max_passengers: this.parseNumber(this.state.tripData?.maxPassengers),
                            passenger_ids: this.state.tripData?.passengers.map(p => p.id),
                            passenger_stations: this.state.tripData?.passengerStations,
                            stations: this.state.tripData?.stations
                        })
                    }
                )
            }

            const data = await res.json()

            if (!data.success) {
                this.setState({
                    isFail: true,
                    failMessage: data.message
                })
            }

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
                        action: 'create',
                        description: `Додавання поїздки для маршруту "${this.state.tripData.from} → ${this.state.tripData.to}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    parseNumber = (v) =>
        v === '' || v === null ? null : Number(v)

    setIsFail = (value) => {
        this.setState({ isFail: value })
    }

    setFailMessage = (value) => {
        this.setState({ failMessage: value })
    }

    setIsRenderTripPassengersModal = (value) => {
        this.setState({ isRenderTripPassengersModal: value })
    }

    setIsRenderTripStationsModal = (value) => {
        this.setState({ isRenderTripStationsModal: value })
    }

    validateForm = () => {
        const errors = {}

        if (!this.state.tripData.from_id) errors.from = true
        if (!this.state.tripData.to_id) errors.to = true
        if (!this.state.tripData.from) errors.from = true
        if (!this.state.tripData.to) errors.to = true
        if (!this.state.tripData.from_station_id) errors.from_station = true
        if (!this.state.tripData.to_station_id) errors.to_station = true
        if (!this.state.tripData.date) errors.date = true
        if (!this.state.tripData.time) errors.time = true

        this.setState({ errors })
        return Object.keys(errors).length === 0
    }

    applyPassengersData = ({ passengers, stations, maxPassengers }) => {
        this.setState(prev => ({
            tripData: {
                ...prev.tripData,
                passengers,
                passengerStations: stations,
                maxPassengers
            },
            isRenderTripPassengersModal: false
        }))
    }

    applyStationsData = (stations) => {
        this.setState(prev => ({
            tripData: {
                ...prev.tripData,
                stations
            },
            isRenderTripStationsModal: false
        }))
    }

    onAdd = async () => {
        if (!this.validateForm()) return

        const data = await this.addTrip();

        if (!data.success) return;

        await this.writeToJournal()
        await this.props.fetchPassengers()
        await this.props.fetchTrips()
        await this.props.fetchTripsCount()

        this.props.setRenderTripsModal(false)
    }

    handleChange = (e) => {
        const { name, value } = e.target

        this.setState(prev => ({
            tripData: { ...prev.tripData, [name]: value },
            errors: { ...prev.errors, [name]: undefined }
        }))
    }

    render() {
        const { tripData, errors } = this.state

        return (
            <>
                {this.state.isRenderTripPassengersModal && <TripPassengersListModal
                    passengers={tripData.passengers}
                    maxPassengers={tripData.maxPassengers}
                    passengerStations={tripData.passengerStations}
                    onSave={this.applyPassengersData}
                    setIsRenderTripPassengersModal={this.setIsRenderTripPassengersModal}
                />}

                {this.state.isRenderTripStationsModal && <TripStationsListModal
                    stations={tripData.stations}
                    handleChange={this.handleChange}
                    onSave={this.applyStationsData}
                    setIsRenderTripStationsModal={this.setIsRenderTripStationsModal}
                />}

                {this.state.isFail && <MessageModal header='Невідомий маршрут' body='Такого маршруту не існує' action={this.setIsFail} />}

                <div className="modal-wrapper">
                    <div className="add-trip-modal">
                        <div className="header">
                            <h2>Додати поїздку</h2>
                        </div>

                        <div className="body">
                            <form id="trip-info">
                                <div className="form-group">
                                    <label htmlFor="from">Вирушаємо з <span>*</span></label>
                                    <CitySearchInput
                                        value={tripData.from}
                                        placeholder="Луцьк"
                                        className={`inter-font ${errors.from ? 'not-valid' : ''}`}
                                        onChange={(v) => this.setState(prev => ({
                                            tripData: { ...prev.tripData, from: v, from_id: null, from_station: '', from_station_id: null }
                                        }))}
                                        onSelect={(city) => this.setState(prev => ({
                                            tripData: { ...prev.tripData, from: city.city, from_id: city.id }
                                        }))}
                                    />

                                    <StationSearchInput
                                        cityId={tripData.from_id}
                                        value={tripData.from_station}
                                        placeholder="Зупинка відправлення"
                                        className={`inter-font ${tripData.from_id ? '' : 'forbidden'} ${errors.from_station ? 'not-valid' : ''}`}
                                        onChange={(v) => this.setState(prev => ({
                                            tripData: {
                                                ...prev.tripData,
                                                from_station: v,
                                                from_station_id: null
                                            }
                                        }))}
                                        onSelect={(s) => this.setState(prev => ({
                                            tripData: {
                                                ...prev.tripData,
                                                from_station: s.station_name,
                                                from_station_id: s.id
                                            }
                                        }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="to">Прибуваємо до <span>*</span></label>
                                    <CitySearchInput
                                        value={tripData.to}
                                        placeholder="Варшава"
                                        className={`inter-font ${errors.to ? 'not-valid' : ''}`}
                                        onChange={(v) => this.setState(prev => ({
                                            tripData: { ...prev.tripData, to: v, to_id: null, to_station: '', to_station_id: null }
                                        }))}
                                        onSelect={(city) => this.setState(prev => ({
                                            tripData: { ...prev.tripData, to: city.city, to_id: city.id }
                                        }))}
                                    />

                                    <StationSearchInput
                                        cityId={tripData.to_id}
                                        value={tripData.to_station}
                                        placeholder="Зупинка прибуття"
                                        className={`inter-font ${tripData.to_id ? '' : 'forbidden'} ${errors.to_station ? 'not-valid' : ''}`}
                                        onChange={(v) => this.setState(prev => ({
                                            tripData: {
                                                ...prev.tripData,
                                                to_station: v,
                                                to_station_id: null
                                            }
                                        }))}
                                        onSelect={(s) => this.setState(prev => ({
                                            tripData: {
                                                ...prev.tripData,
                                                to_station: s.station_name,
                                                to_station_id: s.id
                                            }
                                        }))}
                                    />
                                </div>

                                <div className="form-group row">
                                    <div>
                                        <label htmlFor="date">День виїзду <span>*</span></label>
                                        <input
                                            className={`inter-font ${errors.date ? 'not-valid' : ''}`}
                                            onChange={this.handleChange}
                                            value={tripData.date}
                                            type="date"
                                            name="date"
                                            id="date"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="time">Час виїзду <span>*</span></label>
                                        <input
                                            className={`inter-font ${errors.time ? 'not-valid' : ''}`}
                                            onChange={this.handleChange}
                                            value={tripData.time}
                                            type="time"
                                            name="time"
                                            id="time"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Пасажири</label>
                                    <button type="button" onClick={() => this.setIsRenderTripPassengersModal(true)}>
                                        Список пасажирів
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label>Зупинки</label>
                                    <button type="button" onClick={() => this.setIsRenderTripStationsModal(true)}>
                                        Список зупинок
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="footer">
                            <button
                                className="no inter-font"
                                type="button"
                                onClick={() => this.props.setRenderTripsModal(false)}
                            >
                                <p>Скасувати</p>
                            </button>

                            <button
                                className="yes inter-font"
                                type="button"
                                onClick={this.onAdd}
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

export default AddTripModal