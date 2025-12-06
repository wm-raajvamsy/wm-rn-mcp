import {
  authenticateWithToken,
  findProject,
  downloadProject,
  pullChanges,
  pushChanges,
} from "./project.js";

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

