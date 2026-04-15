import React from "react"

import SiteBranding from "../SiteBranding"
import Navigation from "./Navigation"

class Sidebar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isMenuOpen: false
        }
    }

    setIsMenuOpen = (value) => {
        this.setState({ isMenuOpen: value })
    }

    render() {
        return (
            <aside className={this.state.isMenuOpen ? "open" : ""}>
                <SiteBranding onOpen={this.setIsMenuOpen} isMenuOpen={this.state.isMenuOpen} activeView={null} title={this.props.siteName} logoSize={40} showSubTile={true} />
                <Navigation setIsMenuOpen={this.setIsMenuOpen} activeView={this.props.activeView} setActiveView={this.props.setActiveView} menuItems={this.props.menuItems} />
            </aside>
        )
    }
}

export default Sidebar