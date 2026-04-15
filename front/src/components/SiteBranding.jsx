import React from "react"
import { LayoutDashboard, BookUser, Route, Car, Users, Settings, NotebookText, Building2 } from 'lucide-react'

import Logo from "/logo.png"

class SiteBranding extends React.Component {
    renderIcon = () => {
        switch (this.props.activeView) {
            case 'dashboard':
                return <LayoutDashboard />
            case 'cities':
                return <Building2 />
            case 'routes':
                return <Route />
            case 'trips':
                return <Car />
            case 'passengers':
                return <BookUser />
            case 'users':
                return <Users />
            case 'journal':
                return <NotebookText />
            case 'settings':
                return <Settings />
            default:
                return <LayoutDashboard />
        }
    }

    render() {
        return (
            <div className="site-branding" onClick={() => this.props.onOpen(!this.props.isMenuOpen)}>
                <div className="logo" style={{ width: this.props.logoSize, height: this.props.logoSize }}>
                    {this.props.activeView
                        ? this.renderIcon()
                        : <>
                            <div className="icon">
                                <img src={Logo} alt="site logo" />
                            </div>

                            <div className="burger-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </>
                    }
                </div>

                <div className="title-and-subtitle">
                    <div className="title">
                        <h1 className={`${this.props.activeView ? "on-header" : ''}`}>{this.props.title}</h1>
                    </div>

                    {this.props.showSubTile && (
                        <div className="sub-title">
                            <p>Admin Panel</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default SiteBranding