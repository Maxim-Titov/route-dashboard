import React from "react"
import { Trash2 } from "lucide-react"

import DeleteCityModal from "../modals/DeleteCityModal"
import MessageModal from "../modals/MessageModal"

class CitiesList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
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
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/cities/delete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ city_id: id })
                }
            )

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

        await this.props.fetchCities()
        await this.props.fetchCitiesCount()

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
                                <div
                                    className="icon-wrapper trash"
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

                {this.state.renderDeleteCityModal && (
                    <DeleteCityModal
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
