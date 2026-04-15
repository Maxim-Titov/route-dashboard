import React from "react"
import { KeyRound } from 'lucide-react'

class SecuritySettings extends React.Component {
    handleChange = (e) => {
        const { name, value } = e.target

        this.props.onChange({
            ...this.props.value,
            [name]: value
        })
    }

    render() {
        const { value } = this.props

        return (
            <div className="settings-block card">
                <div className="header">
                    <div className="icon">
                        <KeyRound />
                    </div>

                    <h3>Безпека</h3>
                </div>

                <form className="content">
                    <div className="form-row">
                        <label htmlFor="refresh">Refresh token (дн)</label>
                        <input id="refresh" name="refresh_ttl" type="number" value={value?.refresh_ttl} onChange={this.handleChange} />
                    </div>

                    <div className="form-row">
                        <label htmlFor="access">Access token (хв)</label>
                        <input id="access" name="access_ttl" type="number" value={value?.access_ttl} onChange={this.handleChange} />
                    </div>
                </form>
            </div>
        )
    }
}

export default SecuritySettings
