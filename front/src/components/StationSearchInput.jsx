import React from "react"

class StationSearchInput extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            results: []
        }
    }

    searchStations = async (query) => {
        const { cityId } = this.props

        if (!query || query.length < 2 || !cityId) {
            this.setState({ results: [] })
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/cities/search/station`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    q: query,
                    city_id: cityId
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
        this.searchStations(value)
    }

    handleSelect = (station) => {
        this.props.onSelect(station)
        this.setState({ results: [] })
    }

    render() {
        const { value, placeholder, className } = this.props

        return (
            <div className="search-input">
                <input
                    type="text"
                    className={className}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.handleChange}
                />

                {this.state.results.length > 0 && (
                    <ul className="autocomplete-dropdown">
                        {this.state.results.map(station => (
                            <li
                                key={station.id}
                                onClick={() => this.handleSelect(station)}
                            >
                                <strong>{station.station_name}</strong>
                                <div className="sub">
                                    {station.station_address}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )
    }
}

export default StationSearchInput
