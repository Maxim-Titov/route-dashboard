import React from "react"

import AutocompleteDropdown from "./AutocompleteDropdown"

class SearchPanel extends React.Component {
    state = {
        query: "",
        timeoutId: null,
        results: [],
        showDropdown: false
    }

    searchPassengers = async (q) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/passengers/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q })
        })

        return res.json()
    }

    handleChange = (e) => {
        const value = e.target.value
        this.setState({ query: value, showDropdown: !!value })

        if (this.state.timeoutId) clearTimeout(this.state.timeoutId)

        const timeoutId = setTimeout(async () => {
            if (value.length < 2) {
                this.setState({ results: [], showDropdown: false })
                this.props.onResults?.([])
                return
            }

            const results = await this.searchPassengers(value)
            this.setState({ results })
            this.props.onResults?.(results)
        }, 300)

        this.setState({ timeoutId })
    }

    handleSelect = (passenger) => {
        this.setState({
            query: `${passenger.first_name} ${passenger.last_name}`,
            showDropdown: false
        })
        this.props.onSelect?.(passenger)
        this.props.setActiveView && this.props.setActiveView('passengers')
    }

    render() {
        const { query, results, showDropdown } = this.state

        return (
            <div className="search-panel">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon" aria-hidden="true">
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                </svg>
                
                <input
                    className="inter-font"
                    type="search"
                    placeholder="Пошук..."
                    value={query}
                    onChange={this.handleChange}
                    onKeyDown={(e) => this.dropdownRef?.handleKeyDown(e)}
                />

                <AutocompleteDropdown
                    ref={ref => this.dropdownRef = ref}
                    results={results}
                    show={showDropdown}
                    onSelect={this.handleSelect}
                />
            </div>
        )
    }
}

export default SearchPanel
