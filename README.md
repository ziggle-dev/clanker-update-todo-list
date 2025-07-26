# Update Todo List Tool

A Clanker tool for updating existing todos in the todo list, allowing you to change status, priority, and content.

## Installation

```bash
clanker install ziggler/update-todo-list
```

## Usage

### Basic Example

```bash
clanker -p "mark todo 1 as completed"
```

### Advanced Example

```bash
clanker -p "update todos: mark task 1 as in_progress, mark task 2 as completed with high priority, update task 3 content to 'Review pull requests'"
```

## Arguments

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| updates | array | Yes | - | Array of todo updates with id and fields to modify |

### Update Object Structure

Each update object must have:
- `id` (string, required): The ID of the todo to update
- `status` (string, optional): New status - 'pending', 'in_progress', or 'completed'
- `priority` (string, optional): New priority - 'high', 'medium', or 'low'
- `content` (string, optional): New content/description for the todo

## Examples

### Example 1: Mark a Todo as Completed

```bash
clanker -p "update todo list: mark task 1 as completed"
```

Expected output:
```
Updated 1 todo(s): 1

Current todo list:
✅ Completed (1):
  ✓ [1] Read all the files in the project

Total: 2 | Pending: 1 | In Progress: 0 | Completed: 1
```

### Example 2: Update Multiple Todos

```bash
clanker -p "update todos: set task 1 to in_progress, complete task 2 with high priority"
```

Expected output:
```
Updated 2 todo(s): 1, 2

Current todo list:
🔴 High Priority:
  🔄 [1] Read all the files in the project

✅ Completed (1):
  ✓ [2] Synthesize the important files

Total: 2 | Pending: 0 | In Progress: 1 | Completed: 1
```

### Example 3: Change Content and Priority

```bash
clanker -p "update todo 1: change content to 'Read and understand all project files' and set priority to high"
```

Expected output:
```
Updated 1 todo(s): 1

Current todo list:
🔴 High Priority:
  ⏳ [1] Read and understand all project files

Total: 1 | Pending: 1 | In Progress: 0 | Completed: 0
```

## Features

- **Flexible Updates**: Update status, priority, content, or any combination
- **Batch Updates**: Update multiple todos in a single command
- **Status Tracking**: Visual indicators for status changes
- **Summary View**: See the current state of all todos after updates
- **Error Handling**: Clear messages for todos that aren't found

## Capabilities

This tool requires no special capabilities.

## Development

### Setup

This tool requires TypeScript and uses ES modules. Make sure you have:
- Node.js 16 or higher
- npm or yarn

### Building from Source

```bash
# Clone the repository
git clone https://github.com/ziggle-dev/clanker-update-todo-list

# Install dependencies
cd clanker-update-todo-list
npm install

# Build (TypeScript compilation)
npm run build
```

### Project Structure

```
clanker-update-todo-list/
├── src/
│   └── index.ts      # Main tool implementation
├── dist/             # Built output (generated)
├── package.json      # Project metadata
├── tsconfig.json     # TypeScript configuration
└── README.md         # Documentation
```

### Testing Locally

```bash
# Copy to local tools directory
cp dist/index.js ~/.clanker/tools/ziggler/update-todo-list/1.0.0/

# Test
clanker --list-tools | grep update-todo-list
```

## Related Tools

- **create-todo-list**: Create a new todo list with initial tasks

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT - See LICENSE file for details

## Author

Ziggler ([@ziggle-dev](https://github.com/ziggle-dev))