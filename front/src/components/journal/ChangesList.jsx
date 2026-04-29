import React from "react"

class ChangesList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            changesList: []
        }
    }

    async componentDidMount() {
        this.fetchJournal()
    }

    fetchJournal = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/journal`)
            const data = await res.json()

            this.setState({
                changesList: data
            })
        } catch (err) {
            console.error(err)
        }
    }

    renderAction = (action) => {
        switch (action) {
            case 'create':
                return 'Створення'
            case 'edit':
                return 'Редагування'
            case 'delete':
                return 'Видалення'
        }
    }

    renderEntityType = (entity) => {
        switch (entity) {
            case 'cities':
                return 'Міста'
            case 'routes':
                return 'Маршрути'
            case 'trips':
                return 'Поїздки'
            case 'passengers':
                return 'Пасажири'
            case 'users':
                return 'Команда'
            case 'settings':
                return 'Налаштування'
        }
    }

    render() {
        const { changesList } = this.state

        return (
            <div className="changes-list">
                {changesList.map((change, index) => (
                    <div className="card" key={index}>
                        <div className="header">
                            <div className="label">
                                {this.renderEntityType(change.entity_type)} | {this.renderAction(change.action)}
                            </div>

                            <div className="time">
                                {new Date(change.event_time + "Z").toLocaleString("uk-UA", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                })}
                            </div>
                        </div>

                        <div className="content">
                            <div className="description">
                                {change.description}
                            </div>

                            <div className="user">
                                {change.login} ({change.name} {change.surname})
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}

export default ChangesList