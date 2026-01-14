import React from "react"
import { LayoutDashboard, Users, Route, Car, Settings, Building2 } from 'lucide-react'

import Logo from "/logo.png"

class SiteBranding extends React.Component {
    renderIcon = () => {
        switch (this.props.activeView) {
            case 'dashboard':
                return <LayoutDashboard />
            case 'cities':
                return <Building2 />
            case 'passengers':
                return <Users />
            case 'routes':
                return <Route />
            case 'trips':
                return <Car />
            case 'settings':
                return <Settings />
            default:
                return <LayoutDashboard />
        }
    }

    render() {
        return (
            <div className="site-branding">
                <div className="logo" style={{width: this.props.logoSize, height: this.props.logoSize}}>
                    {this.props.activeView
                        ? this.renderIcon()
                        : <img src={Logo} alt="site logo" />
                    }
                </div>

                <div>
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