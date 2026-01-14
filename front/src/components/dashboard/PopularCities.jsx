import React from "react"

class PopularCities extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            popularCities: []
        }
    }

    componentDidMount() {
        this.fetchPopularCities()
    }

    fetchPopularCities = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/cities/popular`)
            const data = await res.json()

            this.setState({
                popularCities: data
            })
        } catch (err) {
            console.error(err)
        }
    }
    
    render() {
        const cities = []

        this.state.popularCities.map((city, index) => {
            cities[index] = {
                city: city[0],
                trips: city[1] || 0
            }
        })

        return (
            <div className="popular-cities">
                <div className="card">
                    <h3>Популярні міста</h3>

                    <div className="content">
                        {cities.map((city, index) => (
                            <div key={index}>
                                <p className="label">{city.city}</p>
                                <p className="value">{city.trips} {this.props.generateRightForm(city.trips)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

export default PopularCities