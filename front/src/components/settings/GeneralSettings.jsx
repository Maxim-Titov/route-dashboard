import React from "react"
import { Wrench } from 'lucide-react'

class GeneralSettings extends React.Component {
    handleChange = (e) => {
        this.props.onChange({
            ...this.props.value,
            site_name: e.target.value
        })
    }

    render() {
        return (
            <div className="settings-block card">
                <div className="header">
                    <div className="icon">
                        <Wrench />
                    </div>

                    <h3>Загальні налаштування</h3>
                </div>

                <form className="content">
                    <div className="form-row">
                        <label htmlFor="site-name">Назва системи</label>
                        <input
                            id="site-name"
                            name="site-name"
                            value={this.props.value.site_name}
                            onChange={this.handleChange}
                        />
                    </div>
                </form>
            </div>
        )
    }
}

export default GeneralSettings
