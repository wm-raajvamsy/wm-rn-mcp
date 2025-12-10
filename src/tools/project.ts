import axios, { AxiosResponse } from "axios";
import os from "os";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import FormData from "form-data";

// ============================================================================
// CONSTANTS
// ============================================================================

const AUTH_COOKIE_PREFIX = 'auth_cookie=';
const MASTER_BRANCH = 'master';
const WM_CONFIG_DIR = '.git/wm';
const STUDIO_LAST_KNOWN_REF = 'refs/heads/studio-last-known';
const BUNDLE_FILE_NAME = 'remoteChanges.bundle';

const ENDPOINTS = {
    PROJECTS_LIST: '/edn-services/rest/users/projects/list',
    GIT_BARE: '/studio/services/projects/:projectId/vcs/gitBare',
    VCS_PULL: '/studio/services/projects/:projectId/vcs/pull',
    VCS_APPLY_BUNDLE: '/studio/services/projects/:projectId/vcs/applyBundle',
    FILE_SERVICE: '/file-service/:fileId'
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProjectInfo {
    studioProjectId: string;
    platformVersion: string;
    displayName: string;
    name: string;
    vcsBranchId: string;
}

interface GitBareResponse {
    fileId: string;
    remoteBaseCommitId: string;
}

interface PullResponse {
    fileId: string;
    remoteBaseCommitId: string;
}

interface FileChange {
    status: string;
    filePath: string;
}

interface VcsStatusResponse {
    repositoryState: string;
    headCommitId: string;
    remoteTrackingBranchHeadCommitId: string;
    lastPulledCommitId: string;
    mergeInProgress: boolean;
}

// ============================================================================
// HELPER FUNCTIONS - HTTP
// ============================================================================

/**
 * Creates standard HTTP headers for WaveMaker API requests
 */
const createAuthHeaders = (authCookie: string) => ({
    cookie: authCookie,
    'accept': 'application/json, text/plain, */*',
    'x-requested-with': 'XMLHttpRequest'
});

/**
 * Fetches the list of projects from WaveMaker Studio
 */
const fetchProjectsList = async (baseUrl: string, authCookie: string): Promise<ProjectInfo[]> => {
    const response = await axios.get(`${baseUrl}${ENDPOINTS.PROJECTS_LIST}`, {
        headers: createAuthHeaders(authCookie)
    });
    return response.data;
};

/**
 * Downloads a file from WaveMaker file service
 */
const downloadFromFileService = async (
    baseUrl: string,
    fileId: string,
    authCookie: string,
    destPath: string
): Promise<void> => {
    const url = `${baseUrl}${ENDPOINTS.FILE_SERVICE.replace(':fileId', fileId)}`;
    const response = await axios.get(url, {
        responseType: 'stream',
        headers: createAuthHeaders(authCookie)
    });
    await downloadFile(response, destPath);
};

/**
 * Downloads a file from a stream response
 */
const downloadFile = async (res: AxiosResponse, tempFile: string): Promise<void> => {
    if (res.status !== 200) {
        throw new Error(`Failed to download file: HTTP ${res.status}`);
    }
    await new Promise<void>((resolve, reject) => {
        const fw = fs.createWriteStream(tempFile);
        res.data.pipe(fw);
        fw.on('error', (err: Error) => {
            fw.close();
            reject(new Error(`File write error: ${err.message}`));
        });
        fw.on('close', () => resolve());
    });
};

// ============================================================================
// HELPER FUNCTIONS - GIT
// ============================================================================

/**
 * Gets the current HEAD commit ID
 */
const getHeadCommitId = async (projectDir: string): Promise<string> => {
    const output = await execa('git', ['rev-parse', 'HEAD'], { cwd: projectDir });
    return output.stdout.trim();
};

/**
 * Checks if there are uncommitted changes in the repository
 */
const hasUncommittedChanges = async (projectDir: string): Promise<boolean> => {
    const output = await execa('git', ['status', '--porcelain'], { cwd: projectDir });
    return output.stdout.trim().length > 0;
};

/**
 * Stages and commits all changes
 */
const commitChanges = async (projectDir: string, message: string): Promise<void> => {
    await execa('git', ['add', '-A'], { cwd: projectDir });
    await execa('git', ['commit', '-m', message], { cwd: projectDir });
};

/**
 * Creates a git bundle with the specified branch
 */
const createGitBundle = async (
    projectDir: string,
    branchName: string,
    outputPath: string
): Promise<void> => {
    try {
        await execa('git', ['bundle', 'create', outputPath, branchName], { cwd: projectDir });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to create git bundle: ${msg}`);
    }
};

// ============================================================================
// HELPER FUNCTIONS - FILE SYSTEM
// ============================================================================

/**
 * Creates a temporary directory with a timestamped name
 */
const createTempDir = (prefix: string): string => {
    return path.join(os.tmpdir(), `${prefix}_${Date.now()}`);
};

/**
 * Safely cleans up files and directories
 */
const cleanupPaths = (...paths: string[]): void => {
    for (const p of paths) {
        if (!fs.existsSync(p)) continue;
        
        try {
            if (fs.statSync(p).isDirectory()) {
                fs.rmSync(p, { recursive: true, force: true });
            } else {
                fs.unlinkSync(p);
            }
        } catch (error) {
            // Log but don't throw - cleanup should be best effort
            console.warn(`Failed to cleanup ${p}:`, error);
        }
    }
};

// ============================================================================
// HELPER FUNCTIONS - WORKSPACE CONFIG
// ============================================================================

/**
 * Updates the workspace sync configuration with new remote base commit ID
 */
const updateWorkspaceConfig = async (
    projectDir: string,
    remoteBaseCommitId: string
): Promise<void> => {
    const wmConfigPath = path.join(projectDir, WM_CONFIG_DIR, 'config');
    if (!fs.existsSync(wmConfigPath)) return;
    
    let configContent = fs.readFileSync(wmConfigPath, 'utf-8');
    configContent = configContent
        .replace(/RemoteBaseCommitId=.*/, `RemoteBaseCommitId=${remoteBaseCommitId}`)
        .replace(/studio-last-known=.*/, `studio-last-known=${remoteBaseCommitId}`);
    
    fs.writeFileSync(wmConfigPath, configContent);
    
    // Update studio-last-known git reference
    await execa('git', ['update-ref', STUDIO_LAST_KNOWN_REF, remoteBaseCommitId], {
        cwd: projectDir
    });
};

/**
 * Helper function for git operations during pull
 * Fetches changes from a bundle and resets the working directory
 */
const gitResetAndPull = async (tempDir: string, projectDir: string): Promise<void> => {
    try {
        await execa('git', ['clean', '-fd', '-e', 'output'], { cwd: projectDir });
        await execa('git', ['fetch', path.join(tempDir, BUNDLE_FILE_NAME), `refs/heads/${MASTER_BRANCH}`], { cwd: projectDir });
        await execa('git', ['reset', '--hard', 'FETCH_HEAD'], { cwd: projectDir });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Git reset and pull failed: ${msg}`);
    }
};

/**
 * Initializes workspace sync configuration for local development
 * Creates .git/wm/config and sets up git references
 */
const initializeWorkspaceSync = async (
    projectDir: string,
    baseUrl: string,
    projectId: string,
    authCookie: string,
    remoteBaseCommitId: string
): Promise<void> => {
    // Create .git/wm directory
    const wmDir = path.join(projectDir, WM_CONFIG_DIR);
    fs.mkdirpSync(wmDir);

    // Create config file
    const configPath = path.join(wmDir, 'config');
    const config = [
        `RemoteBaseCommitId=${remoteBaseCommitId}`,
        `authType=TOKEN`,
        `baseUrl=${baseUrl}`,
        `projectId=${projectId}`,
        `studio-last-known=${remoteBaseCommitId}`,
        `token_hash=${authCookie.replace(AUTH_COOKIE_PREFIX, '')}`
    ].join('\n');
    
    fs.writeFileSync(configPath, config + '\n');

    // Create studio-last-known git reference
    await execa('git', ['update-ref', STUDIO_LAST_KNOWN_REF, remoteBaseCommitId], {
        cwd: projectDir
    });
};

// ============================================================================
// EXPORTED TOOLS
// ============================================================================

/**
 * Tool 1: Authenticate with token
 * Validates the authentication token by attempting to fetch the projects list
 */
export async function authenticateWithToken(args: {
    baseUrl: string;
    authToken: string;
}): Promise<{ success: boolean; authCookie: string; message: string }> {
    try {
        const authCookie = `${AUTH_COOKIE_PREFIX}${args.authToken}`;
        
        // Validate token by attempting to fetch projects list
        await fetchProjectsList(args.baseUrl, authCookie);
        
        return {
            success: true,
            authCookie,
            message: 'Authentication successful'
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Authentication failed: ${msg}`);
    }
}

/**
 * Tool 2: Find project ID from project name and preview URL
 * Searches for a project by name and validates it against the preview URL
 */
export async function findProject(args: {
    baseUrl: string;
    authCookie: string;
    projectName: string;
    appPreviewUrl: string;
}): Promise<{ projectId: string; platformVersion: string; message: string }> {
    try {
        const projectList: ProjectInfo[] = await fetchProjectsList(args.baseUrl, args.authCookie);

        // Remove trailing slash from preview URL for consistent matching
        const normalizedUrl = args.appPreviewUrl.replace(/\/$/, '');

        const project = projectList.find(p => 
            p.displayName === args.projectName &&
            normalizedUrl.endsWith(`${p.name}_${p.vcsBranchId}`)
        );

        if (!project) {
            throw new Error(
                `Project '${args.projectName}' not found or does not match preview URL. ` +
                `Available projects: ${projectList.map(p => p.displayName).join(', ')}`
            );
        }

        return {
            projectId: project.studioProjectId,
            platformVersion: project.platformVersion,
            message: `Found project: ${project.studioProjectId} (${project.displayName})`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to find project: ${msg}`);
    }
}

/**
 * Tool 3: Download WaveMaker project (>=11.4.0 flow only)
 * Downloads a complete project from WaveMaker Studio including git repository
 */
export async function downloadProject(args: {
    baseUrl: string;
    projectId: string;
    authCookie: string;
    projectDir: string;
}): Promise<{ projectDir: string; remoteBaseCommitId: string; message: string }> {
    const tempFile = path.join(os.tmpdir(), `changes_${Date.now()}.zip`);
    const tempDir = createTempDir('project');
    
    try {
        // Get git bare repository info
        const gitInfo = await axios.get<GitBareResponse>(
            `${args.baseUrl}/studio/services/projects/${args.projectId}/vcs/gitBare`,
            {
                responseType: 'json',
                headers: createAuthHeaders(args.authCookie)
            }
        );

        const { fileId, remoteBaseCommitId } = gitInfo.data;

        // Download the git repository
        await downloadFromFileService(args.baseUrl, fileId, args.authCookie, tempFile);

        const gitDir = path.join(args.projectDir, '.git');

        if (fs.existsSync(gitDir)) {
            // Update existing git repository
            await execa('unzip', ['-o', tempFile, '-d', gitDir]);
            await execa('git', ['config', '--local', '--unset', 'core.bare'], { cwd: args.projectDir });
            await execa('git', ['restore', '.'], { cwd: args.projectDir });
        } else {
            // Clone new repository
            await execa('unzip', ['-o', tempFile, '-d', tempDir]);
            if (fs.existsSync(args.projectDir)) {
                fs.rmSync(args.projectDir, { recursive: true, force: true });
            }
            await execa('git', ['clone', '-b', MASTER_BRANCH, tempDir, args.projectDir]);
        }

        // Create log directory
        fs.mkdirpSync(path.join(args.projectDir, 'output', 'logs'));

        // Initialize workspace sync configuration
        await initializeWorkspaceSync(
            args.projectDir,
            args.baseUrl,
            args.projectId,
            args.authCookie,
            remoteBaseCommitId
        );

        return {
            projectDir: args.projectDir,
            remoteBaseCommitId,
            message: `Project downloaded successfully to ${args.projectDir}. Workspace sync initialized.`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to download project: ${msg}`);
    } finally {
        // Cleanup temp files
        cleanupPaths(tempFile, tempDir);
    }
}

/**
 * Tool 4: Pull changes from WaveMaker Studio (>=11.4.0 flow only)
 * Pulls the latest changes from WaveMaker Studio and applies them to the local project
 */
export async function pullChanges(args: {
    baseUrl: string;
    projectId: string;
    authCookie: string;
    projectDir: string;
    remoteBaseCommitId: string;
}): Promise<{ headCommitId: string; remoteBaseCommitId: string; filesChanged: FileChange[]; message: string }> {
    const tempDir = createTempDir('changes');
    const tempFile = path.join(tempDir, BUNDLE_FILE_NAME);
    
    try {
        // Get current HEAD commit
        const headCommitId = await getHeadCommitId(args.projectDir);

        // Get pull info from WaveMaker
        const pullUrl = `${args.baseUrl}/studio/services/projects/${args.projectId}/vcs/pull?lastPulledWorkspaceCommitId=${headCommitId}&lastPulledRemoteHeadCommitId=${args.remoteBaseCommitId}`;
        const gitInfo = await axios.get<PullResponse>(pullUrl, {
            responseType: 'json',
            headers: createAuthHeaders(args.authCookie)
        });

        const { fileId, remoteBaseCommitId: newRemoteBaseCommitId } = gitInfo.data;

        // Download the bundle
        fs.mkdirpSync(tempDir);
        await downloadFromFileService(args.baseUrl, fileId, args.authCookie, tempFile);

        // Apply changes
        await gitResetAndPull(tempDir, args.projectDir);

        // Get list of changed files
        const diffOutput = await execa('git', ['diff', '--name-status', 'HEAD~1', 'HEAD'], {
            cwd: args.projectDir
        });

        const filesChanged: FileChange[] = diffOutput.stdout
            .split('\n')
            .filter(Boolean)
            .map((line) => {
                const [status, ...fileParts] = line.trim().split(/\s+/);
                const filePath = fileParts.join(' ').replace(/^.*webapp\//, '');
                return { status, filePath };
            });

        // Update workspace sync configuration
        await updateWorkspaceConfig(args.projectDir, newRemoteBaseCommitId);

        return {
            headCommitId,
            remoteBaseCommitId: newRemoteBaseCommitId,
            filesChanged,
            message: `Successfully pulled changes. ${filesChanged.length} file(s) changed.`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to pull changes: ${msg}`);
    } finally {
        // Cleanup temp files
        cleanupPaths(tempDir);
    }
}

/**
 * Tool 5: Push changes to WaveMaker Studio with stash-pull-push workflow
 * Implements a safe push workflow: stash → pull → apply stash → commit → bundle → push
 */
export async function pushChanges(args: {
    baseUrl: string;
    projectId: string;
    authCookie: string;
    projectDir: string;
    remoteBaseCommitId: string;
    commitMessage?: string;
}): Promise<{ 
    success: boolean; 
    commitId: string;
    remoteBaseCommitId: string;
    pulledFiles?: FileChange[]; 
    message: string 
}> {
    let stashCreated = false;
    const bundleFile = path.join(os.tmpdir(), `push_bundle_${Date.now()}.bundle`);
    
    try {
        // Step 1: Check for uncommitted changes and stash if needed
        if (await hasUncommittedChanges(args.projectDir)) {
            const stashMessage = `Auto stash: ${new Date().toISOString()}`;
            await execa('git', ['stash', 'push', '-u', '-m', stashMessage], {
                cwd: args.projectDir
            });
            stashCreated = true;
        }

        // Step 2: Pull latest from remote
        let pulledFiles: FileChange[] = [];
        let updatedRemoteBaseCommitId = args.remoteBaseCommitId;
        
        try {
            const pullResult = await pullChanges({
                baseUrl: args.baseUrl,
                projectId: args.projectId,
                authCookie: args.authCookie,
                projectDir: args.projectDir,
                remoteBaseCommitId: args.remoteBaseCommitId
            });
            pulledFiles = pullResult.filesChanged;
            updatedRemoteBaseCommitId = pullResult.remoteBaseCommitId;
        } catch (pullError) {
            // If pull fails and we stashed, restore the stash
            if (stashCreated) {
                await execa('git', ['stash', 'pop'], { cwd: args.projectDir });
            }
            const msg = pullError instanceof Error ? pullError.message : String(pullError);
            throw new Error(`Failed to pull latest changes before push: ${msg}`);
        }

        // Step 3: Re-apply stashed changes if we created a stash
        if (stashCreated) {
            try {
                await execa('git', ['stash', 'pop'], { cwd: args.projectDir });
            } catch (stashPopError) {
                // Check if there are conflicts
                const conflictCheck = await execa('git', ['diff', '--name-only', '--diff-filter=U'], {
                    cwd: args.projectDir
                });
                const conflictedFiles = conflictCheck.stdout.split('\n').filter(Boolean);
                
                if (conflictedFiles.length > 0) {
                    throw new Error(
                        `Merge conflicts detected after applying stashed changes. ` +
                        `Conflicted files: ${conflictedFiles.join(', ')}. ` +
                        `Please resolve conflicts manually in ${args.projectDir}`
                    );
                }
                const msg = stashPopError instanceof Error ? stashPopError.message : String(stashPopError);
                throw new Error(`Failed to apply stashed changes: ${msg}`);
            }
        }

        // Step 4: Stage and commit changes if any exist
        const hasFinalChanges = await hasUncommittedChanges(args.projectDir);
        
        if (hasFinalChanges) {
            const commitMsg = args.commitMessage || `Auto commit: ${new Date().toISOString()}`;
            await commitChanges(args.projectDir, commitMsg);
        }

        // Step 5: Get HEAD commit ID
        const commitId = await getHeadCommitId(args.projectDir);

        // Step 6: Create git bundle for push
        await createGitBundle(args.projectDir, MASTER_BRANCH, bundleFile);

        // Step 7: Upload bundle to WaveMaker Studio
        const form = new FormData();
        form.append('bundleFile', fs.createReadStream(bundleFile), {
            filename: 'bundle.bundle',
            contentType: 'application/octet-stream'
        });

        const uploadUrl = `${args.baseUrl}/studio/services/projects/${args.projectId}/vcs/applyBundle?headCommitId=${commitId}`;
        const response = await axios.post(uploadUrl, form, {
            headers: {
                ...form.getHeaders(),
                ...createAuthHeaders(args.authCookie)
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.status !== 200) {
            throw new Error(`Push failed with HTTP ${response.status}`);
        }

        // Step 8: Return result
        let message = `Successfully pushed changes. Commit: ${commitId.substring(0, 7)}`;
        if (pulledFiles.length > 0) {
            message += `. Pulled ${pulledFiles.length} file(s) from remote before pushing.`;
        }
        if (hasFinalChanges) {
            message += ` Local changes committed and pushed.`;
        }

        return {
            success: true,
            commitId,
            remoteBaseCommitId: updatedRemoteBaseCommitId,
            pulledFiles: pulledFiles.length > 0 ? pulledFiles : undefined,
            message
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to push changes: ${msg}`);
    } finally {
        // Always cleanup bundle file
        cleanupPaths(bundleFile);
    }
}