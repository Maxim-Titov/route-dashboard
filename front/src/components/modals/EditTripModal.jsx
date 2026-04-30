import React from "react"
import { Save } from 'lucide-react'

import TripPassengersListModal from "./TripPassengersListModal"
import TripStationsListModal from "./TripStationsListModal"
import MessageModal from "./MessageModal"
import CitySearchInput from "../CitySearchInput"
import StationSearchInput from "../StationSearchInput"

class EditTripModal extends React.Component {
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
                stations: [],
                status: 'planned'
            },

            errors: {},
            isRenderTripPassengersModal: false,
            isRenderTripStationsModal: false,
            isFail: false,
            failMessage: ''
        }
    }

    async componentDidMount() {
        const tripData = { ...this.props.data }

        const fromCity = await this.searchCityByName(tripData.from)
        const toCity = await this.searchCityByName(tripData.to)

        tripData.from = fromCity?.city || ''
        tripData.from_id = fromCity?.id || null

        tripData.to = toCity?.city || ''
        tripData.to_id = toCity?.id || null

        const fromStation = await this.searchStationByName(
            tripData.from_id,
            this.props.data.from_station_name
        )

        const toStation = await this.searchStationByName(
            tripData.to_id,
            this.props.data.to_station_name
        )

        tripData.from_station = fromStation?.station_name || this.props.data.from_station_name || ''
        tripData.from_station_id = fromStation?.id || null

        tripData.to_station = toStation?.station_name || this.props.data.to_station_name || ''
        tripData.to_station_id = toStation?.id || null

        tripData.stations = await this.formatStations(tripData.stations)

        this.setState({ tripData })
    }

    searchCityByName = async (name) => {
        if (!name) return null
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/cities/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ q: name })
            })

            const data = await res.json()
            return data?.[0] || null
        } catch (e) {
            console.error(e)
            return null
        }
    }

    searchStationByName = async (cityId, name) => {
        if (!cityId || !name) return null

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/cities/search/station`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        city_id: cityId,
                        q: name
                    })
                }
            )

            const data = await res.json()
            return data?.[0] || null
        } catch (e) {
            console.error(e)
            return null
        }
    }

    editTrip = async () => {
        try {
            let res = await fetch(`${import.meta.env.VITE_API_URL}/trips/edit`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    trip_id: this.props.id,
                    city_from: this.state.tripData.from_id,
                    city_to: this.state.tripData.to_id,
                    from_station_id: this.state.tripData.from_station_id,
                    to_station_id: this.state.tripData.to_station_id,
                    date: this.state.tripData.date,
                    time: this.state.tripData.time,
                    max_passengers: this.parseNumber(this.state.tripData.maxPassengers),
                    passenger_ids: this.state.tripData.passengers.map(p => p.id),
                    passenger_stations: this.state.tripData?.passengerStations,
                    stations: this.state.tripData.stations,
                    status: this.state.tripData.status
                })
            })

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

                res = await fetch(`${import.meta.env.VITE_API_URL}/trips/edit`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        trip_id: this.props.id,
                        city_from: this.state.tripData.from_id,
                        city_to: this.state.tripData.to_id,
                        from_station_id: this.state.tripData.from_station_id,
                        to_station_id: this.state.tripData.to_station_id,
                        date: this.state.tripData.date,
                        time: this.state.tripData.time,
                        max_passengers: this.parseNumber(this.state.tripData.maxPassengers),
                        passenger_ids: this.state.tripData.passengers.map(p => p.id),
                        passenger_stations: this.state.tripData?.passengerStations,
                        stations: this.state.tripData.stations,
                        status: this.state.tripData.status
                    })
                })
            }

            const data = await res.json()

            if (!data.success) {
                this.setState({ isFail: true, failMessage: data.message })
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
                        action: 'edit',
                        description: `Редагування поїздки "#${this.props.id} ${this.state.tripData.from} → ${this.state.tripData.to}"`
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

    formatStations = async (stations) => {
        if (!stations || !Array.isArray(stations)) return []

        const formatted = []

        for (let i = 0; i < stations.length; i++) {
            const city = await this.searchCityByName(stations[i].city)
            const station = await this.searchStationByName(city?.id, stations[i].station_name)

            formatted.push({
                city_id: city?.id || null,
                city: stations[i].city,
                station_id: station?.id,
                station: stations[i].station_name ?? null,
                order: i + 1
            })
        }

        return formatted
    }

    validateForm = () => {
        const errors = {}

        if (!this.state.tripData.from_id) errors.from = true
        if (!this.state.tripData.to_id) errors.to = true
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
            tripData: { ...prev.tripData, stations },
            isRenderTripStationsModal: false
        }))
    }

    onEdit = async () => {
        if (!this.validateForm()) return

        const data = await this.editTrip()
        if (!data.success) return

        await Promise.all([
            this.writeToJournal(),
            this.props.fetchRoutes(),
            this.props.fetchRoutesCount(),
            this.props.fetchTrips(),
            this.props.fetchTripsCount(),
            this.props.fetchPassengers(),
            this.props.fetchPassengersCount(),
        ])

        this.props.setRenderEditTripModal(false)
    }

    render() {
        const { tripData, errors } = this.state

        return (
            <>
                {this.state.isRenderTripPassengersModal && (
                    <TripPassengersListModal
                        passengers={tripData.passengers}
                        maxPassengers={tripData.maxPassengers}
                        passengerStations={tripData.passengerStations}
                        onSave={this.applyPassengersData}
                        setIsRenderTripPassengersModal={(v) => this.setState({ isRenderTripPassengersModal: v })}
                    />
                )}

                {this.state.isRenderTripStationsModal && (
                    <TripStationsListModal
                        stations={tripData.stations}
                        onSave={this.applyStationsData}
                        setIsRenderTripStationsModal={(v) => this.setState({ isRenderTripStationsModal: v })}
                    />
                )}

                {this.state.isFail && (
                    <MessageModal
                        header="Невідомий маршрут"
                        body={this.state.failMessage}
                        action={(v) => this.setState({ isFail: v })}
                    />
                )}

                <div className="modal-wrapper">
                    <div className="add-trip-modal">
                        <div className="header">
                            <h2>Редагувати поїздку</h2>
                        </div>

                        <div className="body">
                            <form id="trip-info">

                                <div className="form-group">
                                    <label>Вирушаємо з <span>*</span></label>
                                    <CitySearchInput
                                        value={tripData.from}
                                        placeholder="Луцьк"
                                        className={`inter-font ${errors.from ? 'not-valid' : ''}`}
                                        onChange={(v) => this.setState(prev => ({
                                            tripData: {
                                                ...prev.tripData,
                                                from: v,
                                                from_id: null,
                                                from_station: '',
                                                from_station_id: null
                                            }
                                        }))}
                                        onSelect={(city) => this.setState(prev => ({
                                            tripData: { ...prev.tripData, from: city.city, from_id: city.id }
                                        }))}
                                    />

                                    <StationSearchInput
                                        cityId={tripData.from_id}
                                        value={tripData.from_station}
                                        placeholder="Зупинка відправлення"
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
                                    <label>Прибуваємо до <span>*</span></label>
                                    <CitySearchInput
                                        value={tripData.to}
                                        placeholder="Варшава"
                                        className={`inter-font ${errors.to ? 'not-valid' : ''}`}
                                        onChange={(v) => this.setState(prev => ({
                                            tripData: {
                                                ...prev.tripData,
                                                to: v,
                                                to_id: null,
                                                to_station: '',
                                                to_station_id: null
                                            }
                                        }))}
                                        onSelect={(city) => this.setState(prev => ({
                                            tripData: { ...prev.tripData, to: city.city, to_id: city.id }
                                        }))}
                                    />

                                    <StationSearchInput
                                        cityId={tripData.to_id}
                                        value={tripData.to_station}
                                        placeholder="Зупинка прибуття"
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

                                <div className="form-group">
                                    <label>Статус</label>
                                    <select
                                        className="inter-font"
                                        value={tripData.status}
                                        onChange={(e) => this.setState(prev => ({
                                            tripData: { ...prev.tripData, status: e.target.value }
                                        }))}
                                    >
                                        <option value="planned">Заплановано</option>
                                        <option value="active">В дорозі</option>
                                        <option value="completed">Завершено</option>
                                        <option value="cancelled">Скасовано</option>
                                    </select>
                                </div>

                                <div className="form-group row">
                                    <div>
                                        <label>День виїзду <span>*</span></label>
                                        <input
                                            type="date"
                                            className={`inter-font ${errors.date ? 'not-valid' : ''}`}
                                            value={tripData.date}
                                            onChange={(e) => this.setState(prev => ({
                                                tripData: { ...prev.tripData, date: e.target.value }
                                            }))}
                                        />
                                    </div>

                                    <div>
                                        <label>Час виїзду <span>*</span></label>
                                        <input
                                            type="time"
                                            className={`inter-font ${errors.time ? 'not-valid' : ''}`}
                                            value={tripData.time}
                                            onChange={(e) => this.setState(prev => ({
                                                tripData: { ...prev.tripData, time: e.target.value }
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Пасажири</label>
                                    <button type="button" onClick={() => this.setState({ isRenderTripPassengersModal: true })}>
                                        Список пасажирів
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label>Зупинки</label>
                                    <button type="button" onClick={() => this.setState({ isRenderTripStationsModal: true })}>
                                        Список зупинок
                                    </button>
                                </div>

                            </form>
                        </div>

                        <div className="footer">
                            <button className="no" onClick={() => this.props.setRenderEditTripModal(false)}>
                                Скасувати
                            </button>

                            <button className="yes" onClick={this.onEdit}>
                                <Save /> Зберегти
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default EditTripModal
