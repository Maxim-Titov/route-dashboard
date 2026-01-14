import React from "react"
import { SlidersHorizontal } from 'lucide-react'

class FilterButton extends React.Component {
    render() {
        return (
            <button className="filter-button" type="button" onClick={() => this.props.setIsFilters()}>
                <SlidersHorizontal />
                <p className="inter-font">Фільтри</p>
            </button>
        )
    }
}

export default FilterButton