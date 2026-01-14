import React from "react"

class PopularRoutes extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            popularRoutes: []
        }
    }

    componentDidMount() {
        this.fetchPopularRoutes()
    }

    fetchPopularRoutes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/routes/popular`)
            const data = await res.json()

            this.setState({
                popularRoutes: data
            })
        } catch (err) {
            console.error(err)
        }
    }
    
    render() {
        const routes = []

        this.state.popularRoutes.map((route, index) => {
            routes[index] = {
                from: route[0],
                to: route[1],
                trips: route[2] || 0
            }
        })

        return (
            <div className="popular-routes">
                <div className="card">
                    <h3>Популярні маршрути</h3>

                    <div className="content">
                        {routes.map((route, index) => (
                            <div key={index}>
                                <p className="label">{route.from} → {route.to}</p>
                                <p className="value">{route.trips} {this.props.generateRightForm(route.trips)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

export default PopularRoutes