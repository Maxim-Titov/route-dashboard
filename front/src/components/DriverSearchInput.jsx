import React from "react"

class DriverSearchInput extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            results: []
        }
    }

    searchDriver = async (query) => {
        if (!query || query.length < 2) {
            this.setState({ results: [] })
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    q: query
                })
            })

            const data = await res.json()
            this.setState({ results: data })
        } catch (e) {
            console.error(e)
            this.setState({ results: [] })
        }
    }

    handleChange = (e) => {
        const value = e.target.value
        this.props.onChange(value)
        this.searchDriver(value)
    }

    handleSelect = (user) => {
        this.props.onSelect(user)
        this.setState({ results: [] })
    }

    render() {
        const { value } = this.props

        return (
            <div className="search-input">
                <label htmlFor="login">Логін</label>
                <input
                    type="text"
                    name="login"
                    className="inter-font"
                    value={value}
                    onChange={this.handleChange}
                />

                {this.state.results.length > 0 && (
                    <ul className="autocomplete-dropdown">
                        {this.state.results.map(user => (
                            <li
                                key={user.id}
                                onClick={() => this.handleSelect(user)}
                            >
                                <strong>{user.name} {user.surname}</strong>
                                <div className="sub">
                                    {user.login}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )
    }
}

export default DriverSearchInput
