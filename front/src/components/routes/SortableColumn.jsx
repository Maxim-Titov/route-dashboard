import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripHorizontal } from "lucide-react";
import CitySearchInput from "../CitySearchInput";

export default function SortableColumn(props) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: props.column.id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1
    };

    return (
        <th
            ref={setNodeRef}
            style={style}
        >
            <div
                className="drag-handler"
                {...listeners}
                {...attributes}
                style={{ touchAction: "none" }}
            >
                <GripHorizontal />
            </div>

            <div className="column-header">
                <CitySearchInput
                    placeholder="Місто"
                    value={props.column.label}
                    onChange={(value) => props.updateColumnLabel(props.column.id, value)}
                    onSelect={(city) => props.selectColumnCity(props.column.id, city)}
                />

                {!props.column.fixed && (
                    <button
                        className="remove"
                        onClick={() => props.removeColumn(props.column.id)}
                    >
                        <X />
                    </button>
                )}
            </div>

        </th>
    );
}