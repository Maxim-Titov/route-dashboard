import React from "react"

import ViewHeader from "../ViewHeader"
import RoutesList from "./RoutesList"
import AddRouteButton from "../AddRouteButton"
import AddRouteModal from "../modals/AddRouteModal"
import FilterButton from "../FilterButton"
import Filters from "./Filters"
import MessageModal from "../modals/MessageModal"

class Routes extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isFilters: false,
            filtersCount: 0,
            sortTypeDesc: true,
            filters: {
                tripsCountFrom: '',
                tripsCountTo: '',
                cityFrom: '',
                cityTo: '',
            },
            routesToShow: this.props.routesList,
            isError: false
        }
    }

    filterRoutes = async () => {
        const { filters, sortTypeDesc } = this.state
        
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/routes/filter`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sort_by: sortTypeDesc ? 'desc' : 'asc',
                        trips_count_from: this.parseNumber(filters.tripsCountFrom),
                        trips_count_to: this.parseNumber(filters.tripsCountTo),
                        city_from: filters.cityFrom || null,
                        city_to: filters.cityTo || null
                    })
                }
            )

            const data = await res.json()

            if (data.error && data.error === 'trips_count_from cannot be greater than trips_count_to') {
                this.setState({ isError: true })
                return
            }

            this.setState({
                routesToShow: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    parseNumber = (v) =>
        v === '' || v === null ? null : Number(v)

    setIsError = (value) => {
        this.setState({ isError: value })
    }

    setIsFilters = () => {
        this.setState({isFilters: !this.state.isFilters})
    }

    toggleSort = () => {
        this.setState({ sortTypeDesc: !this.state.sortTypeDesc })
    }

    setFilters = (name, value) => {
        this.setState(prev => ({
            filters: {
                ...prev.filters,
                [name]: value
            }
        }))
    }

    resetFilters = () => {
        this.setState({
            sortTypeDesc: true,
            filters: {
                tripsCountFrom: '',
                tripsCountTo: '',
                cityFrom: '',
                cityTo: '',
            },
            routesToShow: this.props.routesList
        })
    }

    render() {
        return (
            <div className="routes-wrapper">  
                {this.props.renderRoutesModal && (
                    <AddRouteModal setRenderRoutesModal={this.props.setRenderRoutesModal} fetchRoutes={this.props.fetchRoutes} fetchRoutesCount={this.props.fetchRoutesCount}/>
                )}

                <div className="container">
                    <div className="header">
                        <ViewHeader title='Маршрути' subtitle='Керуйте своїми маршрутами' />
                        
                        <div className="buttons-wrapper">
                            <FilterButton setIsFilters={this.setIsFilters} />
                            <AddRouteButton setRenderRoutesModal={this.props.setRenderRoutesModal} />
                        </div>
                    </div>

                    {this.state.isFilters && <Filters filters={this.state.filters} sortTypeDesc={this.state.sortTypeDesc} setFilters={this.setFilters}  onToggle={this.toggleSort} onApply={this.filterRoutes} onReset={this.resetFilters} />}

                    <RoutesList routesList={this.state.routesToShow} fetchRoutes={this.props.fetchRoutes} fetchRoutesCount={this.props.fetchRoutesCount} />
                </div>

                {this.state.isError && (
                    <MessageModal header='"Кількість пасажирів від" більше ніж "Кількість пасажирів до"' body='"Кількість пасажирів від" не може бути більше ніж "Кількість пасажирів до"' action={this.setIsError} />
                )}
            </div>
        )
    }
}

export default Routes