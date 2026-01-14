import React from "react"
import { Filter, StepBack, RotateCcw } from 'lucide-react'


class Filters extends React.Component {
    render() {
        const { filters, setFilters, sortTypeDesc, onToggle } = this.props

        return (
            <div className="filters-wrapper">
                <div className="card">
                    <div className="header">
                        <Filter />
                        Фільтри
                    </div>
                    
                    <div className="content">
                        <form id="filters">
                            <div className="settings-wrapper">
                                <div className="buttons">
                                    <button
                                        type="button"
                                        className={`sort-toggle ${sortTypeDesc ? "desc" : "asc"}`}
                                        onClick={() => onToggle('asc')}
                                    >
                                        <StepBack />
                                        <span className="inter-font">Сортування</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="reset-filters"
                                        onClick={this.props.onReset}
                                    >
                                        <RotateCcw />
                                        <span className="inter-font">Очистити</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="apply-filters"
                                        onClick={this.props.onApply}
                                    >
                                        <Filter />
                                        <span className="inter-font">Застосувати</span>
                                    </button>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="age-from">Кількість пасажирів від</label>
                                    <input
                                        type="number"
                                        name="age-from"
                                        id="age-from"
                                        value={filters.tripsCountFrom}
                                        onChange={(e) => setFilters('tripsCountFrom', e.target.value)}
                                        placeholder="2" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="age-to">Кількість пасажирів до</label>
                                    <input
                                        type="number"
                                        name="age-to"
                                        id="age-to"
                                        value={filters.tripsCountTo}
                                        onChange={(e) => setFilters('tripsCountTo', e.target.value)}
                                        placeholder="6" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city-from">Звідки</label>
                                    <input
                                        type="text"
                                        name="city-from"
                                        id="city-from"
                                        value={filters.cityFrom}
                                        onChange={(e) => setFilters('cityFrom', e.target.value)}
                                        placeholder="Луцьк" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="city-to">Куди</label>
                                    <input
                                        type="text"
                                        name="city-to"
                                        id="city-to"
                                        value={filters.cityTo}
                                        onChange={(e) => setFilters('cityTo', e.target.value)}
                                        placeholder="Варшава" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default Filters