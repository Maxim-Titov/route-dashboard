import React from "react"
import { X, Plus, Save } from 'lucide-react'

import CitySearchInput from "../CitySearchInput"
import MessageModal from "./MessageModal"

class RouteDetailsModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            columns: [
                { id: 'from_fixed', label: this.props.from, fixed: true }
            ],
            rows: [
                { id: 'to_fixed', name: this.props.to, fixed: true, prices: { 'from_fixed': '' } }
            ],

            renderMessage: false
        }
    }

    async componentDidMount() {
        await this.fetchPricing()
    }

    fetchPricing = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/routes/pricing`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        route_id: this.props.id
                    })
                }
            )

            const data = await res.json()

            const columnsMap = {}
            const rowsMap = {}

            data.forEach(p => {
                columnsMap[p.from_city_id] = p.from_city_name
                rowsMap[p.to_city_id] = p.to_city_name
            })

            const columns = Object.entries(columnsMap).map(([id, name]) => ({
                id: Number(id),
                label: name
            }))

            const rows = Object.entries(rowsMap).map(([id, name]) => ({
                id: Number(id),
                name,
                prices: {}
            }))

            rows.forEach(row => {
                columns.forEach(col => {
                    row.prices[col.id] = ''
                })
            })

            data.forEach(p => {
                const row = rows.find(r => r.id === p.to_city_id)
                if (row) {
                    row.prices[p.from_city_id] = p.price
                }
            })

            this.setState({ columns, rows })

        } catch (err) {
            console.error(err)
        }
    }

    savePricing = async () => {

        const { columns, rows } = this.state

        const pricing = []

        rows.forEach(row => {

            columns.forEach(col => {

                const price = row.prices[col.id]

                if (price !== '' && price !== null) {

                    pricing.push({

                        route_id: this.props.id,

                        from_city_id: col.id,
                        to_city_id: row.id,

                        price: Number(price)

                    })

                }

            })

        })

        try {
            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/routes/pricing/update`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ pricing })
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
                    `${import.meta.env.VITE_API_URL}/routes/pricing/update`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({ pricing })
                    }
                )
            }

            const data = await res.json()

            if (data.success == true) {
                this.setState({ renderMessage: true })
            }

        } catch (err) {

            console.error(err)

        }

    }

    writeToJournal = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/journal/write`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: this.props.user?.id,
                        entity_type: 'routes',
                        action: 'edit',
                        description: `Зміна цін для маршруту "${this.props.name}"`
                    })
                }
            )

            return await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    setRenderMessage = (value) => {
        this.setState({ renderMessage: value })
    }

    addRow = () => {
        this.setState(prev => {

            const prices = {}

            prev.columns.forEach(col => {
                prices[col.id] = ''
            })

            return {
                rows: [
                    ...prev.rows,
                    {
                        id: `tmp_${Date.now()}`,
                        name: '',
                        prices
                    }
                ]
            }
        })
    }

    addColumn = () => {
        const id = `tmp_${Date.now()}`

        this.setState(prev => ({

            columns: [
                ...prev.columns,
                { id, label: '' }
            ],

            rows: prev.rows.map(row => ({
                ...row,
                prices: {
                    ...row.prices,
                    [id]: ''
                }
            }))
        }))
    }

    removeRow = (id) => {
        this.setState(prev => {
            const row = prev.rows.find(r => r.id === id)
            if (row?.fixed) return prev

            return {
                rows: prev.rows.filter(r => r.id !== id)
            }
        })
    }

    removeColumn = (id) => {
        this.setState(prev => {
            const col = prev.columns.find(c => c.id === id)
            if (col?.fixed) return prev

            return {
                columns: prev.columns.filter(c => c.id !== id),
                rows: prev.rows.map(row => {
                    const prices = { ...row.prices }
                    delete prices[id]
                    return { ...row, prices }
                })
            }
        })
    }

    updateRowName = (id, value) => {
        this.setState(prev => ({
            rows: prev.rows.map(s =>
                s.id === id ? { ...s, name: value } : s
            )
        }))
    }

    selectRowCity = (oldId, city) => {

        this.setState(prev => {

            const newRows = prev.rows.map(row =>
                row.id === oldId
                    ? { ...row, id: city.id, name: city.city }
                    : row
            )

            return { rows: newRows }

        })

    }

    updateColumnLabel = (id, value) => {
        this.setState(prev => ({
            columns: prev.columns.map(col =>
                col.id === id ? { ...col, label: value } : col
            )
        }))
    }

    selectColumnCity = (oldId, city) => {

        this.setState(prev => {

            const newColumns = prev.columns.map(col =>
                col.id === oldId
                    ? { ...col, id: city.id, label: city.city }
                    : col
            )

            const newRows = prev.rows.map(row => {

                const prices = { ...row.prices }

                prices[city.id] = prices[oldId] || ''
                delete prices[oldId]

                return { ...row, prices }

            })

            return {
                columns: newColumns,
                rows: newRows
            }

        })

    }

    updatePrice = (rowId, colId, value) => {

        this.setState(prev => ({

            rows: prev.rows.map(row =>

                row.id === rowId
                    ? {
                        ...row,
                        prices: {
                            ...row.prices,
                            [colId]: value
                        }
                    }
                    : row
            )

        }))
    }

    render() {
        const { id, name } = this.props

        return (
            <>
                <div className="modal-wrapper">
                    <div className="route-details-modal">
                        <div className="header">
                            <div className="title">
                                <h2>{`${name}`}</h2>
                            </div>


                            <div className="icon-wrapper close" onClick={() => this.props.setRenderRouteDetailsModal(false)}>
                                <X />
                            </div>
                        </div>

                        <div className="body">
                            <div className="table-card">
                                <div className="title">
                                    <p>Зупинки та ціни</p>
                                </div>

                                <div className="table-wrapper">
                                    <table className="route-table">
                                        <thead>
                                            <tr>
                                                <th>Зупинка</th>

                                                {this.state.columns.map(col => (
                                                    <th key={col.id}>
                                                        <div className="column-header">
                                                            <CitySearchInput
                                                                placeholder="Місто"
                                                                value={col.label}
                                                                onChange={(value) => this.updateColumnLabel(col.id, value)}
                                                                onSelect={(city) => this.selectColumnCity(col.id, city)}
                                                            />

                                                            {!col.fixed && (
                                                                <button
                                                                    className="remove"
                                                                    onClick={() => this.removeColumn(col.id)}
                                                                >
                                                                    <X />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}

                                                <th>
                                                    <button
                                                        className="add"
                                                        onClick={this.addColumn}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {this.state.rows.length === 0 && (
                                                <tr className="empty-row">
                                                    <td colSpan={this.state.columns.length + 2}>
                                                        Поки що немає жодної зупинки
                                                    </td>
                                                </tr>
                                            )}

                                            {this.state.rows.map(row => (
                                                <tr key={row.id}>
                                                    <td>
                                                        <CitySearchInput
                                                            placeholder="Назва зупинки"
                                                            value={row.name}
                                                            onChange={(value) => this.updateRowName(row.id, value)}
                                                            onSelect={(city) => this.selectRowCity(row.id, city)}
                                                        />
                                                    </td>

                                                    {this.state.columns.map(col => (
                                                        <td key={col.id}>
                                                            <input
                                                                type="number"
                                                                placeholder="₴"
                                                                value={row.prices[col.id]}
                                                                onChange={(e) =>
                                                                    this.updatePrice(row.id, col.id, e.target.value)
                                                                }
                                                            />
                                                        </td>
                                                    ))}

                                                    <td className="actions">
                                                        {!row.fixed && (
                                                            <button
                                                                className="remove"
                                                                onClick={() => this.removeRow(row.id)}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}

                                            <tr>
                                                <td>
                                                    <button
                                                        className="add"
                                                        onClick={this.addRow}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="footer">
                            <button className="inter-font add" onClick={() => this.props.setRenderRouteDetailsModal(false)}>
                                <p>Скасувати</p>
                            </button>

                            <button className="inter-font save" onClick={async () => {
                                await this.savePricing()
                                await this.writeToJournal()
                            }}>
                                <Save size={16} />
                                <p>Зберегти</p>
                            </button>
                        </div>
                    </div>
                </div>

                {this.state.renderMessage && (
                    <MessageModal header="Успішно" body="Ціни маршруту успішно збережено" action={this.setRenderMessage} />
                )}
            </>
        )
    }
}

export default RouteDetailsModal