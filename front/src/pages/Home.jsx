import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Building2, Users as UsersIcon, Route, Car, BookUser, NotebookText, Settings as SettingsIcon } from 'lucide-react'

import AuthContext from "../context/AuthContext"

import ProfileModal from "../components/modals/ProfileModal"
import Header from "../components/header/Header"
import Sidebar from "../components/sidebar/Sidebar"
import DashboardMain from "../components/dashboard/DashboardMain"
import Cities from "../components/cities/Cities"
import Routes from "../components/routes/Routes"
import Trips from "../components/trips/Trips"
import Passengers from "../components/passengers/Passengers"
import Users from "../components/users/Users"
import Journal from "../components/journal/Journal"
import Settings from "../components/settings/Settings"

class Home extends React.Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props)

        this.state = {
            isRenderProfileModal: false,

            activeView: 'dashboard',

            menuItems: [
                { id: 'dashboard', icon: LayoutDashboard, label: 'Головна' },
                { id: 'cities', icon: Building2, label: 'Міста' },
                { id: 'routes', icon: Route, label: 'Маршрути' },
                { id: 'trips', icon: Car, label: 'Поїздки' },
                { id: 'passengers', icon: BookUser, label: 'Пасажири' },
                { id: 'users', icon: UsersIcon, label: 'Команда' },
                { id: 'journal', icon: NotebookText, label: 'Журнал' },
                { id: 'settings', icon: SettingsIcon, label: 'Налаштування' },
            ],

            settings: {},

            citiesList: [],
            routesList: [],
            tripsList: [],
            passengersList: [],

            citiesCount: 0,
            routesCount: 0,
            tripsCount: 0,
            passengersCount: 0,

            renderCitiesModal: false,
            renderRoutesModal: false,
            renderPassengersModal: false,
            renderTripsModal: false,

            searchQuery: ''
        }
    }

    async componentDidMount() {
        await Promise.all([
            this.fetchSettings(),
            this.fetchCities(),
            this.fetchCitiesCount(),
            this.fetchRoutes(),
            this.fetchRoutesCount(),
            this.fetchTrips(),
            this.fetchTripsCount(),
            this.fetchPassengers(),
            this.fetchPassengersCount(),
        ])
    }

    fetchSettings = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/load`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            const data = await res.json()

            this.setState({
                settings: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    fetchCities = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/cities`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            const data = await res.json()

            this.setState({
                citiesList: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    fetchCitiesCount = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/cities/count`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            const data = await res.json()

            this.setState({
                citiesCount: data[0][0]
            })
        } catch (err) {
            console.error(err)
        }
    }

    fetchRoutes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/routes`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            const data = await res.json()

            this.setState({
                routesList: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    fetchRoutesCount = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/routes/count`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            const data = await res.json()

            this.setState({
                routesCount: data[0][0]
            })
        } catch (err) {
            console.error(err)
        }
    }

    fetchTrips = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/trips`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        user_id: this.context.user?.id
                    })
                }
            )

            const data = await res.json()

            this.setState({
                tripsList: data
            })

            return data
        } catch (err) {
            console.error(err)
        }
    }

    fetchTripsCount = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/trips/count`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            const data = await res.json()

            this.setState({
                tripsCount: data[0][0]
            })
        } catch (err) {
            console.error(err)
        }
    }

    fetchPassengers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/passengers`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            const data = await res.json()

            this.setState({
                passengersList: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    fetchPassengersCount = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/passengers/count`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            const data = await res.json()

            const count = data.count || 0

            this.setState({
                passengersCount: count
            })
        } catch (err) {
            console.error(err)
        }
    }

    setActiveView = (view) => {
        this.setState({ activeView: view })
    }

    setIsRenderProfileModal = (value) => {
        this.setState({ isRenderProfileModal: value })
    }

    setRenderCitiesModal = (value) => {
        this.setState({ renderCitiesModal: value })
    }

    setRenderRoutesModal = (value) => {
        this.setState({ renderRoutesModal: value })
    }

    setRenderTripsModal = (value) => {
        this.setState({ renderTripsModal: value })
    }

    setRenderPassengersModal = (value) => {
        this.setState({ renderPassengersModal: value })
    }

    setSearchQuery = (value) => {
        this.setState({ searchQuery: value })
    }

    generateRightForm = (num) => {
        if (num % 10 == 1) {
            return "поїздка"
        } else if (num % 10 >= 2 && num % 10 <= 4) {
            return "поїздки"
        } else {
            return "поїздок"
        }
    }

    // Renders
    renderView = () => {
        switch (this.state.activeView) {
            case 'dashboard':
                return <DashboardMain
                    user={this.context.user}

                    citiesCount={this.state.citiesCount}
                    fetchCities={this.fetchCities}
                    fetchCitiesCount={this.fetchCitiesCount}

                    renderCitiesModal={this.state.renderCitiesModal}
                    setRenderCitiesModal={this.setRenderCitiesModal}


                    routesCount={this.state.routesCount}
                    fetchRoutes={this.fetchRoutes}
                    fetchRoutesCount={this.fetchRoutesCount}

                    renderRoutesModal={this.state.renderRoutesModal}
                    setRenderRoutesModal={this.setRenderRoutesModal}


                    tripsCount={this.state.tripsCount}
                    fetchTrips={this.fetchTrips}
                    fetchTripsCount={this.fetchTripsCount}

                    renderTripsModal={this.state.renderTripsModal}
                    setRenderTripsModal={this.setRenderTripsModal}


                    passengersCount={this.state.passengersCount}
                    fetchPassengers={this.fetchPassengers}
                    fetchPassengersCount={this.fetchPassengersCount}

                    renderPassengersModal={this.state.renderPassengersModal}
                    setRenderPassengersModal={this.setRenderPassengersModal}


                    generateRightForm={this.generateRightForm}
                />
            case 'cities':
                return <Cities
                    user={this.context.user}

                    citiesList={this.state.citiesList}

                    renderCitiesModal={this.state.renderCitiesModal}
                    setRenderCitiesModal={this.setRenderCitiesModal}

                    fetchCities={this.fetchCities}
                    fetchCitiesCount={this.fetchCitiesCount}
                />
            case 'routes':
                return <Routes
                    user={this.context.user}

                    routesList={this.state.routesList}

                    renderRoutesModal={this.state.renderRoutesModal}
                    setRenderRoutesModal={this.setRenderRoutesModal}

                    fetchRoutes={this.fetchRoutes}
                    fetchRoutesCount={this.fetchRoutesCount}
                />
            case 'trips':
                return <Trips
                    user={this.context.user}

                    fetchRoutes={this.fetchRoutes}
                    fetchRoutesCount={this.fetchRoutesCount}

                    tripsList={this.state.tripsList}
                    fetchTrips={this.fetchTrips}
                    fetchTripsCount={this.fetchTripsCount}

                    renderTripsModal={this.state.renderTripsModal}
                    setRenderTripsModal={this.setRenderTripsModal}

                    fetchPassengers={this.fetchPassengers}
                    fetchPassengersCount={this.fetchPassengersCount}
                />
            case 'passengers':
                return <Passengers
                    user={this.context.user}

                    searchQuery={this.state.searchQuery}

                    renderPassengersModal={this.state.renderPassengersModal}
                    setRenderPassengersModal={this.setRenderPassengersModal}

                    passengersList={this.state.passengersList}
                    passengersCount={this.state.passengersCount}
                    fetchPassengers={this.fetchPassengers}
                    fetchPassengersCount={this.fetchPassengersCount}

                    tripsCount={this.state.tripsCount}
                    fetchTripsCount={this.fetchTripsCount}

                    generateRightForm={this.generateRightForm}
                />
            case 'users':
                return <Users
                    user={this.context.user}
                />
            case 'journal':
                return <Journal
                    user={this.context.user}
                />
            case 'settings':
                return <Settings
                    user={this.context.user}
                />
            default:
                return <DashboardMain
                    user={this.context.user}

                    citiesCount={this.state.citiesCount}
                    fetchCities={this.fetchCities}
                    fetchCitiesCount={this.fetchCitiesCount}

                    renderCitiesModal={this.state.renderCitiesModal}
                    setRenderCitiesModal={this.setRenderCitiesModal}


                    routesCount={this.state.routesCount}
                    fetchRoutes={this.fetchRoutes}
                    fetchRoutesCount={this.fetchRoutesCount}

                    renderRoutesModal={this.state.renderRoutesModal}
                    setRenderRoutesModal={this.setRenderRoutesModal}


                    tripsCount={this.state.tripsCount}
                    fetchTrips={this.fetchTrips}
                    fetchTripsCount={this.fetchTripsCount}

                    renderTripsModal={this.state.renderTripsModal}
                    setRenderTripsModal={this.setRenderTripsModal}


                    passengersCount={this.state.passengersCount}
                    fetchPassengers={this.fetchPassengers}
                    fetchPassengersCount={this.fetchPassengersCount}

                    renderPassengersModal={this.state.renderPassengersModal}
                    setRenderPassengersModal={this.setRenderPassengersModal}


                    generateRightForm={this.generateRightForm}
                />
        }
    }

    render() {
        return (
            <>
                {this.state.isRenderProfileModal && (
                    <ProfileModal context={this.context} setIsRenderProfileModal={this.setIsRenderProfileModal} />
                )}

                <div className="wrapper">
                    <Header context={this.context} activeView={this.state.activeView} setActiveView={this.setActiveView} setSearchQuery={this.setSearchQuery} setIsRenderProfileModal={this.setIsRenderProfileModal} />

                    <main>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={this.state.activeView}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {this.renderView()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                <Sidebar siteName={this.state.settings?.general?.site_name} menuItems={this.state.menuItems} activeView={this.state.activeView} setActiveView={this.setActiveView} />
            </>
        )
    }
}

export default Home