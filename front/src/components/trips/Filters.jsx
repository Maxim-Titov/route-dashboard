import React from "react"
import { Filter, StepBack, RotateCcw } from "lucide-react"

class Filters extends React.Component {
    toggleStatus = (status) => {
        const { filters, setFilters } = this.props

        const updated = filters.status.includes(status)
            ? filters.status.filter(s => s !== status)
            : [...filters.status, status]

        setFilters("status", updated)
    }

    formatStatus = (status) => {
        switch (status) {
            case 'planned':
                return 'Заплановано'
            case 'active':
                return 'В дорозі'
            case 'completed':
                return 'Завершено'
            case 'cancelled':
                return 'Скасовано'
            default:
                return 'Заплановано'
        }
    }

    render() {
        const { filters, setFilters, sortTypeDesc, onToggle, onApply, onReset } = this.props

        return (
            <div className="filters-wrapper">
                <div className="card">
                    <div className="header">
                        <Filter /> Фільтри
                    </div>

                    <div className="content">
                        <form id="filters">
                            <div className="settings-wrapper">
                                <div className="buttons">
                                    <button
                                        type="button"
                                        className={`sort-toggle ${sortTypeDesc ? "desc" : "asc"}`}
                                        onClick={onToggle}
                                    >
                                        <StepBack />
                                        <span className="inter-font">Сортування</span>
                                    </button>

                                    <button type="button" className="reset-filters" onClick={onReset}>
                                        <RotateCcw />
                                        <span className="inter-font">Очистити</span>
                                    </button>

                                    <button type="button" className="apply-filters" onClick={onApply}>
                                        <Filter />
                                        <span className="inter-font">Застосувати</span>
                                    </button>
                                </div>
                            </div>

                            {/* DATE */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="date-from">Дата з</label>
                                    <input
                                        id="date-from"
                                        name="date-from"
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={e => setFilters("dateFrom", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="date-to">Дата до</label>
                                    <input
                                        id="date-to"
                                        name="date-to"
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={e => setFilters("dateTo", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* ROUTE */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city-from">Звідки</label>
                                    <input
                                        id="city-from"
                                        name="city-from"
                                        type="text"
                                        placeholder="Київ"
                                        value={filters.cityFrom}
                                        onChange={e => setFilters("cityFrom", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="city-to">Куди</label>
                                    <input
                                        id="city-to"
                                        name="city-to"
                                        type="text"
                                        placeholder="Варшава"
                                        value={filters.cityTo}
                                        onChange={e => setFilters("cityTo", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* STATION */}
                            <div className="form-row column">
                                <div className="form-group">
                                    <label htmlFor="station">Через місто</label>
                                    <input
                                        id="station"
                                        name="station"
                                        type="text"
                                        placeholder="Луцьк"
                                        value={filters.stationCity}
                                        onChange={e => setFilters("stationCity", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* PASSENGERS */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="passengers-count-from">Пасажирів від</label>
                                    <input
                                        id="passengers-count-from"
                                        name="passengers-count-from"
                                        type="number"
                                        placeholder="2"
                                        value={filters.passengersFrom}
                                        onChange={e => setFilters("passengersFrom", e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="passengers-count-to">Пасажирів до</label>
                                    <input
                                        id="passengers-count-to"
                                        name="passengers-count-to"
                                        type="number"
                                        placeholder="30"
                                        value={filters.passengersTo}
                                        onChange={e => setFilters("passengersTo", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* CHECKBOX */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="free-space">
                                        <input
                                            id="free-space"
                                            className="free-seats"
                                            name="free-space"
                                            type="checkbox"
                                            checked={filters.hasFreeSeats}
                                            onChange={e => setFilters("hasFreeSeats", e.target.checked)}
                                        />

                                        <span>Є вільні місця</span>
                                    </label>
                                </div>
                            </div>

                            {/* STATUS */}
                            <div className="form-row column status">
                                <div className="form-group">
                                    <label>Статус</label>
                                    <div className="buttons">
                                        {["planned", "active", "completed", "cancelled"].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                className={filters.status.includes(s) ? "active" : ""}
                                                onClick={() => this.toggleStatus(s)}
                                            >
                                                <span className="inter-font">{this.formatStatus(s)}</span>
                                            </button>
                                        ))}
                                    </div>
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
