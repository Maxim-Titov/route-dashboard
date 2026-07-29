import React from "react";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter
} from "@dnd-kit/core";

export default function DndProvider({
    onDragEnd,
    children
}) {

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5
            }
        })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
        >
            {children}
        </DndContext>
    );
}