import React from "react"
import { Save } from 'lucide-react'

import TripPassengersListModal from "./TripPassengersListModal"
import TripStationsListModal from "./TripStationsListModal"
import MessageModal from "./MessageModal"

class AddTripModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tripData: {
                from: '',
                to: '',
                date: '',
                time: '',
                passengers: [],
                maxPassengers: '',
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
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/trips/add`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        city_from: this.state.tripData?.from,
                        city_to: this.state.tripData?.to,
                        date: this.state.tripData?.date,
                        time: this.state.tripData?.time,
                        max_passengers: this.parseNumber(this.state.tripData?.maxPassengers),
                        passenger_ids: this.state.tripData?.passengers.map(p => p.id),
                        stations: this.state.tripData?.stations
                    })
                }
            )

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

        if (!this.state.tripData.from) errors.from = true
        if (!this.state.tripData.to) errors.to = true
        if (!this.state.tripData.date) errors.date = true
        if (!this.state.tripData.time) errors.time = true

        this.setState({ errors })
        return Object.keys(errors).length === 0
    }

    applyPassengersData = ({ passengers, maxPassengers }) => {
        this.setState(prev => ({
            tripData: {
                ...prev.tripData,
                passengers,
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
                                    <input
                                        className={`inter-font ${errors.from ? 'not-valid' : ''}`}
                                        onChange={this.handleChange}
                                        value={tripData.from}
                                        type="text"
                                        name="from"
                                        id="from"
                                        placeholder="Луцьк"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="to">Прибуваємо до <span>*</span></label>
                                    <input
                                        className={`inter-font ${errors.to ? 'not-valid' : ''}`}
                                        onChange={this.handleChange}
                                        value={tripData.to}
                                        type="text"
                                        name="to"
                                        id="to"
                                        placeholder="Варшава"
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