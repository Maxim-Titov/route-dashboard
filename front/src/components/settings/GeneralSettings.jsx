import React from "react"
import { Wrench } from 'lucide-react'

class GeneralSettings extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            siteName: "Route Dashboard"
        }
    }

    handleChange = (e) => {
        this.setState({ siteName: e.target.value })
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
                        <input id="site-name" name="site-name" value={this.state.siteName} onChange={this.handleChange} />
                    </div>
                </form>
            </div>
        )
    }
}

export default GeneralSettings
