import React from "react"

import ViewHeader from "../ViewHeader"
import CitiesList from "./CitiesList"
import AddCityButton from "../AddCityButton"
import AddCityModal from "../modals/AddCityModal"
import MessageModal from "../modals/MessageModal"

class Cities extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            citiesToShow: this.props.citiesList,
            isError: false
        }
    }

    setIsError = (value) => {
        this.setState({ isError: value })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.citiesList !== this.props.citiesList) {
            this.setState({ citiesToShow: this.props.citiesList })
        }
    }

    render() {
        return (
            <div className="cities-wrapper">
                {this.props.renderCitiesModal && (
                    <AddCityModal user={this.props.user} setRenderCitiesModal={this.props.setRenderCitiesModal} fetchCities={this.props.fetchCities} fetchCitiesCount={this.props.fetchCitiesCount} />
                )}

                <div className="container">
                    <div className="header">
                        <ViewHeader title="Міста" subtitle="Керуйте списком міст" />

                        <div className={`buttons-wrapper ${this.props.user?.role === 'user' ? 'forbidden' : ''}`}>
                            <AddCityButton setRenderCitiesModal={this.props.setRenderCitiesModal} />
                        </div>
                    </div>
                    <CitiesList user={this.props.user} citiesList={this.state.citiesToShow} fetchCities={this.props.fetchCities} />
                </div>

                {this.state.isError && (
                    <MessageModal header="Помилка" body="Не вдалося виконати операцію" action={this.setIsError} />
                )}
            </div>
        )
    }
}

export default Cities
