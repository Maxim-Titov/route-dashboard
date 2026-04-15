import React from "react"

import ViewHeader from "../ViewHeader"
import FilterButton from "../FilterButton"
import AddPassengerButton from "../AddPassengerButton"
import Filters from "./Filters"
import GeneralStatistics from "./GeneralStatistics"
import PassengersList from "./PassengersList"
import AddPassengerModal from "../modals/AddPassangerModal"
import MessageModal from "../modals/MessageModal"

class Passengers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isFilters: false,
            filtersCount: 0,
            sortTypeDesc: true,
            filters: {
                ageFrom: '',
                ageTo: '',
                cityFrom: '',
                cityTo: '',
            },
            passengersToShow: this.props.passengersList,
            viewType: 'flex',
            isError: false
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.passengersList !== this.props.passengersList) {
            this.setState({
                passengersToShow: this.props.passengersList
            })
        }
    }

    filterPassengers = async () => {
        const { filters, sortTypeDesc } = this.state

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/passengers/filter`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sort_by: sortTypeDesc ? 'desc' : 'asc',
                        age_from: +filters.ageFrom,
                        age_to: +filters.ageTo,
                        city_from: filters.cityFrom,
                        city_to: filters.cityTo
                    })
                }
            )

            const data = await res.json()

            if (data.error && data.error === 'age_from cannot be greater than age_to') {
                this.setState({ isError: true })
                return
            }

            this.setState({
                passengersToShow: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    setIsError = (value) => {
        this.setState({ isError: value })
    }

    setIsFilters = () => {
        this.setState({ isFilters: !this.state.isFilters })
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

    setViewType = (value) => {
        this.setState({ viewType: value })
    }

    resetFilters = () => {
        this.setState({
            sortTypeDesc: true,
            filters: {
                ageFrom: '',
                ageTo: '',
                cityFrom: '',
                cityTo: '',
            },
            passengersToShow: this.props.passengersList
        })
    }

    render() {

        return (
            <div className="passengers-wrapper">
                {this.props.renderPassengersModal && (
                    <AddPassengerModal user={this.props.user} setRenderPassengersModal={this.props.setRenderPassengersModal} fetchTripsCount={this.props.fetchTripsCount} fetchPassengers={this.props.fetchPassengers} fetchPassengersCount={this.props.fetchPassengersCount} />
                )}

                <div className="container">
                    <div className="header">
                        <ViewHeader title={"Пасажири"} subtitle={"Керуйте списком ваших пасажирів"} />

                        <div className="buttons-wrapper">
                            <FilterButton setIsFilters={this.setIsFilters} />
                            <AddPassengerButton role={this.props.user?.role} setRenderPassengersModal={this.props.setRenderPassengersModal} />
                        </div>
                    </div>

                    {this.state.isFilters && <Filters filters={this.state.filters} sortTypeDesc={this.state.sortTypeDesc} setFilters={this.setFilters} onToggle={this.toggleSort} onApply={this.filterPassengers} onReset={this.resetFilters} setViewType={this.setViewType} />}

                    <GeneralStatistics tripsCount={this.props.tripsCount} passengersCount={this.props.passengersCount} />
                    <PassengersList user={this.props.user} viewType={this.state.viewType} searchQuery={this.props.searchQuery} passengersList={this.state.passengersToShow} generateRightForm={this.props.generateRightForm} fetchTripsCount={this.props.fetchTripsCount} fetchPassengers={this.props.fetchPassengers} fetchPassengersCount={this.props.fetchPassengersCount} />
                </div>

                {this.state.isError && (
                    <MessageModal header='"Вік від" більший ніж "Вік до"' body='"Вік від" не може бути більший ніж "Вік до"' action={this.setIsError} />
                )}
            </div>
        )
    }
}

export default Passengers