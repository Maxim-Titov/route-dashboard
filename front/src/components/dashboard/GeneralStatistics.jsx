import React from "react"
import { Route, Car, Users, Building2 } from 'lucide-react'

class GeneralStatistics extends React.Component {
    render () {
        const stats = [
            { label: "Всього міст", value: this.props.citiesCount, icon: Building2},
            { label: "Всього маршрутів", value: this.props.routesCount, icon: Route },
            { label: "Всього поїздок", value: this.props.tripsCount, icon: Car },
            { label: "Всього пасажирів", value: this.props.passengersCount, icon: Users }
        ]

        return (
            <div className="general-statistics">
                {stats.map((stat, index) => (
                    <div key={index} className="card">
                        <div className="content">
                            <h3 className="label">{stat.label}</h3>
                            <p className="value">{stat.value}</p>
                        </div>

                        <div className="icon">
                            <stat.icon />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}

export default GeneralStatistics