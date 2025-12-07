import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import os from "os";

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOWED_COMMANDS = [
    'git', 'npm', 'node', 'npx', 'yarn', 'pnpm',
    'ls', 'cat', 'grep', 'find', 'echo', 'pwd',
    'which', 'whoami', 'date', 'wc', 'head', 'tail',
    'sort', 'uniq', 'diff', 'tree', 'du', 'df'
] as const;

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_SEARCH_RESULTS = 1000;
const DEFAULT_ENCODING = 'utf-8';
const BACKUP_SUFFIX = '.backup';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Command Execution Types
interface ExecuteCommandArgs {
    command: string;
    args?: string[];
    cwd?: string;
    timeout?: number;
    shell?: boolean;
}

interface ExecuteCommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    duration: number;
    message: string;
}

// Echo Command Types
interface EchoCommandArgs {
    text: string;
    newline?: boolean;
    filePath?: string;
}

interface EchoCommandResult {
    output?: string;
    filePath?: string;
    bytesWritten?: number;
    message: string;
}

// Sed Command Types
interface SedCommandArgs {
    filePath: string;
    pattern: string;
    replacement: string;
    flags?: string;
    backup?: boolean;
    inPlace?: boolean;
}

interface SedCommandResult {
    replacements: number;
    backupPath?: string;
    preview: string;
    message: string;
}

// Read File Types
interface ReadFileArgs {
    filePath: string;
    encoding?: string;
    offset?: number;
    limit?: number;
    binary?: boolean;
}

interface ReadFileResult {
    content: string;
    lineCount: number;
    size: number;
    encoding: string;
    message: string;
}

// Write File Types
interface WriteFileArgs {
    filePath: string;
    content: string;
    encoding?: string;
    createDirs?: boolean;
    backup?: boolean;
    mode?: string;
}

interface WriteFileResult {
    bytesWritten: number;
    filePath: string;
    backupPath?: string;
    message: string;
}

// Append File Types
interface AppendFileArgs {
    filePath: string;
    content: string;
    encoding?: string;
    createIfMissing?: boolean;
    newlineBefore?: boolean;
}

interface AppendFileResult {
    bytesAppended: number;
    newFileSize: number;
    lineCount: number;
    message: string;
}

// Grep Files Types
interface GrepFilesArgs {
    pattern: string;
    paths: string[];
    recursive?: boolean;
    ignoreCase?: boolean;
    includeLineNumbers?: boolean;
    contextLines?: number;
    maxResults?: number;
    filePattern?: string;
    excludePattern?: string;
}

interface FileMatch {
    file: string;
    line: string;
    lineNumber: number;
    context?: string[];
}

interface GrepFilesResult {
    matches: FileMatch[];
    totalMatches: number;
    filesSearched: number;
    message: string;
}

// Find Files Types
interface FindFilesArgs {
    searchPath: string;
    pattern?: string;
    type?: 'file' | 'directory' | 'all';
    maxDepth?: number;
    ignoreHidden?: boolean;
    followSymlinks?: boolean;
    maxResults?: number;
}

interface FileEntry {
    path: string;
    size: number;
    modified: Date;
    type: 'file' | 'directory';
    permissions?: string;
}

interface FindFilesResult {
    files: FileEntry[];
    totalFound: number;
    message: string;
}

// List Directory Types
interface ListDirectoryArgs {
    directoryPath: string;
    recursive?: boolean;
    includeHidden?: boolean;
    includeStats?: boolean;
    sortBy?: 'name' | 'size' | 'modified';
    pattern?: string;
}

interface ListDirectoryResult {
    entries: FileEntry[];
    totalCount: number;
    message: string;
}

// Edit File Types
interface EditOperation {
    type: 'insert' | 'replace' | 'delete';
    startLine: number;
    endLine?: number;
    content?: string;
}

interface EditFileArgs {
    filePath: string;
    operations: EditOperation[];
    backup?: boolean;
}

interface EditFileResult {
    operationsApplied: number;
    linesModified: number;
    backupPath?: string;
    message: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates a file path to prevent directory traversal attacks
 * For absolute paths, this just ensures they're properly formatted
 * For relative paths, ensures they don't escape the current working directory
 */
const validatePath = (filePath: string): void => {
    // Allow absolute paths
    if (path.isAbsolute(filePath)) {
        return; // Absolute paths are allowed
    }
    
    // For relative paths, check they don't escape current directory
    const normalized = path.normalize(filePath);
    if (normalized.startsWith('..') || normalized.includes(path.sep + '..')) {
        throw new Error('Relative path cannot escape current working directory');
    }
};

/**
 * Creates a timestamped backup of a file
 */
const createBackup = async (filePath: string): Promise<string> => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}${BACKUP_SUFFIX}.${timestamp}`;
    
    await fs.copy(filePath, backupPath);
    return backupPath;
};

/**
 * Checks if a command is in the whitelist
 */
const isCommandAllowed = (command: string): boolean => {
    const baseCommand = command.split(' ')[0];
    return ALLOWED_COMMANDS.includes(baseCommand as any);
};

/**
 * Formats file size in human-readable format
 */
const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * Reads a file with size limit enforcement
 */
const readFileWithLimit = async (
    filePath: string,
    maxSize: number,
    encoding: BufferEncoding = DEFAULT_ENCODING as BufferEncoding
): Promise<string> => {
    const stats = await fs.stat(filePath);
    
    if (stats.size > maxSize) {
        throw new Error(
            `File size (${formatFileSize(stats.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
        );
    }
    
    const content = await fs.readFile(filePath, { encoding });
    return content;
};

/**
 * Performs atomic file write operation
 */
const atomicWrite = async (
    filePath: string,
    content: string,
    encoding: BufferEncoding = DEFAULT_ENCODING as BufferEncoding
): Promise<void> => {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    
    try {
        await fs.writeFile(tempPath, content, { encoding });
        await fs.rename(tempPath, filePath);
    } catch (error) {
        // Cleanup temp file if it exists
        if (fs.existsSync(tempPath)) {
            await fs.unlink(tempPath);
        }
        throw error;
    }
};

/**
 * Recursively searches files matching a pattern
 * Returns both matches and count of files searched
 */
const searchFilesRecursive = async (
    dirPath: string,
    pattern: RegExp,
    options: {
        ignoreCase: boolean;
        contextLines: number;
        maxResults: number;
        filePattern?: string;
        excludePattern?: string;
    }
): Promise<{ matches: FileMatch[]; filesSearched: number }> => {
    const matches: FileMatch[] = [];
    let filesSearched = 0;
    
    // Helper to check if filename matches glob pattern
    const matchesGlob = (filename: string, globPattern: string): boolean => {
        // Handle brace expansion: *.{js,ts} -> (*.js|*.ts)
        let pattern = globPattern;
        
        // Expand braces: {a,b,c} -> (a|b|c)
        pattern = pattern.replace(/\{([^}]+)\}/g, (_, group) => {
            return `(${group.split(',').join('|')})`;
        });
        
        // Escape dots before wildcards
        pattern = pattern.replace(/\./g, '\\.');
        
        // Convert glob wildcards to regex
        pattern = pattern.replace(/\*/g, '.*');
        pattern = pattern.replace(/\?/g, '.');
        
        // Anchor the pattern
        pattern = `^${pattern}$`;
        
        const regex = new RegExp(pattern);
        return regex.test(filename);
    };
    
    const processFile = async (filePath: string) => {
        filesSearched++;
        
        try {
            const stats = await fs.stat(filePath);
            if (stats.size > MAX_FILE_SIZE) return; // Skip large files
            
            const content = await fs.readFile(filePath, { encoding: 'utf-8' });
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                if (matches.length >= options.maxResults) return;
                
                // Use the pattern as-is since ignoreCase is already applied at creation
                const testPattern = pattern;
                
                if (testPattern.test(line)) {
                    const context: string[] = [];
                    
                    if (options.contextLines > 0) {
                        const start = Math.max(0, index - options.contextLines);
                        const end = Math.min(lines.length, index + options.contextLines + 1);
                        
                        for (let i = start; i < end; i++) {
                            if (i !== index) {
                                context.push(`${i + 1}: ${lines[i]}`);
                            }
                        }
                    }
                    
                    matches.push({
                        file: filePath,
                        line: line,
                        lineNumber: index + 1,
                        context: context.length > 0 ? context : undefined
                    });
                }
            });
        } catch (error) {
            // Skip files that can't be read
        }
    };
    
    const traverse = async (currentPath: string) => {
        if (matches.length >= options.maxResults) return;
        
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
            if (matches.length >= options.maxResults) break;
            
            const fullPath = path.join(currentPath, entry.name);
            
            if (entry.isDirectory()) {
                // Skip hidden directories if needed
                if (entry.name.startsWith('.')) continue;
                await traverse(fullPath);
            } else if (entry.isFile()) {
                // Apply file pattern filtering
                if (options.filePattern && !matchesGlob(entry.name, options.filePattern)) {
                    continue;
                }
                
                if (options.excludePattern && matchesGlob(entry.name, options.excludePattern)) {
                    continue;
                }
                
                await processFile(fullPath);
            }
        }
    };
    
    await traverse(dirPath);
    return { matches, filesSearched };
};

// ============================================================================
// EXPORTED TOOL FUNCTIONS
// ============================================================================

/**
 * Tool 1: Execute a whitelisted shell command
 */
export async function executeCommand(args: ExecuteCommandArgs): Promise<ExecuteCommandResult> {
    try {
        // Validate command is whitelisted
        if (!isCommandAllowed(args.command)) {
            throw new Error(
                `Command '${args.command}' is not allowed. ` +
                `Allowed commands: ${ALLOWED_COMMANDS.join(', ')}`
            );
        }
        
        const timeout = args.timeout || DEFAULT_TIMEOUT;
        const cwd = args.cwd || process.cwd();
        
        // Validate working directory exists
        if (!fs.existsSync(cwd)) {
            throw new Error(`Working directory does not exist: ${cwd}`);
        }
        
        const startTime = Date.now();
        
        const result = await execa(args.command, args.args || [], {
            cwd,
            timeout,
            shell: args.shell || false,
            reject: false // Don't throw on non-zero exit codes
        });
        
        const duration = Date.now() - startTime;
        
        return {
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode || 0,
            duration,
            message: `Command executed successfully in ${duration}ms (exit code: ${result.exitCode})`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Command execution failed: ${msg}`);
    }
}

/**
 * Tool 2: Echo text to stdout or file
 */
export async function echoCommand(args: EchoCommandArgs): Promise<EchoCommandResult> {
    try {
        const output = args.newline !== false ? `${args.text}\n` : args.text;
        
        if (args.filePath) {
            validatePath(args.filePath);
            await fs.writeFile(args.filePath, output, { encoding: 'utf-8' });
            const buffer = Buffer.from(output, 'utf-8');
            
            return {
                filePath: args.filePath,
                bytesWritten: buffer.length,
                message: `Text written to file: ${args.filePath} (${buffer.length} bytes)`
            };
        } else {
            return {
                output: output,
                message: 'Text echoed successfully'
            };
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Echo command failed: ${msg}`);
    }
}

/**
 * Tool 3: Perform sed-like text replacement
 */
export async function sedCommand(args: SedCommandArgs): Promise<SedCommandResult> {
    try {
        validatePath(args.filePath);
        
        if (!fs.existsSync(args.filePath)) {
            throw new Error(`File does not exist: ${args.filePath}`);
        }
        
        const content = await readFileWithLimit(args.filePath, MAX_FILE_SIZE);
        
        // Create backup if requested
        let backupPath: string | undefined;
        if (args.backup !== false) {
            backupPath = await createBackup(args.filePath);
        }
        
        // Perform replacement
        const flags = args.flags || 'g';
        const regex = new RegExp(args.pattern, flags);
        let replacements = 0;
        
        const modifiedContent = content.replace(regex, (match) => {
            replacements++;
            return args.replacement;
        });
        
        // Write back if in-place
        if (args.inPlace !== false) {
            await atomicWrite(args.filePath, modifiedContent);
        }
        
        // Create preview (first 500 characters)
        const preview = modifiedContent.length > 500 
            ? modifiedContent.substring(0, 500) + '...'
            : modifiedContent;
        
        return {
            replacements,
            backupPath,
            preview,
            message: `Replaced ${replacements} occurrence(s) in ${args.filePath}`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Sed command failed: ${msg}`);
    }
}

/**
 * Tool 4: Read file contents
 */
export async function readFile(args: ReadFileArgs): Promise<ReadFileResult> {
    try {
        validatePath(args.filePath);
        
        if (!fs.existsSync(args.filePath)) {
            throw new Error(`File does not exist: ${args.filePath}`);
        }
        
        const stats = await fs.stat(args.filePath);
        const encoding = (args.encoding || DEFAULT_ENCODING) as BufferEncoding;
        
        let content: string;
        
        if (args.binary) {
            const buffer = await fs.readFile(args.filePath);
            content = buffer.toString('base64');
        } else {
            content = await readFileWithLimit(args.filePath, MAX_FILE_SIZE, encoding);
            
            // Handle offset and limit
            if (args.offset !== undefined || args.limit !== undefined) {
                const lines = content.split('\n');
                const offset = args.offset || 0;
                const limit = args.limit || lines.length;
                const selectedLines = lines.slice(offset, offset + limit);
                content = selectedLines.join('\n');
            }
        }
        
        const lineCount = content.split('\n').length;
        
        return {
            content,
            lineCount,
            size: stats.size,
            encoding: args.binary ? 'base64' : encoding,
            message: `File read successfully: ${args.filePath} (${formatFileSize(stats.size)}, ${lineCount} lines)`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Read file failed: ${msg}`);
    }
}

/**
 * Tool 5: Write content to file
 */
export async function writeFile(args: WriteFileArgs): Promise<WriteFileResult> {
    try {
        validatePath(args.filePath);
        
        const encoding = (args.encoding || DEFAULT_ENCODING) as BufferEncoding;
        let backupPath: string | undefined;
        
        // Create backup if file exists and backup is requested
        if (args.backup && fs.existsSync(args.filePath)) {
            backupPath = await createBackup(args.filePath);
        }
        
        // Create parent directories if requested
        if (args.createDirs !== false) {
            const directory = path.dirname(args.filePath);
            await fs.mkdirp(directory);
        }
        
        // Perform atomic write
        await atomicWrite(args.filePath, args.content, encoding);
        
        // Set file permissions if specified
        if (args.mode) {
            await fs.chmod(args.filePath, parseInt(args.mode, 8));
        }
        
        const bytesWritten = Buffer.from(args.content, encoding).length;
        
        return {
            bytesWritten,
            filePath: args.filePath,
            backupPath,
            message: `File written successfully: ${args.filePath} (${formatFileSize(bytesWritten)})`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Write file failed: ${msg}`);
    }
}

/**
 * Tool 6: Append content to file
 */
export async function appendFile(args: AppendFileArgs): Promise<AppendFileResult> {
    try {
        validatePath(args.filePath);
        
        const encoding = (args.encoding || DEFAULT_ENCODING) as BufferEncoding;
        
        // Create file if it doesn't exist and createIfMissing is true
        if (!fs.existsSync(args.filePath)) {
            if (args.createIfMissing !== false) {
                const directory = path.dirname(args.filePath);
                await fs.mkdirp(directory);
                await fs.writeFile(args.filePath, '', { encoding });
            } else {
                throw new Error(`File does not exist: ${args.filePath}`);
            }
        }
        
        // Read existing content to get stats
        const existingContent = await fs.readFile(args.filePath, { encoding });
        const oldSize = Buffer.from(existingContent, encoding).length;
        
        // Prepare content to append
        let contentToAppend = args.content;
        if (args.newlineBefore !== false && existingContent.length > 0) {
            contentToAppend = '\n' + contentToAppend;
        }
        
        // Append to file
        await fs.appendFile(args.filePath, contentToAppend, { encoding });
        
        // Get new stats
        const stats = await fs.stat(args.filePath);
        const bytesAppended = Buffer.from(contentToAppend, encoding).length;
        const newContent = await fs.readFile(args.filePath, { encoding });
        const lineCount = newContent.split('\n').length;
        
        return {
            bytesAppended,
            newFileSize: stats.size,
            lineCount,
            message: `Content appended successfully: ${args.filePath} (${formatFileSize(bytesAppended)} added)`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Append file failed: ${msg}`);
    }
}

/**
 * Tool 7: Search for patterns in files (grep)
 */
export async function grepFiles(args: GrepFilesArgs): Promise<GrepFilesResult> {
    try {
        const matches: FileMatch[] = [];
        let filesSearched = 0;
        const maxResults = args.maxResults || MAX_SEARCH_RESULTS;
        
        // Create regex pattern
        const flags = args.ignoreCase ? 'gi' : 'g';
        const regex = new RegExp(args.pattern, flags);
        
        for (const searchPath of args.paths) {
            // Convert relative paths to absolute
            const absolutePath = path.isAbsolute(searchPath) 
                ? searchPath 
                : path.resolve(process.cwd(), searchPath);
            
            validatePath(absolutePath);
            
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Path does not exist: ${searchPath} (resolved to: ${absolutePath})`);
            }
            
            const stats = await fs.stat(absolutePath);
            
            if (stats.isFile()) {
                // Search single file
                filesSearched++;
                
                try {
                    const content = await readFileWithLimit(absolutePath, MAX_FILE_SIZE, 'utf-8');
                    const lines = content.split('\n');
                    
                    lines.forEach((line, index) => {
                        if (matches.length >= maxResults) return;
                        
                        if (regex.test(line)) {
                            const context: string[] = [];
                            const contextLines = args.contextLines || 0;
                            
                            if (contextLines > 0 && args.includeLineNumbers !== false) {
                                const start = Math.max(0, index - contextLines);
                                const end = Math.min(lines.length, index + contextLines + 1);
                                
                                for (let i = start; i < end; i++) {
                                    if (i !== index) {
                                        context.push(`${i + 1}: ${lines[i]}`);
                                    }
                                }
                            }
                            
                            matches.push({
                                file: absolutePath,
                                line: line,
                                lineNumber: args.includeLineNumbers !== false ? index + 1 : 0,
                                context: context.length > 0 ? context : undefined
                            });
                        }
                    });
                } catch (error) {
                    // Skip files that can't be read
                }
            } else if (stats.isDirectory() && args.recursive !== false) {
                // Search directory recursively
                const result = await searchFilesRecursive(absolutePath, regex, {
                    ignoreCase: args.ignoreCase || false,
                    contextLines: args.contextLines || 0,
                    maxResults: maxResults - matches.length,
                    filePattern: args.filePattern,
                    excludePattern: args.excludePattern
                });
                
                matches.push(...result.matches);
                filesSearched += result.filesSearched;
            }
            
            if (matches.length >= maxResults) break;
        }
        
        return {
            matches,
            totalMatches: matches.length,
            filesSearched,
            message: `Found ${matches.length} match(es) in ${filesSearched} file(s) searched`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Grep files failed: ${msg}`);
    }
}

/**
 * Tool 8: Find files by pattern
 */
export async function findFiles(args: FindFilesArgs): Promise<FindFilesResult> {
    try {
        // Convert relative paths to absolute
        const absolutePath = path.isAbsolute(args.searchPath)
            ? args.searchPath
            : path.resolve(process.cwd(), args.searchPath);
            
        validatePath(absolutePath);
        
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Search path does not exist: ${args.searchPath} (resolved to: ${absolutePath})`);
        }
        
        const files: FileEntry[] = [];
        const maxResults = args.maxResults || MAX_SEARCH_RESULTS;
        
        // Use glob for pattern matching
        const pattern = args.pattern || '**/*';
        const ignoreHidden = args.ignoreHidden !== false;
        
        const globOptions = {
            cwd: absolutePath,
            absolute: true,
            followSymbolicLinks: args.followSymlinks || false,
            dot: !ignoreHidden,
            maxDepth: args.maxDepth,
            ignore: ignoreHidden ? ['**/.*', '**/.*/**'] : undefined
        };
        
        const matches = await glob(pattern, globOptions);
        
        for (const match of matches) {
            if (files.length >= maxResults) break;
            
            try {
                const fullPath = match;
                const stats = await fs.stat(fullPath);
                
                // Filter by type
                if (args.type) {
                    if (args.type === 'file' && !stats.isFile()) continue;
                    if (args.type === 'directory' && !stats.isDirectory()) continue;
                }
                
                files.push({
                    path: fullPath,
                    size: stats.size,
                    modified: stats.mtime,
                    type: stats.isDirectory() ? 'directory' : 'file',
                    permissions: stats.mode.toString(8).slice(-3)
                });
            } catch (error) {
                // Skip files that can't be accessed
            }
        }
        
        return {
            files,
            totalFound: files.length,
            message: `Found ${files.length} file(s) matching pattern '${pattern}' in ${absolutePath}`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Find files failed: ${msg}`);
    }
}

/**
 * Tool 9: List directory contents
 */
export async function listDirectory(args: ListDirectoryArgs): Promise<ListDirectoryResult> {
    try {
        validatePath(args.directoryPath);
        
        if (!fs.existsSync(args.directoryPath)) {
            throw new Error(`Directory does not exist: ${args.directoryPath}`);
        }
        
        const stats = await fs.stat(args.directoryPath);
        if (!stats.isDirectory()) {
            throw new Error(`Path is not a directory: ${args.directoryPath}`);
        }
        
        const entries: FileEntry[] = [];
        
        const traverse = async (currentPath: string, depth: number = 0) => {
            const items = await fs.readdir(currentPath, { withFileTypes: true });
            
            for (const item of items) {
                // Skip hidden files if requested
                if (!args.includeHidden && item.name.startsWith('.')) {
                    continue;
                }
                
                const fullPath = path.join(currentPath, item.name);
                
                try {
                    const itemStats = args.includeStats !== false 
                        ? await fs.stat(fullPath)
                        : null;
                    
                    // Apply pattern filter if specified
                    if (args.pattern) {
                        const matched = await glob(args.pattern, {
                            cwd: currentPath,
                            nodir: false
                        });
                        if (!matched.includes(item.name)) continue;
                    }
                    
                    const entry: FileEntry = {
                        path: fullPath,
                        size: itemStats?.size || 0,
                        modified: itemStats?.mtime || new Date(),
                        type: item.isDirectory() ? 'directory' : 'file',
                        permissions: itemStats ? itemStats.mode.toString(8).slice(-3) : undefined
                    };
                    
                    entries.push(entry);
                    
                    // Recurse into subdirectories if requested
                    if (args.recursive && item.isDirectory()) {
                        await traverse(fullPath, depth + 1);
                    }
                } catch (error) {
                    // Skip items that can't be accessed
                }
            }
        };
        
        await traverse(args.directoryPath);
        
        // Sort entries
        const sortBy = args.sortBy || 'name';
        entries.sort((a, b) => {
            switch (sortBy) {
                case 'size':
                    return b.size - a.size;
                case 'modified':
                    return b.modified.getTime() - a.modified.getTime();
                case 'name':
                default:
                    return a.path.localeCompare(b.path);
            }
        });
        
        return {
            entries,
            totalCount: entries.length,
            message: `Listed ${entries.length} item(s) in ${args.directoryPath}`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`List directory failed: ${msg}`);
    }
}

/**
 * Tool 10: Edit file with multiple operations
 */
export async function editFile(args: EditFileArgs): Promise<EditFileResult> {
    try {
        validatePath(args.filePath);
        
        if (!fs.existsSync(args.filePath)) {
            throw new Error(`File does not exist: ${args.filePath}`);
        }
        
        const content = await readFileWithLimit(args.filePath, MAX_FILE_SIZE);
        let lines = content.split('\n');
        
        // Create backup if requested
        let backupPath: string | undefined;
        if (args.backup !== false) {
            backupPath = await createBackup(args.filePath);
        }
        
        // Validate all operations first
        for (const op of args.operations) {
            if (op.startLine < 1 || op.startLine > lines.length + 1) {
                throw new Error(
                    `Invalid startLine ${op.startLine} for operation. ` +
                    `File has ${lines.length} lines.`
                );
            }
            
            if (op.endLine !== undefined && (op.endLine < op.startLine || op.endLine > lines.length)) {
                throw new Error(
                    `Invalid endLine ${op.endLine} for operation. ` +
                    `Must be >= startLine (${op.startLine}) and <= ${lines.length}.`
                );
            }
        }
        
        // Sort operations by line number (descending) to avoid index shifts
        const sortedOps = [...args.operations].sort((a, b) => b.startLine - a.startLine);
        
        let operationsApplied = 0;
        let linesModified = 0;
        
        for (const op of sortedOps) {
            const startIdx = op.startLine - 1; // Convert to 0-based index
            
            switch (op.type) {
                case 'insert':
                    if (!op.content) {
                        throw new Error('Insert operation requires content');
                    }
                    const insertLines = op.content.split('\n');
                    lines.splice(startIdx, 0, ...insertLines);
                    linesModified += insertLines.length;
                    operationsApplied++;
                    break;
                    
                case 'replace':
                    if (!op.content) {
                        throw new Error('Replace operation requires content');
                    }
                    const endIdx = (op.endLine || op.startLine) - 1;
                    const numLinesToReplace = endIdx - startIdx + 1;
                    const replaceLines = op.content.split('\n');
                    lines.splice(startIdx, numLinesToReplace, ...replaceLines);
                    linesModified += numLinesToReplace;
                    operationsApplied++;
                    break;
                    
                case 'delete':
                    const deleteEndIdx = (op.endLine || op.startLine) - 1;
                    const numLinesToDelete = deleteEndIdx - startIdx + 1;
                    lines.splice(startIdx, numLinesToDelete);
                    linesModified += numLinesToDelete;
                    operationsApplied++;
                    break;
                    
                default:
                    throw new Error(`Unknown operation type: ${op.type}`);
            }
        }
        
        // Write modified content back to file
        const modifiedContent = lines.join('\n');
        await atomicWrite(args.filePath, modifiedContent);
        
        return {
            operationsApplied,
            linesModified,
            backupPath,
            message: `Applied ${operationsApplied} operation(s), modified ${linesModified} line(s) in ${args.filePath}`
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Edit file failed: ${msg}`);
    }
}

