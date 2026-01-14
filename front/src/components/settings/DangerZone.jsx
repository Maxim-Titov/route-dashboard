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
                    <div className="buttons-wrapper">
                        <button className="danger">
                            Очистити кеш
                        </button>

                        <button className="danger">
                            Скинути налаштування
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default DangerZone
