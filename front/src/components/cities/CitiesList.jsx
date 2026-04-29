import React from "react"
import { Info, Trash2 } from "lucide-react"

import CityDetailsModal from "../modals/CityDetailsModal"
import DeleteCityModal from "../modals/DeleteCityModal"
import MessageModal from "../modals/MessageModal"

class CitiesList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            renderCityDetailsModal: false,
            renderDeleteCityModal: false,
            cityId: null,
            cityName: null,
            isFail: false,
            failMessage: ""
        }
    }

    setIsFail = (value) => {
        this.setState({ isFail: value })
    }

    setFailMessage = (value) => {
        this.setState({ failMessage: value })
    }

    setRenderCityDetailsModal = (value) => {
        this.setState({ renderCityDetailsModal: value })
    }

    setRenderDeleteCityModal = (value) => {
        this.setState({ renderDeleteCityModal: value })
    }

    setCity = (id, name) => {
        this.setState({
            cityId: id,
            cityName: name
        })
    }

    deleteCity = async (id) => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/cities/delete`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ city_id: id })
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
                    `${import.meta.env.VITE_API_URL}/cities/delete`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({ city_id: id })
                    }
                )
            }

            const data = await res.json()

            if (!data.success) {
                this.setIsFail(true)
                this.setFailMessage(data.message)
            }

            return data
        } catch (err) {
            console.error(err)
        }
    }

    onDelete = async (id) => {
        await this.deleteCity(id)

        if (this.state.isFail) return

        await Promise.all([
            this.props.fetchCities(),
            this.props.fetchCitiesCount(),
        ])

        this.setRenderDeleteCityModal(false)
    }

    render() {
        const { citiesList } = this.props

        return (
            <div className="cities-list">
                {citiesList.map((city) => (
                    <div className="card" key={city.id}>
                        <div className="header">
                            {city.city}

                            <div className="actions">
                                <div className="icon-wrapper info" onClick={async () => {
                                    this.setCity(city.id, city.city)
                                    this.setRenderCityDetailsModal(true)
                                }}>
                                    <Info />
                                </div>

                                <div
                                    className={`icon-wrapper trash ${this.props.user?.role === 'user' ? 'forbidden' : ''}`}
                                    onClick={() => {
                                        this.setCity(city.id, city.city)
                                        this.setRenderDeleteCityModal(true)
                                    }}
                                >
                                    <Trash2 />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {this.state.renderCityDetailsModal && (
                    <CityDetailsModal
                        user={this.props.user}
                        setRenderCityDetailsModal={this.setRenderCityDetailsModal}
                        cityId={this.state.cityId}
                        cityName={this.state.cityName}
                    />
                )}

                {this.state.renderDeleteCityModal && (
                    <DeleteCityModal
                        user={this.props.user}
                        setRenderDeleteCityModal={this.setRenderDeleteCityModal}
                        cityId={this.state.cityId}
                        cityName={this.state.cityName}
                        onDelete={this.onDelete}
                    />
                )}

                {this.state.isFail &&
                    this.state.failMessage === "city has routes" && (
                        <MessageModal
                            header="Місто використовується"
                            body="Щоб видалити місто, воно не повинно використовуватись у маршрутах"
                            action={this.setIsFail}
                        />
                    )}
            </div>
        )
    }
}

export default CitiesList
