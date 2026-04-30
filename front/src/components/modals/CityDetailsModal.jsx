import React from "react"
import { X, Plus, Trash2, Save } from "lucide-react"

import MessageModal from "./MessageModal"

class CityDetailsModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            stationsList: [],
            renderMessageModal: false,
            message: ''
        }
    }

    async componentDidMount() {
        await this.fetchStations()
    }

    fetchStations = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/cities/stations`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        city_id: this.props.cityId
                    })
                }
            )

            const data = await res.json()

            if (!data.success) {
                return
            }

            this.setState({
                stationsList: data.stations
            })
        } catch (err) {
            console.error(err)
        }
    }

    updateStations = async () => {
        const cleanedStations = this.state.stationsList.filter(station =>
            station.station_name.trim() !== "" ||
            station.station_address.trim() !== ""
        )

        this.setState({ stationsList: cleanedStations })

        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/cities/stations/update`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        city_id: this.props.cityId,
                        stations: this.state.stationsList
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
                    `${import.meta.env.VITE_API_URL}/cities/stations/update`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            city_id: this.props.cityId,
                            stations: this.state.stationsList
                        })
                    }
                )
            }

            const data = await res.json()

            this.setState({
                renderMessageModal: true,
                message: data.message
            })
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
                        entity_type: 'cities',
                        action: 'edit',
                        description: `Оновлення зупинок для міста "${this.props.cityName}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    setRenderMessageModal = (value) => {
        this.setState({ renderMessageModal: value })
    }

    handleChange = (i, field, value) => {
        const stationsList = [...this.state.stationsList]
        stationsList[i] = { ...stationsList[i], [field]: value }
        this.setState({ stationsList })
    }

    addStation = async () => {
        this.setState({
            stationsList: [
                ...this.state.stationsList,
                { id: null, station_name: "", station_address: "" }
            ]
        })
    }

    removeStation = (i) => {
        const stationsList = this.state.stationsList.filter((_, idx) => idx !== i)
        this.setState({ stationsList })
    }

    renderMessageModal = () => {
        switch (this.state.message) {
            case 'stations updated':
                return <MessageModal header="Збережено" body="Зупинки міста успішно оновлено" action={this.setRenderMessageModal} />
            case 'city not found':
                return <MessageModal header='Місто не знайдено' body='Такого міста не існує в базі' action={this.setRenderMessageModal} />
        }
    }

    render() {
        return (
            <div className="modal-wrapper">
                <div className="city-details-modal">
                    <div className="header">
                        <h2>{this.props.cityName}</h2>
                        <div className="icon-wrapper close"
                            onClick={() => this.props.setRenderCityDetailsModal(false)}>
                            <X />
                        </div>
                    </div>

                    <div className="body">
                        <div className="stations-card">
                            <div className="title">
                                <p>Зупинки</p>
                            </div>

                            <div className="info">
                                <ol>
                                    {this.state.stationsList.map((station, index) => (
                                        <li key={index}>
                                            <div className="stop-row">
                                                <div className="stop-info">
                                                    <input
                                                        name="name"
                                                        placeholder="Назва"
                                                        value={station.station_name}
                                                        onChange={e =>
                                                            this.handleChange(index, "station_name", e.target.value)
                                                        }
                                                    />

                                                    <input
                                                        name="address"
                                                        placeholder="Адреса"
                                                        value={station.station_address}
                                                        onChange={e =>
                                                            this.handleChange(index, "station_address", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <button
                                                    className="icon-btn remove"
                                                    onClick={() => this.removeStation(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="footer">
                        <button className="inter-font add" onClick={this.addStation}>
                            <Plus size={16} />
                            <p>Додати</p>
                        </button>

                        <button className="inter-font save" onClick={async () => {
                            await this.updateStations()
                            await this.writeToJournal()
                        }}>
                            <Save size={16} />
                            <p>Зберегти</p>
                        </button>
                    </div>
                </div>

                {this.state.renderMessageModal && (
                    this.renderMessageModal()
                )}
            </div>
        )
    }
}

export default CityDetailsModal
