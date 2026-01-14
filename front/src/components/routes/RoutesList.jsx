import React from "react"
import { Trash2 } from 'lucide-react'

import DeleteRouteModal from "../modals/DeleteRouteModal"
import MessageModal from "../modals/MessageModal"

class RoutesList extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            renderDeleteRouteModal: false,

            routeId: null,
            routeName: null,

            isFail: false,
            failMessage: ''
        }
    }

    setIsFail = (value) => {
        this.setState({ isFail: value })
    }

    setFailMessage = (value) => {
        this.setState({ failMessage: value })
    }

    deleteRoute = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/routes/delete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        route_id: id
                    })
                }
            )

            const data = await res.json()

            if (!data.success) {
                this.setIsFail(true)
                this.setFailMessage(data.message)
            }

            return data
        } catch (err) {
            console.error(err)
        }
    }

    onDelete = async (id) => {
        await this.deleteRoute(id)
        await this.props.fetchRoutes()
        await this.props.fetchRoutesCount()
        
        if (this.state.isFail) {
            return
        }

        this.setRenderDeleteRouteModal(false)
    }

    setRenderDeleteRouteModal = (value) => {
        this.setState({ renderDeleteRouteModal: value })
    }

    setRoute = (id, name) => {
        this.setState({
            routeId: id,
            routeName: name
        })
    }

    render() {
        const { routesList } = this.props

        const routes = routesList.map((route) => ({
            id: route.id,
            from: route.from_city,
            to: route.to_city,
            trips_count: route.trips_count
        }));

        return (
            <div className="routes-list">
                {routes.map((route, index) => (
                    <div className="card" key={index}>
                        <div className="header">
                            {route.from} → {route.to}

                            <div className="actions">
                                <div className="icon-wrapper trash" onClick={() => {
                                    this.setRoute(
                                        route.id,
                                        `${route.from} → ${route.to}`
                                    );
                                    this.setRenderDeleteRouteModal(true);
                                }}>
                                    <Trash2 />
                                </div>
                            </div>
                        </div>

                        <div className="content">
                            <div className="details">
                                <p><span>Кількість поїздок:</span> {route.trips_count}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {this.state.renderDeleteRouteModal && (
                    <DeleteRouteModal
                        setRenderDeleteRouteModal={this.setRenderDeleteRouteModal}
                        routeId={this.state.routeId}
                        routeName={this.state.routeName}
                        onDelete={this.onDelete}
                    />
                )}

                {this.state.isFail && this.state.failMessage === 'route has trips' && (
                    <MessageModal header="Маршрут має поїздки" body='Щоб видалити маршрут, він повинен бути без поїздок' action={this.setIsFail}/>
                )}
            </div>
        )
    }
}

export default RoutesList