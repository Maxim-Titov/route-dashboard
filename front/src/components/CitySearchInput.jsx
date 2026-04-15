import React from "react"

class CitySearchInput extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            results: []
        }
    }

    searchCities = async (query) => {
        if (!query || query.length < 2) {
            this.setState({ results: [] })
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/cities/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ q: query })
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
        this.searchCities(value)
    }

    handleSelect = (city) => {
        this.props.onSelect(city)
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
                        {this.state.results.map(city => (
                            <li key={city.id} onClick={() => this.handleSelect(city)}>
                                {city.city}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )
    }
}

export default CitySearchInput
