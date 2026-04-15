import React from "react"
import { Save, Search } from "lucide-react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"

import MessageModal from "./MessageModal"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
})

class AddCityModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            city: "",
            lat: null,
            lng: null,

            isCityExists: false,
            isCityUnknown: false
        }
    }

    addCity = async () => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/cities/add`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        city: this.state.city
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
                    `${import.meta.env.VITE_API_URL}/cities/add`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            city: this.state.city
                        })
                    }
                )
            }

            return await res.json()
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
                        action: 'create',
                        description: `Додавання міста "${this.state.city}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    onAdd = async () => {
        if (!this.state.city) return

        const result = await this.addCity()

        if (result === "exists") {
            this.setState({ isCityExists: true })
            return
        }

        if (result === "unknown") {
            this.setState({ isCityUnknown: true })
            return
        }

        await this.writeToJournal()
        await this.props.fetchCities()
        await this.props.fetchCitiesCount()

        this.props.setRenderCitiesModal(false)
    }

    setCityFromMap = async (lat, lng) => {
        this.setState({ lat, lng })

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uk`
            )
            const data = await res.json()

            const city =
                data.address.city ||
                data.address.town ||
                data.address.village

            if (city) {
                this.setState({ city })
            }
        } catch (err) {
            console.error(err)
        }
    }

    searchCity = async () => {
        if (!this.state.city) return

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.state.city)}&limit=1&accept-language=uk`
            )

            const data = await res.json()

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0]

                this.setState({
                    lat: parseFloat(lat),
                    lng: parseFloat(lon),
                    city: display_name.split(",")[0] // тільки назва міста
                })
            } else {
                this.setState({ isCityUnknown: true })
            }
        } catch (err) {
            console.error(err)
        }
    }

    renderErrors() {
        const error =
            this.state.isCityExists && {
                header: "Місто існує",
                body: "Таке місто вже є",
                action: (v) => this.setState({ isCityExists: v })
            }

        if (!error) return null
        return <MessageModal {...error} />
    }

    render() {
        return (
            <>
                {this.renderErrors()}

                <div className="modal-wrapper">
                    <div className="add-city-modal">
                        <div className="header">
                            <h2>Додати місто</h2>
                        </div>

                        <div className="body">
                            <form>
                                <div className="form-group">
                                    <div>
                                        <label>Місто</label>
                                        <input
                                            type="text"
                                            value={this.state.city}
                                            onChange={(e) => this.setState({ city: e.target.value })}
                                            placeholder="Введіть або оберіть місто"
                                        />
                                    </div>

                                    <button type="button" onClick={this.searchCity}>
                                        <Search />
                                    </button>
                                </div>
                            </form>

                            <div style={{ height: "300px", marginTop: "10px" }}>
                                <MapContainer
                                    center={[50.45, 30.52]}
                                    zoom={6}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer
                                        attribution="&copy; OpenStreetMap"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <MapClickHandler
                                        onClick={this.setCityFromMap}
                                    />

                                    {this.state.lat && (
                                        <>
                                            <ChangeView center={[this.state.lat, this.state.lng]} />
                                            <Marker position={[this.state.lat, this.state.lng]} />
                                        </>
                                    )}
                                </MapContainer>
                            </div>
                        </div>

                        <div className="footer">
                            <button
                                className="no"
                                onClick={() =>
                                    this.props.setRenderCitiesModal(false)
                                }
                            >
                                Скасувати
                            </button>

                            <button className="yes" onClick={this.onAdd}>
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

function MapClickHandler({ onClick }) {
    useMapEvents({
        click(e) {
            onClick(e.latlng.lat, e.latlng.lng)
        }
    })
    return null
}

function ChangeView({ center }) {
    const map = useMapEvents({})
    map.setView(center)
    return null
}

export default AddCityModal
