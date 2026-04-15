import React from "react"
import { Save } from 'lucide-react'

import DriverSearchInput from "../DriverSearchInput"

class SetDriverModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            userData: {
                id: '',
                login: '',
                name: '',
                surname: ''
            }
        }

        this.formRef = React.createRef()
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
                        description: `Призначення водія "${this.state.userData?.name} ${this.state.userData?.surname}" для поїздки "${this.props.tripName}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    render() {
        const { userData } = this.state

        return (
            <>
                <div className="modal-wrapper">
                    <div className="set-driver-modal">
                        <div className="header">
                            <h2>Призначити водія</h2>
                        </div>

                        <div className="body">
                            <form id="set-form">
                                <DriverSearchInput
                                    value={userData.login}
                                    onChange={(v) => this.setState(prev => ({
                                        userData: { ...prev.userData, login: v, id: null, name: '', surname: '' }
                                    }))}
                                    onSelect={(user) => this.setState(prev => ({
                                        userData: { ...prev.userData, name: user.name, surname: user.surname, login: user.login, id: user.id }
                                    }))}
                                />
                            </form>
                        </div>

                        <div className="footer">
                            <button
                                className="no inter-font"
                                type="button"
                                onClick={() => this.props.setRenderSetDriverModal(false)}
                            >
                                <p>Скасувати</p>
                            </button>

                            <button
                                className="yes inter-font"
                                type="button"
                                onClick={async () => {
                                    await this.props.setDriver(this.state.userData?.id)
                                    await this.writeToJournal()
                                    await this.props.fetchTrips()
                                    await this.props.setRenderSetDriverModal(false)
                                    await this.props.setRenderTripDetailsModal(false)
                                }}
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

export default SetDriverModal