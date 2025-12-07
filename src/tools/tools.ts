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

// Tool definitions with schemas
export const toolDefinitions = [
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

      default:
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

