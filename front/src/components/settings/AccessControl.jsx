import React from "react"
import { PersonStanding } from 'lucide-react'

class AccessControl extends React.Component {
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
                        <PersonStanding />
                    </div>
                    
                    <h3>Контроль доступу</h3>
                </div>

                <form className="content">
                    <div className="form-row">
                        <label htmlFor="role">Роль за замовчуванням</label>
                        <select id="role" name="default_role" value={value?.default_role} onChange={this.handleChange}>
                            <option value="user">Користувач</option>
                            <option value="moderator">Модератор</option>
                            <option value="admin">Адміністратор</option>
                        </select>
                    </div>

                    <div className="form-row checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="allow_registration"
                                checked={value?.allow_registration}
                                onChange={this.handleChange}
                            />
                            Дозволити реєстрацію
                        </label>
                    </div>
                </form>
            </div>
        )
    }
}

export default AccessControl
