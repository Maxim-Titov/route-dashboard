import React from "react"
import { KeyRound } from 'lucide-react'

class SecuritySettings extends React.Component {
    handleChange = (e) => {
        const { name, type, value, checked } = e.target

        this.props.onChange({
            ...this.props.value,
            [name]: type === "checkbox" ? checked : value
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
                        <label htmlFor="jwt">JWT TTL (хв)</label>
                        <input id="jwt" name="jwt_ttl" type="number" value={value?.jwt_ttl} onChange={this.handleChange} />
                    </div>

                    <div className="form-row checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="allow_multiple_sessions"
                                checked={value?.allow_multiple_sessions}
                                onChange={this.handleChange}
                            />
                            Дозволити кілька сесій
                        </label>
                    </div>
                </form>
            </div>
        )
    }
}

export default SecuritySettings
