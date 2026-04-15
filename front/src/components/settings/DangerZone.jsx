import React from "react"
import { TriangleAlert } from 'lucide-react'

class DangerZone extends React.Component {
    render() {
        return (
            <div className="settings-block danger-zone card">
                <div className="header">
                    <div className="icon">
                        <TriangleAlert />
                    </div>

                    <h3>Danger Zone</h3>
                </div>

                <div className="content">
                    <button className="danger">
                        Скинути налаштування
                    </button>
                </div>
            </div>
        )
    }
}

export default DangerZone
