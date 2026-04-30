import React from "react"
import { Save } from 'lucide-react'

import MessageModal from "./MessageModal"

class AddPassengerModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            passengerData: {
                name: '',
                surname: '',
                phone: '',
                dateOfBirth: '',
                trip: '',
                note: ''
            },
            errors: {},
            isPassengerExists: false,
            isTripExists: false
        }

        this.formRef = React.createRef()
    }

    addPassenger = async () => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/passengers/add`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        name: this.state.passengerData?.name,
                        surname: this.state.passengerData?.surname,
                        phone: this.state.passengerData?.phone,
                        date_of_birth: this.state.passengerData?.dateOfBirth,
                        trip_id: this.parseNumber(this.state.passengerData?.trip),
                        note: this.state.passengerData?.note
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
                    `${import.meta.env.VITE_API_URL}/passengers/add`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            name: this.state.passengerData?.name,
                            surname: this.state.passengerData?.surname,
                            phone: this.state.passengerData?.phone,
                            date_of_birth: this.state.passengerData?.dateOfBirth,
                            trip_id: this.parseNumber(this.state.passengerData?.trip),
                            note: this.state.passengerData?.note
                        })
                    }
                )
            }

            const data = await res.json()

            switch (data.result) {
                case 'exists':
                    this.setState({ isPassengerExists: true })
                    return
                case 'trip not exists':
                    this.setState({ isTripExists: true })
                    return
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
                        entity_type: 'passengers',
                        action: 'create',
                        description: `Додавання пасажира "${this.state.passengerData?.name} ${this.state.passengerData?.surname}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    setIsPassengerExists = (value) => {
        this.setState({ isPassengerExists: value })
    }

    setIsTripExists = (value) => {
        this.setState({ isTripExists: value })
    }

    parseNumber = (v) => v === '' ? null : Number(v)

    validateForm = () => {
        let { name, surname, phone, dateOfBirth } = this.state.passengerData
        const errors = {}

        if (!name.trim()) errors.name = "Імʼя обовʼязкове"
        if (!surname.trim()) errors.surname = "Прізвище обовʼязкове"
        if (!phone.trim()) errors.phone = "Телефон обовʼязковий"

        if (phone && !/^\+380\d{9}$/.test(phone)) {
            errors.phone = "Формат: +380XXXXXXXXX"
        }

        if (!dateOfBirth) errors.dateOfBirth = "Дата народження обовʼязкова"

        this.setState({ errors })

        return Object.keys(errors).length === 0
    }

    onAdd = async () => {
        if (!this.validateForm()) return

        const result = await this.addPassenger()
        if (!result) return

        await Promise.all([
            this.writeToJournal(),
            this.props.fetchPassengers(),
            this.props.fetchTripsCount(),
            this.props.fetchPassengersCount(),
        ])

        this.props.setRenderPassengersModal(false)
    }

    handleChange = (e) => {
        const { name, value } = e.target

        let newValue = value

        if (name === 'phone') {
            newValue = value
                .replace(/[^0-9+]/g, '')
                .replace(/(?!^)\+/g, '')
        }

        this.setState(prev => ({
            passengerData: { ...prev.passengerData, [name]: newValue },
            errors: { ...prev.errors, [name]: undefined }
        }))
    }

    render() {
        const { passengerData, errors } = this.state

        return (
            <>
                {this.state.isPassengerExists && (
                    <MessageModal header="Пасажир існує" body='Пасажир з цим номером телефону існує' action={this.setIsPassengerExists} />
                )}

                {this.state.isTripExists && (
                    <MessageModal header="Поїздка не існує" body='Поїздка з цим номером не існує' action={this.setIsTripExists} />
                )}

                <div className="modal-wrapper">
                    <div className="add-passanger-modal">
                        <div className="header">
                            <h2>Додати пасажира</h2>
                        </div>

                        <div className="body">
                            <form id="passenger-info">
                                {/* Імʼя */}
                                <div className="form-group">
                                    <label htmlFor="name">Ім'я <span>*</span></label>
                                    <input
                                        className={`inter-font ${errors.name ? 'not-valid' : ''}`}
                                        onChange={this.handleChange}
                                        value={passengerData.name}
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Введіть ім'я"
                                    />
                                    {/* {errors.name && <div className="error-popup">{errors.name}</div>} */}
                                </div>

                                {/* Прізвище */}
                                <div className="form-group">
                                    <label htmlFor="surname">Прізвище <span>*</span></label>
                                    <input
                                        className={`inter-font ${errors.surname ? 'not-valid' : ''}`}
                                        onChange={this.handleChange}
                                        value={passengerData.surname}
                                        type="text"
                                        name="surname"
                                        id="surname"
                                        placeholder="Введіть прізвище"
                                    />
                                    {/* {errors.surname && <div className="error-popup">{errors.surname}</div>} */}
                                </div>

                                {/* Телефон */}
                                <div className="form-group">
                                    <label htmlFor="phone">Телефон <span>*</span></label>
                                    <input
                                        className={`inter-font ${errors.phone ? 'not-valid' : ''}`}
                                        onChange={this.handleChange}
                                        value={passengerData.phone}
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        placeholder="+380123456789"
                                    />
                                    {/* {errors.phone && <div className="error-popup">{errors.phone}</div>} */}
                                </div>

                                {/* Дата народження */}
                                <div className="form-group">
                                    <label htmlFor="date-of-birth">Дата народження <span>*</span></label>
                                    <input
                                        className={`inter-font ${errors.dateOfBirth ? 'not-valid' : ''}`}
                                        onChange={this.handleChange}
                                        value={passengerData.dateOfBirth}
                                        type="date"
                                        name="dateOfBirth"
                                        id="date-of-birth"
                                    />
                                    {/* {errors.dateOfBirth && <div className="error-popup">{errors.dateOfBirth}</div>} */}
                                </div>

                                {/* Поїздка */}
                                <div className="form-group">
                                    <label htmlFor="trip">Поїздка (№)</label>
                                    <input
                                        className={`inter-font ${errors.trip ? 'not-valid' : ''}`}
                                        onChange={this.handleChange}
                                        value={passengerData.trip}
                                        type="text"
                                        name="trip"
                                        id="trip"
                                        placeholder="3"
                                    />
                                    {/* {errors.phone && <div className="error-popup">{errors.phone}</div>} */}
                                </div>

                                {/* Замітка */}
                                <div className="form-group">
                                    <label htmlFor="note">Замітка</label>
                                    <textarea
                                        className="inter-font"
                                        onChange={this.handleChange}
                                        value={passengerData.note}
                                        name="note"
                                        id="note"
                                        placeholder="Додайте коротку замітку про пасажира"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="footer">
                            <button
                                className="no inter-font"
                                type="button"
                                onClick={() => this.props.setRenderPassengersModal(false)}
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

export default AddPassengerModal