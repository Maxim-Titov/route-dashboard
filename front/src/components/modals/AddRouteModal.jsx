import React from "react"
import { Save } from 'lucide-react'

import MessageModal from "./MessageModal"

class AddRouteModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            routeData: {
                from: '',
                to: ''
            },

            errors: {},

            isRouteExists: false,
            isFromCityUnknown: false,
            isToCityUnknown: false,
            isCitiesSimilar: false
        }

        this.formRef = React.createRef()
    }

    addRoute = async () => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/routes/add`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        from_city: this.state.routeData?.from,
                        to_city: this.state.routeData?.to
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
                    `${import.meta.env.VITE_API_URL}/routes/add`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            from_city: this.state.routeData?.from,
                            to_city: this.state.routeData?.to
                        })
                    }
                )
            }

            const data = await res.json()

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
                        entity_type: 'routes',
                        action: 'create',
                        description: `Додавання маршруту "${this.state.routeData?.from} → ${this.state.routeData?.to}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    setIsRouteExists = (value) => {
        this.setState({ isRouteExists: value })
    }

    setIsFromCityUnknown = (value) => {
        this.setState({ isFromCityUnknown: value })
    }

    setIsToCityUnknown = (value) => {
        this.setState({ isToCityUnknown: value })
    }

    setIsCitiesSimilar = (value) => {
        this.setState({ isCitiesSimilar: value })
    }

    validateForm = () => {
        let { from, to } = this.state.routeData
        const errors = {}

        if (!from.trim()) errors.name = "Місце старту обов'язкове"
        if (!to.trim()) errors.surname = "Місце прибуття обов'язкове"

        this.setState({ errors })

        return Object.keys(errors).length === 0
    }

    handleChange = (e) => {
        const { name, value } = e.target

        this.setState(prev => ({
            routeData: { ...prev.routeData, [name]: value },
            errors: { ...prev.errors, [name]: undefined }
        }))
    }

    onAdd = async () => {
        if (!this.validateForm()) return

        const result = await this.addRoute()

        if (result === 'exists') {
            this.setState({ isRouteExists: true })
            return
        }

        if (result === 'unknown from city') {
            this.setState({ isFromCityUnknown: true })
            return
        }

        if (result === 'unknown to city') {
            this.setState({ isToCityUnknown: true })
            return
        }

        if (result === 'similar') {
            this.setState({ isCitiesSimilar: true })
            return
        }

        await Promise.all([
            this.writeToJournal(),
            this.props.fetchRoutes(),
            this.props.fetchRoutesCount(),
        ])

        this.props.setRenderRoutesModal(false)
    }

    renderErrors = () => {
        const errors = [
            this.state.isRouteExists && {
                header: "Маршрут існує",
                body: "Такий маршрут існує",
                action: this.setIsRouteExists
            },
            this.state.isFromCityUnknown && {
                header: "Невідоме місце відбуття",
                body: "Такого місця відбуття нема",
                action: this.setIsFromCityUnknown
            },
            this.state.isToCityUnknown && {
                header: "Невідоме місце прибуття",
                body: "Такого місця прибуття нема",
                action: this.setIsToCityUnknown
            },
            this.state.isCitiesSimilar && {
                header: "Міста одинакові",
                body: "Міста не можуть бути одинакові",
                action: this.setIsCitiesSimilar
            }
        ].find(Boolean)

        if (!errors) return null

        return <MessageModal {...errors} />
    }

    render() {
        const { routeData, errors } = this.state

        return (
            <>
                {this.renderErrors()}

                <div className="modal-wrapper">
                    <div className="add-route-modal">
                        <div className="header">
                            <h2>Додати маршрут</h2>
                        </div>

                        <div className="body">
                            <form id="route-info">
                                <div className="form-group">
                                    <label htmlFor="from">Вирушаємо з <span>*</span></label>
                                    <input
                                        className={`inter-font ${errors.from ? 'not-valid' : ''}`}
                                        onChange={this.handleChange}
                                        value={routeData.from}
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
                                        value={routeData.to}
                                        type="text"
                                        name="to"
                                        id="to"
                                        placeholder="Варшава"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="footer">
                            <button
                                className="no inter-font"
                                type="button"
                                onClick={() => this.props.setRenderRoutesModal(false)}
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

export default AddRouteModal