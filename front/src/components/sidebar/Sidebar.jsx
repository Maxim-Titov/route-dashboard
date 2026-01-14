import React from "react"
import { LayoutDashboard, Building2, Users, Route, Car, Settings } from 'lucide-react'

import SiteBranding from "../SiteBranding"
import Navigation from "./Navigation"

class Sidebar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            menuItems: [
                {id: 'dashboard', icon: LayoutDashboard, label: 'Головна'},
                {id: 'cities', icon: Building2, label: 'Міста'},
                {id: 'routes', icon: Route, label: 'Маршрути'},
                {id: 'trips', icon: Car, label: 'Поїздки'},
                {id: 'passengers', icon: Users, label: 'Пасажири'},
                {id: 'settings', icon: Settings, label: 'Налаштування'},
            ]
        }
    }

    render() {
        return (
            <aside>
                <SiteBranding activeView={null} title="Dashboard" logoSize={40} showSubTile={true} />
                <Navigation activeView={this.props.activeView} setActiveView={this.props.setActiveView} menuItems={this.state.menuItems} />
            </aside>
        )
    }
}

export default Sidebar