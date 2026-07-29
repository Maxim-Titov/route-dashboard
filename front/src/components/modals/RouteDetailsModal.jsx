import React from "react"
import { X, Plus, Save } from 'lucide-react'

import { SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import DndProvider from "../../../providers/DndProvider";
import SortableRow from "../routes/SortableRow";
import SortableColumn from "../routes/SortableColumn";
import MessageModal from "./MessageModal"

class RouteDetailsModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            columns: [
                { id: 'from_fixed', label: this.props.from, fixed: true }
            ],
            rows: [
                { id: 'to_fixed', name: this.props.to, fixed: true, prices: { 'from_fixed': { uah: '', pln: '' } } }
            ],

            renderMessage: false,

            isDragging: false,
            dragStartIndex: null,
            dragOverIndex: null
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

            const columns = data.columns

            const rows = data.rows.map(row => ({
                ...row,
                prices: {}
            }))

            rows.forEach(row => {
                columns.forEach(col => {
                    row.prices[col.id] = {
                        uah: "",
                        pln: ""
                    }
                })
            })

            data.pricing.forEach(price => {
                const row = rows.find(r => r.id === price.to_city_id)

                if (row) {
                    row.prices[price.from_city_id] = {
                        uah: price.price ?? "",
                        pln: price.price_pln ?? ""
                    }
                }
            })

            this.setState({
                columns,
                rows
            })

        } catch (err) {
            console.error(err)
        }
    }

    savePricing = async () => {

        const { columns, rows } = this.state

        const pricing = []

        rows.forEach(row => {

            columns.forEach(col => {

                if (!Number.isInteger(col.id) || !Number.isInteger(row.id)) return

                const cell = row.prices[col.id]
                const uah = cell?.uah
                const pln = cell?.pln

                const hasUah = uah !== '' && uah !== null && uah !== undefined && Number(uah) > 0
                const hasPln = pln !== '' && pln !== null && pln !== undefined && Number(pln) > 0

                if (hasUah || hasPln) {
                    pricing.push({
                        route_id: this.props.id,
                        from_city_id: col.id,
                        to_city_id: row.id,
                        price: hasUah ? Number(uah) : null,
                        price_pln: hasPln ? Number(pln) : null
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
                    body: JSON.stringify({
                        route_id: this.props.id,
                        columns: this.state.columns,
                        rows: this.state.rows,
                        pricing
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
                    `${import.meta.env.VITE_API_URL}/routes/pricing/update`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            route_id: this.props.id,
                            columns: this.state.columns,
                            rows: this.state.rows,
                            pricing
                        })
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

    setIsDragging = (value) => {
        this.setState({ isDragging: value })
    }

    addRow = () => {
        this.setState(prev => {

            const prices = {}

            prev.columns.forEach(col => {
                prices[col.id] = { uah: '', pln: '' }
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
                    [id]: { uah: '', pln: '' }
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

                prices[city.id] = prices[oldId] || { uah: '', pln: '' }
                delete prices[oldId]

                return { ...row, prices }

            })

            return {
                columns: newColumns,
                rows: newRows
            }

        })

    }

    updatePrice = (rowId, colId, currency, value) => {

        this.setState(prev => ({

            rows: prev.rows.map(row =>

                row.id === rowId
                    ? {
                        ...row,
                        prices: {
                            ...row.prices,
                            [colId]: {
                                ...row.prices[colId],
                                [currency]: value
                            }
                        }
                    }
                    : row
            )

        }))
    }

    handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;

        const rowOld = this.state.rows.findIndex(r => r.id === active.id);

        if (rowOld !== -1) {
            const rowNew = this.state.rows.findIndex(r => r.id === over.id);

            this.setState(prev => ({
                rows: arrayMove(prev.rows, rowOld, rowNew)
            }));

            return;
        }

        const colOld = this.state.columns.findIndex(c => c.id === active.id);

        if (colOld !== -1) {
            const colNew = this.state.columns.findIndex(c => c.id === over.id);

            this.setState(prev => {

                const columns = arrayMove(prev.columns, colOld, colNew);

                const rows = prev.rows.map(row => {

                    const prices = {};

                    columns.forEach(col => {
                        prices[col.id] = row.prices[col.id] ?? {
                            uah: "",
                            pln: ""
                        };
                    });

                    return {
                        ...row,
                        prices
                    };
                });

                return {
                    columns,
                    rows
                };
            });
        }
    };

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
                                    <DndProvider onDragEnd={this.handleDragEnd}>
                                        <table className="route-table">
                                            <SortableContext
                                                items={this.state.columns.map(c => c.id)}
                                                strategy={horizontalListSortingStrategy}
                                            >
                                                <thead>
                                                    <tr>
                                                        <th>Зупинка</th>

                                                        {this.state.columns.map(col => (
                                                            <SortableColumn
                                                                key={col.id}
                                                                column={col}
                                                                updateColumnLabel={this.updateColumnLabel}
                                                                selectColumnCity={this.selectColumnCity}
                                                                removeColumn={this.removeColumn}
                                                            />
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
                                            </SortableContext>

                                            <SortableContext
                                                items={this.state.rows.map(r => r.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <tbody>
                                                    {this.state.rows.length === 0 && (
                                                        <tr className="empty-row">
                                                            <td colSpan={this.state.columns.length + 2}>
                                                                Поки що немає жодної зупинки
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {this.state.rows.map(row => (
                                                        <SortableRow
                                                            key={row.id}
                                                            row={row}
                                                            columns={this.state.columns}
                                                            updatePrice={this.updatePrice}
                                                            updateRowName={this.updateRowName}
                                                            selectRowCity={this.selectRowCity}
                                                            removeRow={this.removeRow}
                                                        />
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
                                            </SortableContext>
                                        </table>
                                    </DndProvider>
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
                    </div >
                </div >

                {
                    this.state.renderMessage && (
                        <MessageModal header="Успішно" body="Ціни маршруту успішно збережено" action={this.setRenderMessage} />
                    )
                }
            </>
        )
    }
}

export default RouteDetailsModal