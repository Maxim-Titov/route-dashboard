import React from "react"

import SiteBranding from "../SiteBranding"
import SearchPanel from "../SearchPanel"
import UserLogo from "./UserLogo"

class Header extends React.Component {
    setPassengers = (results) => {
        this.props.setSearchQuery(results)
    }

    renderTitle = () => {
        switch (this.props.activeView) {
            case 'dashboard':
                return 'Головна'
            case 'cities':
                return 'Міста'
            case 'passengers':
                return 'Пасажири'
            case 'routes':
                return 'Маршрути'
            case 'trips':
                return 'Поїздки'
            case 'users':
                return 'Команда'
            case 'journal':
                return 'Журнал'
            case 'settings':
                return 'Налаштування'
            default:
                return 'Головна'
        }
    }

    render() {
        return (
            <header>
                <SiteBranding activeView={this.props.activeView} title={this.renderTitle()} logoSize={32} showSubTile={false} />
                <SearchPanel setActiveView={this.props.setActiveView} onResults={(results) => this.setPassengers(results)} />
                <UserLogo context={this.props.context} setIsRenderProfileModal={this.props.setIsRenderProfileModal} />
            </header>
        )
    }
}

export default Header