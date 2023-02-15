import { GetServerSideProps } from 'next'
import { Dispatch, SetStateAction, useState } from 'react'
import { DropResult, resetServerContext } from 'react-beautiful-dnd'
import { v4 as uuid } from 'uuid'
import dynamic from 'next/dynamic'

const DragDropContext = dynamic(
  async () => {
    const mod = await import('react-beautiful-dnd')
    return mod.DragDropContext
  },
  { ssr: false }
)

const Droppable = dynamic(
  async () => {
    const mod = await import('react-beautiful-dnd')
    return mod.Droppable
  },
  { ssr: false }
)
const Draggable = dynamic(
  async () => {
    const mod = await import('react-beautiful-dnd')
    return mod.Draggable
  },
  { ssr: false }
)

type Item = {
  id: string
  content: string
}

type Column = {
  [x: string]: {
    name: string
    items: Item[]
  }
}

const itemsFromBackend: Item[] = [
  { id: uuid(), content: 'First task' },
  { id: uuid(), content: 'Second task' },
]

const columnsFromBackend: Column = {
  [uuid()]: {
    name: 'Requested',
    items: itemsFromBackend,
  },
  [uuid()]: {
    name: 'Todo',
    items: [],
  },
  [uuid()]: {
    name: 'In Progress',
    items: [],
  },
  [uuid()]: {
    name: 'Done',
    items: [],
  },
}

const onDragEnd = (
  result: DropResult,
  columns: Column,
  setColumns: Dispatch<SetStateAction<Column>>
) => {
  if (!result.destination) return

  const { source, destination } = result

  // If we are dragging to another column
  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId]
    const destColumn = columns[destination.droppableId]

    const sourceItems = [...sourceColumn.items]
    const destItems = [...destColumn.items]

    const [removed] = sourceItems.splice(source.index, 1) // Remove item from the source
    destItems.splice(destination.index, 0, removed) // Add item from the destination
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    })
  } else {
    // If we are only moving the order from the same column
    const column = columns[source.droppableId]
    const copiedItems = [...column.items]

    // for removing/moving the items
    const [removed] = copiedItems.splice(source.index, 1)
    copiedItems.splice(destination.index, 0, removed)
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    })
  }
}

const Home = () => {
  const [columns, setColumns] = useState(columnsFromBackend)
  const [task, setTask] = useState<string | null>(null)

  const handleCreateTask = () => {
    if (task) {
      const getId = Object.entries(columnsFromBackend)[0][0]
      const copiedItems = columns[getId]
      copiedItems.items.push({
        id: uuid(),
        content: task,
      })
      setColumns({
        ...columns,
        [getId]: {
          ...copiedItems,
          items: copiedItems.items,
        },
      })
      setTask(null)
    }
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            onChange={(e) => setTask(e.target.value)}
          />
          <button className="ml-2 btn btn-primary" onClick={handleCreateTask}>
            Create Task
          </button>
        </div>
        <div className="flex justify-center h-full">
          <DragDropContext
            onDragEnd={(res) => onDragEnd(res, columns, setColumns)}
          >
            {Object.entries(columns).map(([id, column]) => {
              return (
                <div
                  key={id}
                  className="flex flex-col justify-center items-center"
                >
                  <h2>{column.name}</h2>
                  <div className="m-2">
                    <Droppable droppableId={id}>
                      {(provided, snapshot) => {
                        return (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`${
                              snapshot.isDraggingOver
                                ? 'bg-blue-200'
                                : 'bg-gray-300'
                            } p-1 w-[250px] min-h-[500px]`}
                          >
                            {column.items.map((item, index) => {
                              return (
                                // Draggable ID SHOULD be a 'string' and that is why we are using uuid
                                <Draggable
                                  key={item.id}
                                  draggableId={item.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => {
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`select-none p-4 mx-0 mt-0 mb-2 min-h-[50px] ${
                                          snapshot.isDragging
                                            ? 'bg-[#263B4A]'
                                            : 'bg-[#456C86]'
                                        } text-white`}
                                        style={{
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        {item.content}
                                      </div>
                                    )
                                  }}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )
                      }}
                    </Droppable>
                  </div>
                </div>
              )
            })}
          </DragDropContext>
        </div>
      </div>
    </>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  resetServerContext() // <-- CALL RESET SERVER CONTEXT, SERVER SIDE

  return { props: { data: [] } }
}
