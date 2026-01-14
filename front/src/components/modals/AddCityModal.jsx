import React from "react"
import { Save } from "lucide-react"
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
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/cities/add`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        city: this.state.city
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

        await this.props.fetchCities()
        await this.props.fetchCitiesCount()
        
        this.props.setRenderCitiesModal(false)
    }

    setCityFromMap = async (lat, lng) => {
        this.setState({ lat, lng })

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
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
                    <div className="add-route-modal">
                        <div className="header">
                            <h2>Додати місто</h2>
                        </div>

                        <div className="body">
                            <div className="form-group">
                                <label>Місто</label>
                                <input
                                    type="text"
                                    value={this.state.city}
                                    readOnly
                                    placeholder="Оберіть місто на карті"
                                />
                            </div>

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
                                        <Marker
                                            position={[
                                                this.state.lat,
                                                this.state.lng
                                            ]}
                                        />
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

export default AddCityModal
