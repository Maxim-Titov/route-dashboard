import React from "react"

class Navigation extends React.Component {
    render() {        
        return (
            <div className="navigation">
                <nav>
                    <ul>
                        {this.props.menuItems.map((item, index) => {
                            return (
                                <li key={index} onClick={() => this.props.setActiveView(item.id)} className={this.props.activeView === item.id ? 'active' : ''}>
                                    <item.icon />
                                    <p>{item.label}</p>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </div>
        )
    }
}

export default Navigation