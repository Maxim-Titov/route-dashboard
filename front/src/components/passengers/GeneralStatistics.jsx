import React from "react"

import { Users } from 'lucide-react'

class GeneralStatistics extends React.Component {
    render() {
        const passengersCount = this.props.passengersCount
        const tripsCount = this.props.tripsCount
        const avg_trips = passengersCount > 0
            ? (tripsCount / passengersCount).toFixed(2)
            : 0

        const statistics = [
            {label: "Всього пасажирів", value: passengersCount},
            {label: "Всього поїздок", value: tripsCount},
            {label: "Середньо поїздок", value: avg_trips}
        ]

        return (
            <div className="general-statistics">
                <div className="card">
                    <div className="header">
                        <Users />
                        <h3 className="label">Загальна статистика</h3>
                    </div>

                    <div className="content">
                        {statistics.map((statistic, index) => (
                            <div className="statistic" key={index}>
                                <p className="label">{statistic.label}</p>
                                <p className="value">{statistic.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

export default GeneralStatistics