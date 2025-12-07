import {
  authenticateWithToken,
  findProject,
  downloadProject,
  pullChanges,
  pushChanges,
} from "./project.js";
import {
  getElementTree,
  getNetworkLogs,
  clearNetworkLogs,
  getConsoleLogs,
  clearConsoleLogs,
  getTimeline,
  clearTimeline,
  getStorage,
  getInfo,
  getWidget,
  getWidgetProperties,
  getWidgetStyles,
} from "./wavepulse.js";
import {
  executeCommand,
  echoCommand,
  sedCommand,
  readFile,
  writeFile,
  appendFile,
  grepFiles,
  findFiles,
  listDirectory,
  editFile,
} from "./filesystem.js";
import { codebaseTools, executeCodebaseTool } from "./codebase/index.js";

// Tool definitions with schemas
export const toolDefinitions = [
  ...codebaseTools,  // Add all 35 codebase tools first
  {
    name: "wavemaker_authenticate",
    description: "Authenticate with WaveMaker Studio using an auth token. Returns a formatted auth cookie for subsequent requests.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WaveMaker Studio instance (e.g., https://www.wavemakeronline.com)",
        },
        authToken: {
          type: "string",
          description: "The authentication token to validate",
        },
      },
      required: ["baseUrl", "authToken"],
    },
  },
  {
    name: "wavemaker_find_project",
    description: "Find a WaveMaker project ID by project name and preview URL. Returns the project ID and platform version.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WaveMaker Studio instance",
        },
        authCookie: {
          type: "string",
          description: "The authentication cookie (auth_cookie=...)",
        },
        projectName: {
          type: "string",
          description: "The display name of the project to find",
        },
        appPreviewUrl: {
          type: "string",
          description: "The full preview URL of the application",
        },
      },
      required: ["baseUrl", "authCookie", "projectName", "appPreviewUrl"],
    },
  },
  {
    name: "wavemaker_download_project",
    description: "Download a WaveMaker project to a local directory. Creates a git repository with the project files. Only supports WaveMaker platform version >=11.4.0.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WaveMaker Studio instance",
        },
        projectId: {
          type: "string",
          description: "The project ID (studioProjectId) to download",
        },
        authCookie: {
          type: "string",
          description: "The authentication cookie (auth_cookie=...)",
        },
        projectDir: {
          type: "string",
          description: "The local directory path where the project should be downloaded",
        },
      },
      required: ["baseUrl", "projectId", "authCookie", "projectDir"],
    },
  },
  {
    name: "wavemaker_pull_changes",
    description: "Pull the latest changes from WaveMaker Studio for a project. Returns a list of changed files. Only supports WaveMaker platform version >=11.4.0.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WaveMaker Studio instance",
        },
        projectId: {
          type: "string",
          description: "The project ID (studioProjectId)",
        },
        authCookie: {
          type: "string",
          description: "The authentication cookie (auth_cookie=...)",
        },
        projectDir: {
          type: "string",
          description: "The local directory path of the project",
        },
        remoteBaseCommitId: {
          type: "string",
          description: "The remote base commit ID from the previous download or pull",
        },
      },
      required: ["baseUrl", "projectId", "authCookie", "projectDir", "remoteBaseCommitId"],
    },
  },
  {
    name: "wavemaker_push_changes",
    description: "Push local changes to WaveMaker Studio. Stashes changes, pulls latest, re-applies changes, commits and pushes.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WaveMaker Studio instance",
        },
        projectId: {
          type: "string",
          description: "The project ID (studioProjectId)",
        },
        authCookie: {
          type: "string",
          description: "The authentication cookie (auth_cookie=...)",
        },
        projectDir: {
          type: "string",
          description: "The local directory path of the project",
        },
        remoteBaseCommitId: {
          type: "string",
          description: "The remote base commit ID from the previous download or pull",
        },
        commitMessage: {
          type: "string",
          description: "Optional commit message. Defaults to timestamp-based message if not provided.",
        },
      },
      required: ["baseUrl", "projectId", "authCookie", "projectDir", "remoteBaseCommitId"],
    },
  },
  // WavePulse Tools
  {
    name: "wavepulse_get_element_tree",
    description: "Get the element tree from the connected mobile app. Returns the widget/element hierarchy with id, name, tagName, and children. Use the 'id' field from the response for widget property/style lookups.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_get_network_logs",
    description: "Get accumulated network request logs from the connected mobile app. Returns all HTTP requests made by the app.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_clear_network_logs",
    description: "Clear all network logs for the specified channel.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_get_console_logs",
    description: "Get accumulated console logs from the connected mobile app. Returns debug, info, warn, and error console messages.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_clear_console_logs",
    description: "Clear all console logs for the specified channel.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_get_timeline",
    description: "Get accumulated timeline events from the connected mobile app. Returns events like APP_STARTUP, VARIABLE_INVOKE, PAGE_READY, and NETWORK_REQUEST.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_clear_timeline",
    description: "Clear all timeline events for the specified channel.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_get_storage",
    description: "Get all storage entries from the connected mobile app. Returns AsyncStorage/localStorage key-value pairs.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_get_info",
    description: "Get app and platform information from the connected mobile app. Returns app details (name, version, theme, locale) and platform details (os, device).",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
      },
      required: ["baseUrl", "channelId"],
    },
  },
  {
    name: "wavepulse_get_widget",
    description: "Get both properties and styles for a specific widget. Use the 'id' field from the element tree response (not the 'name' field) as the widgetId parameter.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
        widgetId: {
          type: "string",
          description: "The widget ID from the element tree (use the 'id' field, not 'name')",
        },
      },
      required: ["baseUrl", "channelId", "widgetId"],
    },
  },
  {
    name: "wavepulse_get_widget_properties",
    description: "Get only properties for a specific widget. Use the 'id' field from the element tree response (not the 'name' field) as the widgetId parameter.",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
        widgetId: {
          type: "string",
          description: "The widget ID from the element tree (use the 'id' field, not 'name')",
        },
      },
      required: ["baseUrl", "channelId", "widgetId"],
    },
  },
  {
    name: "wavepulse_get_widget_styles",
    description: "Get only styles for a specific widget. Use the 'id' field from the element tree response (not the 'name' field) as the widgetId parameter. Returns styles organized by widget part (root, label, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)",
        },
        channelId: {
          type: "string",
          description: "The channel ID of the connected mobile app",
        },
        widgetId: {
          type: "string",
          description: "The widget ID from the element tree (use the 'id' field, not 'name')",
        },
      },
      required: ["baseUrl", "channelId", "widgetId"],
    },
  },
  // Filesystem Tools
  {
    name: "filesystem_execute_command",
    description: "Execute a whitelisted shell command with optional arguments. Allowed commands: git, npm, node, npx, yarn, pnpm, ls, cat, grep, find, echo, pwd, which, whoami, date, wc, head, tail, sort, uniq, diff, tree, du, df",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The command to execute (must be in whitelist)",
        },
        args: {
          type: "array",
          items: { type: "string" },
          description: "Command arguments",
        },
        cwd: {
          type: "string",
          description: "Working directory for command execution",
        },
        timeout: {
          type: "number",
          description: "Timeout in milliseconds (default: 30000)",
        },
        shell: {
          type: "boolean",
          description: "Execute in shell (default: false)",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "filesystem_echo_command",
    description: "Echo text to stdout or write to a file",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to echo",
        },
        newline: {
          type: "boolean",
          description: "Add newline at the end (default: true)",
        },
        filePath: {
          type: "string",
          description: "Optional file path to write text to instead of stdout",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "filesystem_sed_command",
    description: "Perform sed-like text replacement in a file using regex patterns",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file to edit",
        },
        pattern: {
          type: "string",
          description: "Regex pattern to find",
        },
        replacement: {
          type: "string",
          description: "Replacement text",
        },
        flags: {
          type: "string",
          description: "Regex flags (default: 'g' for global)",
        },
        backup: {
          type: "boolean",
          description: "Create backup before modifying (default: true)",
        },
        inPlace: {
          type: "boolean",
          description: "Edit file in-place (default: true)",
        },
      },
      required: ["filePath", "pattern", "replacement"],
    },
  },
  {
    name: "filesystem_read_file",
    description: "Read file contents with support for different encodings, partial reading, and binary files. Paths can be absolute (e.g., /Users/name/file.txt) or relative (resolved from MCP server's working directory).",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file to read",
        },
        encoding: {
          type: "string",
          description: "File encoding (default: 'utf-8')",
        },
        offset: {
          type: "number",
          description: "Starting line number for partial read",
        },
        limit: {
          type: "number",
          description: "Number of lines to read",
        },
        binary: {
          type: "boolean",
          description: "Read as binary and return base64 encoded (default: false)",
        },
      },
      required: ["filePath"],
    },
  },
  {
    name: "filesystem_write_file",
    description: "Write content to a file with atomic write operation, optional backup, and directory creation",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file to write",
        },
        content: {
          type: "string",
          description: "Content to write to the file",
        },
        encoding: {
          type: "string",
          description: "File encoding (default: 'utf-8')",
        },
        createDirs: {
          type: "boolean",
          description: "Create parent directories if they don't exist (default: true)",
        },
        backup: {
          type: "boolean",
          description: "Create backup of existing file (default: false)",
        },
        mode: {
          type: "string",
          description: "File permissions in octal format (e.g., '0644')",
        },
      },
      required: ["filePath", "content"],
    },
  },
  {
    name: "filesystem_append_file",
    description: "Append content to an existing file or create a new file",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file to append to",
        },
        content: {
          type: "string",
          description: "Content to append",
        },
        encoding: {
          type: "string",
          description: "File encoding (default: 'utf-8')",
        },
        createIfMissing: {
          type: "boolean",
          description: "Create file if it doesn't exist (default: true)",
        },
        newlineBefore: {
          type: "boolean",
          description: "Add newline before content (default: true)",
        },
      },
      required: ["filePath", "content"],
    },
  },
  {
    name: "filesystem_grep_files",
    description: "Search for regex patterns in files with recursive directory search. IMPORTANT: Use absolute paths (e.g., /Users/name/project) or paths will be resolved relative to the MCP server's working directory. Supports context lines, file filtering by glob patterns (e.g., '*.ts', '**/*.json'), and case-insensitive search. Returns match count and files searched count.",
    inputSchema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Regex pattern to search for",
        },
        paths: {
          type: "array",
          items: { type: "string" },
          description: "Array of file or directory paths to search",
        },
        recursive: {
          type: "boolean",
          description: "Recursively search directories (default: true)",
        },
        ignoreCase: {
          type: "boolean",
          description: "Case-insensitive search (default: false)",
        },
        includeLineNumbers: {
          type: "boolean",
          description: "Include line numbers in results (default: true)",
        },
        contextLines: {
          type: "number",
          description: "Number of context lines to show around matches (default: 0)",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default: 1000)",
        },
        filePattern: {
          type: "string",
          description: "Glob pattern to filter files (e.g., '*.ts')",
        },
        excludePattern: {
          type: "string",
          description: "Glob pattern to exclude files",
        },
      },
      required: ["pattern", "paths"],
    },
  },
  {
    name: "filesystem_find_files",
    description: "Find files by glob pattern (e.g., '*.json', '**/*.ts', '**/src/**/*.js'). IMPORTANT: Use absolute searchPath (e.g., /Users/name/project) or it will be resolved relative to the MCP server's working directory. Pattern examples: '*.json' (files in search dir only), '**/*.json' (recursive all subdirs), '**/test/**/*.ts' (specific subdirectories). Supports type filtering, depth limits, and returns file metadata.",
    inputSchema: {
      type: "object",
      properties: {
        searchPath: {
          type: "string",
          description: "Root directory to search from",
        },
        pattern: {
          type: "string",
          description: "Glob pattern to match files (e.g., '*.ts', '**/*.json')",
        },
        type: {
          type: "string",
          enum: ["file", "directory", "all"],
          description: "Filter by type (default: 'all')",
        },
        maxDepth: {
          type: "number",
          description: "Maximum directory depth to search",
        },
        ignoreHidden: {
          type: "boolean",
          description: "Ignore hidden files and directories (default: true)",
        },
        followSymlinks: {
          type: "boolean",
          description: "Follow symbolic links (default: false)",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results (default: 1000)",
        },
      },
      required: ["searchPath"],
    },
  },
  {
    name: "filesystem_list_directory",
    description: "List directory contents with detailed file information, sorting, and filtering options. Paths can be absolute (e.g., /Users/name/dir) or relative (resolved from MCP server's working directory). Supports recursive listing, hidden file filtering, and sorting by name/size/modified date.",
    inputSchema: {
      type: "object",
      properties: {
        directoryPath: {
          type: "string",
          description: "Path to the directory to list",
        },
        recursive: {
          type: "boolean",
          description: "List subdirectories recursively (default: false)",
        },
        includeHidden: {
          type: "boolean",
          description: "Include hidden files (default: false)",
        },
        includeStats: {
          type: "boolean",
          description: "Include file statistics (default: true)",
        },
        sortBy: {
          type: "string",
          enum: ["name", "size", "modified"],
          description: "Sort entries by field (default: 'name')",
        },
        pattern: {
          type: "string",
          description: "Glob pattern to filter entries",
        },
      },
      required: ["directoryPath"],
    },
  },
  {
    name: "filesystem_edit_file",
    description: "Edit file with multiple line-based operations (insert, replace, delete) with atomic updates and backup",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file to edit",
        },
        operations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["insert", "replace", "delete"],
                description: "Type of operation",
              },
              startLine: {
                type: "number",
                description: "Starting line number (1-based)",
              },
              endLine: {
                type: "number",
                description: "Ending line number for replace/delete operations",
              },
              content: {
                type: "string",
                description: "Content for insert/replace operations",
              },
            },
            required: ["type", "startLine"],
          },
          description: "Array of edit operations to apply",
        },
        backup: {
          type: "boolean",
          description: "Create backup before editing (default: true)",
        },
      },
      required: ["filePath", "operations"],
    },
  },
];

// Central tool execution handler
export async function handleToolCall(name: string, args: any) {
  try {
    switch (name) {
      case "wavemaker_authenticate": {
        const result = await authenticateWithToken(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavemaker_find_project": {
        const result = await findProject(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavemaker_download_project": {
        const result = await downloadProject(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavemaker_pull_changes": {
        const result = await pullChanges(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavemaker_push_changes": {
        const result = await pushChanges(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // WavePulse Tools
      case "wavepulse_get_element_tree": {
        const result = await getElementTree(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_get_network_logs": {
        const result = await getNetworkLogs(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_clear_network_logs": {
        const result = await clearNetworkLogs(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_get_console_logs": {
        const result = await getConsoleLogs(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_clear_console_logs": {
        const result = await clearConsoleLogs(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_get_timeline": {
        const result = await getTimeline(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_clear_timeline": {
        const result = await clearTimeline(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_get_storage": {
        const result = await getStorage(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_get_info": {
        const result = await getInfo(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_get_widget": {
        const result = await getWidget(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_get_widget_properties": {
        const result = await getWidgetProperties(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "wavepulse_get_widget_styles": {
        const result = await getWidgetStyles(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Filesystem Tools
      case "filesystem_execute_command": {
        const result = await executeCommand(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_echo_command": {
        const result = await echoCommand(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_sed_command": {
        const result = await sedCommand(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_read_file": {
        const result = await readFile(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_write_file": {
        const result = await writeFile(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_append_file": {
        const result = await appendFile(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_grep_files": {
        const result = await grepFiles(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_find_files": {
        const result = await findFiles(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_list_directory": {
        const result = await listDirectory(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "filesystem_edit_file": {
        const result = await editFile(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        // Check if it's a codebase tool
        if (name.startsWith('search_') || name.startsWith('read_') || name.startsWith('analyze_') || name.startsWith('list_')) {
          const result = await executeCodebaseTool(name, args);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

