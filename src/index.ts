/**
 * Update todo list tool for Clanker
 * 
 * This tool updates existing todos in the todo list created by create-todo-list
 */

import { createTool, ToolCategory, ToolCapability } from '@ziggler/clanker';

// Todo item interface
interface TodoItem {
    id: string;
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'high' | 'medium' | 'low';
}

// Import shared todo list from create-todo-list tool
// In a real deployment, this would use a shared state mechanism
// For now, we'll maintain our own copy
let todoList: TodoItem[] = [];

/**
 * Generate todo summary
 */
function generateTodoSummary(): string {
    if (todoList.length === 0) {
        return 'No todos';
    }

    // Group by status
    const byStatus = {
        pending: todoList.filter(t => t.status === 'pending'),
        in_progress: todoList.filter(t => t.status === 'in_progress'),
        completed: todoList.filter(t => t.status === 'completed')
    };

    const lines: string[] = [];

    // High priority pending/in-progress items first
    const urgent = [...byStatus.pending, ...byStatus.in_progress]
        .filter(t => t.priority === 'high')
        .sort((a, b) => {
            if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
            if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
            return 0;
        });

    if (urgent.length > 0) {
        lines.push('🔴 High Priority:');
        urgent.forEach(todo => {
            const statusIcon = todo.status === 'in_progress' ? '🔄' : '⏳';
            lines.push(`  ${statusIcon} [${todo.id}] ${todo.content}`);
        });
        lines.push('');
    }

    // Other pending/in-progress items
    const other = [...byStatus.pending, ...byStatus.in_progress]
        .filter(t => t.priority !== 'high')
        .sort((a, b) => {
            if (a.priority === 'medium' && b.priority === 'low') return -1;
            if (a.priority === 'low' && b.priority === 'medium') return 1;
            if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
            if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
            return 0;
        });

    if (other.length > 0) {
        lines.push('📋 Other Tasks:');
        other.forEach(todo => {
            const statusIcon = todo.status === 'in_progress' ? '🔄' : '⏳';
            const priorityIcon = todo.priority === 'medium' ? '🟡' : '🟢';
            lines.push(`  ${statusIcon} ${priorityIcon} [${todo.id}] ${todo.content}`);
        });
        lines.push('');
    }

    // Completed items
    if (byStatus.completed.length > 0) {
        lines.push(`✅ Completed (${byStatus.completed.length}):`)
        byStatus.completed.slice(0, 5).forEach(todo => {
            lines.push(`  ✓ [${todo.id}] ${todo.content}`);
        });
        if (byStatus.completed.length > 5) {
            lines.push(`  ... and ${byStatus.completed.length - 5} more`);
        }
    }

    // Summary stats
    lines.push('');
    lines.push(`Total: ${todoList.length} | Pending: ${byStatus.pending.length} | In Progress: ${byStatus.in_progress.length} | Completed: ${byStatus.completed.length}`);

    return lines.join('\n');
}

/**
 * Update todo list tool
 */
export default createTool()
    .id('update_todo_list')
    .name('Update Todo List')
    .description('Update existing todos in the todo list')
    .category(ToolCategory.Task)
    .capabilities()  // No special capabilities needed
    .tags('todo', 'task', 'update', 'modify')

    // Arguments
    .arrayArg('updates', 'Array of todo updates', {
        required: true,
        validate: (updates) => {
            if (!Array.isArray(updates)) {
                return 'Updates must be an array';
            }

            for (const update of updates) {
                if (!update || typeof update !== 'object') {
                    return 'Each update must be an object';
                }

                const typedUpdate = update as Partial<TodoItem> & { id: string };

                if (!typedUpdate.id || typeof typedUpdate.id !== 'string') {
                    return 'Each update must have a string id';
                }

                if (typedUpdate.status && !['pending', 'in_progress', 'completed'].includes(typedUpdate.status)) {
                    return 'Status must be pending, in_progress, or completed';
                }

                if (typedUpdate.priority && !['high', 'medium', 'low'].includes(typedUpdate.priority)) {
                    return 'Priority must be high, medium, or low';
                }

                if (typedUpdate.content && typeof typedUpdate.content !== 'string') {
                    return 'Content must be a string';
                }
            }

            return true;
        }
    })
    
    // Add examples
    .examples([
        {
            description: "Mark a todo as completed",
            arguments: {
                updates: [
                    {
                        id: "1",
                        status: "completed"
                    }
                ]
            },
            result: "Updated 1 todo(s): 1"
        },
        {
            description: "Update multiple todos - mark one as in progress and another as completed",
            arguments: {
                updates: [
                    {
                        id: "1",
                        status: "in_progress"
                    },
                    {
                        id: "2",
                        status: "completed",
                        priority: "high"
                    }
                ]
            },
            result: "Updated 2 todo(s): 1, 2"
        },
        {
            description: "Change todo content and priority",
            arguments: {
                updates: [
                    {
                        id: "1",
                        content: "Read and understand all project files",
                        priority: "high"
                    }
                ]
            },
            result: "Updated 1 todo(s): 1"
        }
    ])

    // Execute
    .execute(async (args, context) => {
        const { updates } = args as { updates: Array<Partial<TodoItem> & { id: string }> };

        context.logger?.debug(`Updating ${updates.length} todo items`);

        const updatedIds: string[] = [];
        const notFoundIds: string[] = [];

        for (const update of updates) {
            const todoIndex = todoList.findIndex(todo => todo.id === update.id);

            if (todoIndex === -1) {
                context.logger?.warn(`Todo not found: ${update.id}`);
                notFoundIds.push(update.id);
                continue;
            }

            // Apply updates
            if (update.status) {
                todoList[todoIndex].status = update.status;
            }
            if (update.priority) {
                todoList[todoIndex].priority = update.priority;
            }
            if (update.content) {
                todoList[todoIndex].content = update.content;
            }

            updatedIds.push(update.id);
            context.logger?.debug(`Updated todo ${update.id}`);
        }

        // Generate response
        const messages: string[] = [];

        if (updatedIds.length > 0) {
            messages.push(`Updated ${updatedIds.length} todo(s): ${updatedIds.join(', ')}`);
        }

        if (notFoundIds.length > 0) {
            messages.push(`Todo(s) not found: ${notFoundIds.join(', ')}`);
        }

        if (messages.length === 0) {
            messages.push('No updates performed');
        }

        // Add summary
        messages.push('');
        messages.push('Current todo list:');
        messages.push(generateTodoSummary());

        context.logger?.info(`Todo update completed: ${updatedIds.length} updated, ${notFoundIds.length} not found`);
        return {
            success: notFoundIds.length === 0,
            output: messages.join('\n'),
            data: { todos: todoList, updated: updatedIds, notFound: notFoundIds }
        };
    })
    .build();