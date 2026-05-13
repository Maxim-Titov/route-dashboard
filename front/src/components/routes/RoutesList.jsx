import React from "react"
import { Info, Trash2, Star } from 'lucide-react'

import RouteDetailsModal from "../modals/RouteDetailsModal"
import DeleteRouteModal from "../modals/DeleteRouteModal"
import MessageModal from "../modals/MessageModal"

class RoutesList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            renderDeleteRouteModal: false,
            renderRouteDetailsModal: false,

            routeId: null,
            routeName: null,
            routeFrom: null,
            routeTo: null,

            isFail: false,
            failMessage: ''
        }
    }

    toggleLoyalty = async (routeId, currentValue) => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/routes/loyalty/toggle`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ route_id: routeId, enabled: !currentValue })
                }
            )

            if (res.status === 401) {
                const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include"
                })
                if (!refreshRes.ok) return
                const data = await refreshRes.json()
                localStorage.setItem("token", data.access_token)

                res = await fetch(
                    `${import.meta.env.VITE_API_URL}/routes/loyalty/toggle`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({ route_id: routeId, enabled: !currentValue })
                    }
                )
            }

            await this.props.fetchRoutes()
        } catch (err) {
            console.error(err)
        }
    }

    deleteRoute = async (id) => {
        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/routes/delete`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        route_id: id
                    })
                }
            )

            if (res.status === 401) {
                const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include"
                })

                if (!refreshRes.ok) {
                    return null
                }

                const data = await refreshRes.json()
                localStorage.setItem("token", data.access_token)

                res = await fetch(
                    `${import.meta.env.VITE_API_URL}/routes/delete`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            route_id: id
                        })
                    }
                )
            }

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
        await Promise.all([
            this.props.fetchRoutes(),
            this.props.fetchRoutesCount(),
        ])

        if (this.state.isFail) {
            return
        }

        this.setRenderDeleteRouteModal(false)
    }

    setIsFail = (value) => {
        this.setState({ isFail: value })
    }

    setFailMessage = (value) => {
        this.setState({ failMessage: value })
    }

    setRenderDeleteRouteModal = (value) => {
        this.setState({ renderDeleteRouteModal: value })
    }

    setRenderRouteDetailsModal = (value) => {
        this.setState({ renderRouteDetailsModal: value })
    }

    setRoute = (id, name, from = null, to = null) => {
        this.setState({
            routeId: id,
            routeName: name,
            routeFrom: from,
            routeTo: to
        })
    }

    render() {
        const { routesList } = this.props

        const routes = routesList.map((route) => ({
            id: route.id,
            from: route.from_city,
            to: route.to_city,
            trips_count: route.trips_count,
            loyalty_enabled: route.loyalty_enabled
        }));

        return (
            <div className="routes-list">
                {routes.map((route, index) => (
                    <div className="card" key={index}>
                        <div className="header">
                            #{route.id} {route.from} → {route.to}

                            <div className="actions">
                                <div
                                    className={`icon-wrapper loyalty ${route.loyalty_enabled ? 'active' : ''} ${this.props.user?.role === 'user' ? 'forbidden' : ''}`}
                                    title={route.loyalty_enabled ? 'Лояльність увімкнена' : 'Увімкнути лояльність'}
                                    onClick={() => {
                                        if (this.props.user?.role === 'user') return
                                        this.toggleLoyalty(route.id, route.loyalty_enabled)
                                    }}
                                >
                                    <Star />
                                </div>
                                <div className="icon-wrapper info" onClick={async () => {
                                    this.setRoute(
                                        route.id,
                                        `${route.from} → ${route.to}`,
                                        route.from,
                                        route.to
                                    );
                                    this.setRenderRouteDetailsModal(true);
                                }}>
                                    <Info />
                                </div>
                                <div className={`icon-wrapper trash ${this.props.user?.role === 'user' ? 'forbidden' : ''}`} onClick={() => {
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
                                {route.loyalty_enabled === 1 && (
                                    <p className="loyalty-badge">Програма лояльності активна</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {this.state.renderRouteDetailsModal && (
                    <RouteDetailsModal
                        id={this.state.routeId}
                        name={this.state.routeName}
                        from={this.state.routeFrom}
                        to={this.state.routeTo}
                        user={this.props.user}
                        setRenderRouteDetailsModal={this.setRenderRouteDetailsModal}
                    />
                )}

                {this.state.renderDeleteRouteModal && (
                    <DeleteRouteModal
                        user={this.props.user}
                        setRenderDeleteRouteModal={this.setRenderDeleteRouteModal}
                        routeId={this.state.routeId}
                        routeName={this.state.routeName}
                        onDelete={this.onDelete}
                    />
                )}

                {this.state.isFail && this.state.failMessage === 'route has trips' && (
                    <MessageModal header="Маршрут має поїздки" body='Щоб видалити маршрут, він повинен бути без поїздок' action={this.setIsFail} />
                )}
            </div>
        )
    }
}

export default RoutesList