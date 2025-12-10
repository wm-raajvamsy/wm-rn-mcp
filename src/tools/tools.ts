import { z } from 'zod';
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
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WaveMaker Studio instance (e.g., https://www.wavemakeronline.com)"),
      authToken: z.string().describe("The authentication token to validate")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavemaker_find_project",
    description: "Find a WaveMaker project ID by project name and preview URL. Returns the project ID and platform version.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WaveMaker Studio instance"),
      authCookie: z.string().describe("The authentication cookie (auth_cookie=...)"),
      projectName: z.string().describe("The display name of the project to find"),
      appPreviewUrl: z.string().describe("The full preview URL of the application")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavemaker_download_project",
    description: "Download a WaveMaker project to a local directory. Creates a git repository with the project files. Only supports WaveMaker platform version >=11.4.0.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WaveMaker Studio instance"),
      projectId: z.string().describe("The project ID (studioProjectId) to download"),
      authCookie: z.string().describe("The authentication cookie (auth_cookie=...)"),
      projectDir: z.string().describe("The local directory path where the project should be downloaded")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavemaker_pull_changes",
    description: "Pull the latest changes from WaveMaker Studio for a project. Returns a list of changed files. Only supports WaveMaker platform version >=11.4.0.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WaveMaker Studio instance"),
      projectId: z.string().describe("The project ID (studioProjectId)"),
      authCookie: z.string().describe("The authentication cookie (auth_cookie=...)"),
      projectDir: z.string().describe("The local directory path of the project"),
      remoteBaseCommitId: z.string().describe("The remote base commit ID from the previous download or pull")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavemaker_push_changes",
    description: "Push local changes to WaveMaker Studio. Stashes changes, pulls latest, re-applies changes, commits and pushes.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WaveMaker Studio instance"),
      projectId: z.string().describe("The project ID (studioProjectId)"),
      authCookie: z.string().describe("The authentication cookie (auth_cookie=...)"),
      projectDir: z.string().describe("The local directory path of the project"),
      remoteBaseCommitId: z.string().describe("The remote base commit ID from the previous download or pull"),
      commitMessage: z.string().optional().describe("Optional commit message. Defaults to timestamp-based message if not provided.")
    }),
    outputSchema: z.any()
  },
  // WavePulse Tools
  {
    name: "wavepulse_get_element_tree",
    description: "Get the element tree from the connected mobile app. Returns the widget/element hierarchy with id, name, tagName, and children. Use the 'id' field from the response for widget property/style lookups.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_get_network_logs",
    description: "Get accumulated network request logs from the connected mobile app. Returns all HTTP requests made by the app.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_clear_network_logs",
    description: "Clear all network logs for the specified channel.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_get_console_logs",
    description: "Get accumulated console logs from the connected mobile app. Returns debug, info, warn, and error console messages.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_clear_console_logs",
    description: "Clear all console logs for the specified channel.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_get_timeline",
    description: "Get accumulated timeline events from the connected mobile app. Returns events like APP_STARTUP, VARIABLE_INVOKE, PAGE_READY, and NETWORK_REQUEST.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_clear_timeline",
    description: "Clear all timeline events for the specified channel.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_get_storage",
    description: "Get all storage entries from the connected mobile app. Returns AsyncStorage/localStorage key-value pairs.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_get_info",
    description: "Get app and platform information from the connected mobile app. Returns app details (name, version, theme, locale) and platform details (os, device).",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_get_widget",
    description: "Get both properties and styles for a specific widget. Use the 'id' field from the element tree response (not the 'name' field) as the widgetId parameter.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app"),
      widgetId: z.string().describe("The widget ID from the element tree (use the 'id' field, not 'name')")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_get_widget_properties",
    description: "Get only properties for a specific widget. Use the 'id' field from the element tree response (not the 'name' field) as the widgetId parameter.",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app"),
      widgetId: z.string().describe("The widget ID from the element tree (use the 'id' field, not 'name')")
    }),
    outputSchema: z.any()
  },
  {
    name: "wavepulse_get_widget_styles",
    description: "Get only styles for a specific widget. Use the 'id' field from the element tree response (not the 'name' field) as the widgetId parameter. Returns styles organized by widget part (root, label, etc.).",
    inputSchema: z.object({
      baseUrl: z.string().describe("The base URL of the WavePulse server (e.g., http://localhost:3000/wavepulse)"),
      channelId: z.string().describe("The channel ID of the connected mobile app"),
      widgetId: z.string().describe("The widget ID from the element tree (use the 'id' field, not 'name')")
    }),
    outputSchema: z.any()
  },
  // Filesystem Tools
  {
    name: "filesystem_execute_command",
    description: "Execute a whitelisted shell command with optional arguments. Allowed commands: git, npm, node, npx, yarn, pnpm, ls, cat, grep, find, echo, pwd, which, whoami, date, wc, head, tail, sort, uniq, diff, tree, du, df",
    inputSchema: z.object({
      command: z.string().describe("The command to execute (must be in whitelist)"),
      args: z.array(z.string()).optional().describe("Command arguments"),
      cwd: z.string().optional().describe("Working directory for command execution"),
      timeout: z.number().optional().describe("Timeout in milliseconds (default: 30000)"),
      shell: z.boolean().optional().describe("Execute in shell (default: false)")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_echo_command",
    description: "Echo text to stdout or write to a file",
    inputSchema: z.object({
      text: z.string().describe("Text to echo"),
      newline: z.boolean().optional().describe("Add newline at the end (default: true)"),
      filePath: z.string().optional().describe("Optional file path to write text to instead of stdout")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_sed_command",
    description: "Perform sed-like text replacement in a file using regex patterns",
    inputSchema: z.object({
      filePath: z.string().describe("Path to the file to edit"),
      pattern: z.string().describe("Regex pattern to find"),
      replacement: z.string().describe("Replacement text"),
      flags: z.string().optional().describe("Regex flags (default: 'g' for global)"),
      backup: z.boolean().optional().describe("Create backup before modifying (default: true)"),
      inPlace: z.boolean().optional().describe("Edit file in-place (default: true)")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_read_file",
    description: "Read file contents with support for different encodings, partial reading, and binary files. Paths can be absolute (e.g., /Users/name/file.txt) or relative (resolved from MCP server's working directory).",
    inputSchema: z.object({
      filePath: z.string().describe("Path to the file to read"),
      encoding: z.string().optional().describe("File encoding (default: 'utf-8')"),
      offset: z.number().optional().describe("Starting line number for partial read"),
      limit: z.number().optional().describe("Number of lines to read"),
      binary: z.boolean().optional().describe("Read as binary and return base64 encoded (default: false)")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_write_file",
    description: "Write content to a file with atomic write operation, optional backup, and directory creation",
    inputSchema: z.object({
      filePath: z.string().describe("Path to the file to write"),
      content: z.string().describe("Content to write to the file"),
      encoding: z.string().optional().describe("File encoding (default: 'utf-8')"),
      createDirs: z.boolean().optional().describe("Create parent directories if they don't exist (default: true)"),
      backup: z.boolean().optional().describe("Create backup of existing file (default: false)"),
      mode: z.string().optional().describe("File permissions in octal format (e.g., '0644')")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_append_file",
    description: "Append content to an existing file or create a new file",
    inputSchema: z.object({
      filePath: z.string().describe("Path to the file to append to"),
      content: z.string().describe("Content to append"),
      encoding: z.string().optional().describe("File encoding (default: 'utf-8')"),
      createIfMissing: z.boolean().optional().describe("Create file if it doesn't exist (default: true)"),
      newlineBefore: z.boolean().optional().describe("Add newline before content (default: true)")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_grep_files",
    description: "Search for regex patterns in files with recursive directory search. IMPORTANT: Use absolute paths (e.g., /Users/name/project) or paths will be resolved relative to the MCP server's working directory. Supports context lines, file filtering by glob patterns (e.g., '*.ts', '**/*.json'), and case-insensitive search. Returns match count and files searched count.",
    inputSchema: z.object({
      pattern: z.string().describe("Regex pattern to search for"),
      paths: z.array(z.string()).describe("Array of file or directory paths to search"),
      recursive: z.boolean().optional().describe("Recursively search directories (default: true)"),
      ignoreCase: z.boolean().optional().describe("Case-insensitive search (default: false)"),
      includeLineNumbers: z.boolean().optional().describe("Include line numbers in results (default: true)"),
      contextLines: z.number().optional().describe("Number of context lines to show around matches (default: 0)"),
      maxResults: z.number().optional().describe("Maximum number of results to return (default: 1000)"),
      filePattern: z.string().optional().describe("Glob pattern to filter files (e.g., '*.ts')"),
      excludePattern: z.string().optional().describe("Glob pattern to exclude files")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_find_files",
    description: "Find files by glob pattern (e.g., '*.json', '**/*.ts', '**/src/**/*.js'). IMPORTANT: Use absolute searchPath (e.g., /Users/name/project) or it will be resolved relative to the MCP server's working directory. Pattern examples: '*.json' (files in search dir only), '**/*.json' (recursive all subdirs), '**/test/**/*.ts' (specific subdirectories). Supports type filtering, depth limits, and returns file metadata.",
    inputSchema: z.object({
      searchPath: z.string().describe("Root directory to search from"),
      pattern: z.string().optional().describe("Glob pattern to match files (e.g., '*.ts', '**/*.json')"),
      type: z.enum(["file", "directory", "all"]).optional().describe("Filter by type (default: 'all')"),
      maxDepth: z.number().optional().describe("Maximum directory depth to search"),
      ignoreHidden: z.boolean().optional().describe("Ignore hidden files and directories (default: true)"),
      followSymlinks: z.boolean().optional().describe("Follow symbolic links (default: false)"),
      maxResults: z.number().optional().describe("Maximum number of results (default: 1000)")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_list_directory",
    description: "List directory contents with detailed file information, sorting, and filtering options. Paths can be absolute (e.g., /Users/name/dir) or relative (resolved from MCP server's working directory). Supports recursive listing, hidden file filtering, and sorting by name/size/modified date.",
    inputSchema: z.object({
      directoryPath: z.string().describe("Path to the directory to list"),
      recursive: z.boolean().optional().describe("List subdirectories recursively (default: false)"),
      includeHidden: z.boolean().optional().describe("Include hidden files (default: false)"),
      includeStats: z.boolean().optional().describe("Include file statistics (default: true)"),
      sortBy: z.enum(["name", "size", "modified"]).optional().describe("Sort entries by field (default: 'name')"),
      pattern: z.string().optional().describe("Glob pattern to filter entries")
    }),
    outputSchema: z.any()
  },
  {
    name: "filesystem_edit_file",
    description: "Edit file with multiple line-based operations (insert, replace, delete) with atomic updates and backup",
    inputSchema: z.object({
      filePath: z.string().describe("Path to the file to edit"),
      operations: z.array(z.object({
        type: z.enum(["insert", "replace", "delete"]).describe("Type of operation"),
        startLine: z.number().describe("Starting line number (1-based)"),
        endLine: z.number().optional().describe("Ending line number for replace/delete operations"),
        content: z.string().optional().describe("Content for insert/replace operations")
      })).describe("Array of edit operations to apply"),
      backup: z.boolean().optional().describe("Create backup before editing (default: true)")
    }),
    outputSchema: z.any()
  },
];

// Central tool execution handler
export async function handleToolCall(name: string, args: any, context?: any) {
  // context contains _meta with projectId, auth_cookie, platformType, etc.
  // Currently not used by RN tools (they take explicit parameters)
  // But available for future extensibility and consistency with UI server
  
  console.log(`[handleToolCall] START: ${name}`);
  console.log(`[handleToolCall] Args:`, JSON.stringify(args));
  console.log(`[handleToolCall] Context:`, context ? 'present' : 'absent');
  
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

