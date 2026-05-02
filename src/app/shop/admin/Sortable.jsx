"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Thin wrappers around @dnd-kit so the inline shop admin code stays
 * readable.
 *
 * Usage:
 *   <SortableList items={items} setItems={setItems} onPersist={save}
 *                 strategy="rect" idKey="id">
 *     {(item) => <SortableItem id={item.id}>{render(item)}</SortableItem>}
 *   </SortableList>
 */

export function SortableList({
  items,
  setItems,
  onPersist,
  strategy = "rect",
  idKey = "id",
  children,
}) {
  // 8px activation distance so a click doesn't accidentally start a drag
  // — the admin still needs to *click* tabs and cards normally.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i[idKey] === active.id);
    const newIdx = items.findIndex((i) => i[idKey] === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next);
    onPersist?.(next);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i[idKey])}
        strategy={
          strategy === "horizontal"
            ? horizontalListSortingStrategy
            : rectSortingStrategy
        }
      >
        {items.map((item) => children(item))}
      </SortableContext>
    </DndContext>
  );
}

/**
 * Renders children inside a draggable wrapper. Pass `handleProps` to
 * children via render-prop so they can attach the listeners to a
 * specific drag handle (so the rest of the element stays clickable).
 */
export function SortableItem({ id, disabled = false, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {typeof children === "function"
        ? children({ handleProps: listeners, isDragging })
        : children}
    </div>
  );
}
