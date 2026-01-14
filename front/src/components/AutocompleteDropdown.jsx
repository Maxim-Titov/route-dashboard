import React from "react"

class AutocompleteDropdown extends React.Component {
    state = {
        highlightedIndex: -1
    }

    handleKeyDown = (e) => {
        const { highlightedIndex } = this.state
        const { results, onSelect } = this.props

        if (!results || results.length === 0) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            this.setState({
                highlightedIndex: (highlightedIndex + 1) % results.length
            })
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            this.setState({
                highlightedIndex: (highlightedIndex - 1 + results.length) % results.length
            })
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault()
            onSelect(results[highlightedIndex])
            this.setState({ highlightedIndex: -1 })
        }
    }

    handleMouseEnter = (index) => {
        this.setState({ highlightedIndex: index })
    }

    render() {
        const { results, onSelect, show } = this.props
        const { highlightedIndex } = this.state

        if (!show || !results || results.length === 0) return null

        return (
            <ul
                className="autocomplete-dropdown"
                onKeyDown={this.handleKeyDown}
            >
                {results.map((item, index) => (
                    <li
                        key={item.id}
                        onClick={() => onSelect(item)}
                        onMouseEnter={() => this.handleMouseEnter(index)}
                        style={{
                            background: index === highlightedIndex ? "#FAFBFC" : "#fff"
                        }}
                    >
                        {item.first_name} {item.last_name} <span>{item.phone}</span>
                    </li>
                ))}
            </ul>
        )
    }
}

export default AutocompleteDropdown
