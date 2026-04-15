import React from "react"
import { Save } from 'lucide-react'

import ViewHeader from "../ViewHeader"
import GeneralSettings from "./GeneralSettings"
import SecuritySettings from "./SecuritySettings"
import AccessControl from "./AccessControl"
import DangerZone from "./DangerZone"
import MessageModal from "../modals/MessageModal"

class Settings extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            settings: {
                general: {
                    site_name: ""
                },
                security: {
                    jwt_ttl: 60
                },
                access: {
                    allow_registration: true
                }
            },
            renderSuccessMessage: false,
            isForbidden: false
        }
    }

    async componentDidMount() {
        await this.fetchSettings()
    }

    fetchSettings = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })

            const data = await res.json()

            if (!data.detail) {
                this.setState(prev => ({
                    settings: {
                        general: {
                            ...prev.settings.general,
                            ...data.general
                        },
                        security: {
                            ...prev.settings.security,
                            ...data.security
                        },
                        access: {
                            ...prev.settings.access,
                            ...data.access
                        }
                    }
                }))
            }

            if (data.detail === 'Forbidden') {
                this.setState({ isForbidden: true })
            }
        } catch (err) {
            console.error(err)
        }
    }

    save = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/save`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                data: this.state.settings
            })
        })

        const data = await res.json()

        if (data.status === 'ok') {
            this.setState({ renderSuccessMessage: true })
        }
    }

    setRenderSuccessMessage = (value) => {
        this.setState({ renderSuccessMessage: value })
    }

    updateSettings = (section, data) => {
        this.setState(prev => ({
            settings: {
                ...prev.settings,
                [section]: data
            }
        }))
    }

    render() {
        return (
            <div className={`settings-wrapper ${this.state.isForbidden ? 'forbidden' : ''}`}>
                <div className="container">
                    <div className="header">
                        <ViewHeader title="Налаштування" subtitle="Керування системою та доступами" />

                        <div className="buttons-wrapper">
                            <button className="save-settings-button" type="button" onClick={() => this.save()}>
                                <Save />
                                <p className="inter-font">Зберегти</p>
                            </button>
                        </div>
                    </div>

                    <GeneralSettings value={this.state.settings.general} onChange={(data) => this.updateSettings("general", data)} />
                    <SecuritySettings value={this.state.settings.security} onChange={(data) => this.updateSettings("security", data)} />
                    <AccessControl value={this.state.settings.access} onChange={(data) => this.updateSettings("access", data)} />
                    <DangerZone />
                </div>

                {this.state.renderSuccessMessage && (
                    <MessageModal header="Збережено" body="Налаштування успішно збережено" action={this.setRenderSuccessMessage} />
                )}
            </div>
        )
    }
}

export default Settings
