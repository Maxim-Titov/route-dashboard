import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import CitySearchInput from "../CitySearchInput";

export default function SortableRow(props) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: props.row.id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
        >
            <td>
                <div
                    className="drag-handler"
                    {...listeners}
                    {...attributes}
                    style={{ touchAction: "none", cursor: "grab" }}
                >
                    <GripVertical />
                </div>

                <CitySearchInput
                    placeholder="Назва зупинки"
                    value={props.row.name}
                    onChange={(value) => props.updateRowName(props.row.id, value)}
                    onSelect={(city) => props.selectRowCity(props.row.id, city)}
                />
            </td>

            {props.columns.map(col => (
                <td key={col.id}>
                    <div className="price-cell">
                        <div className="price-input">
                            <span className="currency-badge uah">₴</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={props.row.prices[col.id]?.uah ?? ''}
                                onChange={(e) =>
                                    props.updatePrice(props.row.id, col.id, 'uah', e.target.value)
                                }
                            />
                        </div>
                        <div className="price-input">
                            <span className="currency-badge pln">zł</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={props.row.prices[col.id]?.pln ?? ''}
                                onChange={(e) =>
                                    props.updatePrice(props.row.id, col.id, 'pln', e.target.value)
                                }
                            />
                        </div>
                    </div>
                </td>
            ))}

            <td className="actions">
                {!props.row.fixed && (
                    <button
                        className="remove"
                        onClick={() => props.removeRow(props.row.id)}
                    >
                        <X size={16} />
                    </button>
                )}
            </td>

        </tr>
    );
}