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
                    jwt_ttl: 60,
                    allow_multiple_sessions: false
                },
                access: {
                    allow_registration: true,
                    default_role: 'user'
                }
            },
            renderSuccessMessage: false
        }
    }
    
    async componentDidMount() {
        await this.fetchSettings()
    }

    fetchSettings = async () => {
        try {
            fetch(`${import.meta.env.VITE_API_URL}/settings`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
                .then(res => res.json())
                .then(settings => {
                    this.setState(prev => ({
                        settings: {
                            general: {
                                ...prev.settings.general,
                                ...settings.general
                            },
                            security: {
                                ...prev.settings.security,
                                ...settings.security
                            },
                            access: {
                                ...prev.settings.access,
                                ...settings.access
                            }
                        }
                    }))
                })
        } catch (err) {
            console.error(err)
        }
    }

    save = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/save`, {
            method: "POST",
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
        console.log(this.state.settings)
        
        return (
            <div className="settings-wrapper">
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
