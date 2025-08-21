import React, { useState } from 'react';
import { motion, DragDropContext, Droppable, Draggable, DropResult } from 'framer-motion';
import { Plus, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  columns: Column[];
  onTaskMove?: (taskId: string, fromColumnId: string, toColumnId: string) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskView?: (task: Task) => void;
  onAddTask?: (columnId: string) => void;
  className?: string;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek'
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  onTaskView,
  onAddTask,
  className
}) => {
  const [boardColumns, setBoardColumns] = useState(columns);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onTaskMove) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Same column reordering
      const column = boardColumns.find(col => col.id === source.droppableId);
      if (!column) return;

      const newTasks = Array.from(column.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      setBoardColumns(prev => prev.map(col => 
        col.id === source.droppableId 
          ? { ...col, tasks: newTasks }
          : col
      ));
    } else {
      // Moving between columns
      const sourceColumn = boardColumns.find(col => col.id === source.droppableId);
      const destColumn = boardColumns.find(col => col.id === destination.droppableId);
      
      if (!sourceColumn || !destColumn) return;

      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [moved] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, moved);

      setBoardColumns(prev => prev.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: sourceTasks };
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: destTasks };
        }
        return col;
      }));

      onTaskMove(moved.id, source.droppableId, destination.droppableId);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boardColumns.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={cn(
                'flex items-center justify-between p-4 rounded-t-lg text-white font-semibold',
                column.color
              )}>
                <div className="flex items-center gap-2">
                  <span>{column.title}</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                    {column.tasks.length}
                  </span>
                </div>
                
                {onAddTask && (
                  <button
                    onClick={() => onAddTask(column.id)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Column Content */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex-1 p-4 bg-gray-50 rounded-b-lg min-h-[400px]',
                      snapshot.isDraggingOver && 'bg-blue-50'
                    )}
                  >
                    <div className="space-y-3">
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              whileHover={{ scale: 1.02 }}
                              className={cn(
                                'bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move',
                                snapshot.isDragging && 'shadow-lg rotate-2'
                              )}
                            >
                              {/* Task Header */}
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900 line-clamp-2">
                                  {task.title}
                                </h4>
                                
                                <div className="flex items-center gap-1">
                                  {onTaskView && (
                                    <button
                                      onClick={() => onTaskView(task)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                  )}
                                  {onTaskEdit && (
                                    <button
                                      onClick={() => onTaskEdit(task)}
                                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                  )}
                                  {onTaskDelete && (
                                    <button
                                      onClick={() => onTaskDelete(task.id)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Task Description */}
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Task Meta */}
                              <div className="space-y-2">
                                {/* Priority */}
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    'px-2 py-1 rounded-full text-xs font-medium',
                                    priorityColors[task.priority]
                                  )}>
                                    {priorityLabels[task.priority]}
                                  </span>
                                </div>

                                {/* Assignee */}
                                {task.assignee && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                      {task.assignee.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{task.assignee}</span>
                                  </div>
                                )}

                                {/* Due Date */}
                                {task.dueDate && (
                                  <div className="text-sm text-gray-600">
                                    📅 {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                                  </div>
                                )}

                                {/* Tags */}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

// Predefined column configurations
export const KanbanColumns = {
  default: [
    {
      id: 'todo',
      title: 'Yapılacak',
      color: 'bg-gray-500',
      tasks: []
    },
    {
      id: 'in-progress',
      title: 'Devam Ediyor',
      color: 'bg-blue-500',
      tasks: []
    },
    {
      id: 'review',
      title: 'İnceleme',
      color: 'bg-yellow-500',
      tasks: []
    },
    {
      id: 'done',
      title: 'Tamamlandı',
      color: 'bg-green-500',
      tasks: []
    }
  ],
  project: [
    {
      id: 'backlog',
      title: 'Geri Bildirim',
      color: 'bg-purple-500',
      tasks: []
    },
    {
      id: 'planning',
      title: 'Planlama',
      color: 'bg-indigo-500',
      tasks: []
    },
    {
      id: 'development',
      title: 'Geliştirme',
      color: 'bg-blue-500',
      tasks: []
    },
    {
      id: 'testing',
      title: 'Test',
      color: 'bg-orange-500',
      tasks: []
    },
    {
      id: 'deployment',
      title: 'Dağıtım',
      color: 'bg-green-500',
      tasks: []
    }
  ]
};
