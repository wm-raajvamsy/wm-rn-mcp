import axios from "axios";

// ============================================================================
// CONSTANTS
// ============================================================================

const API_PATHS = {
    ELEMENT_TREE: '/api/element-tree',
    NETWORK_LOGS: '/api/network-logs',
    CONSOLE_LOGS: '/api/console-logs',
    TIMELINE: '/api/timeline',
    STORAGE: '/api/storage',
    INFO: '/api/info',
    WIDGET: '/api/widget',
    WIDGET_PROPERTIES: '/api/widget/properties',
    WIDGET_STYLES: '/api/widget/styles',
} as const;

const WAVEPULSE_HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json',
} as const;

const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Generic response type for all WavePulse tool functions
 */
type WavePulseResponse<T> = Promise<{ data: T; message: string }>;

/**
 * Element tree node with recursive children structure
 */
interface ElementTreeNode {
    id: string;
    name: string;
    tagName: string;
    children?: ElementTreeNode[];
    [key: string]: any;
}

/**
 * Network request log entry
 */
interface NetworkLog {
    url: string;
    method: string;
    status?: number;
    duration?: number;
    timestamp: string | number;
    requestHeaders?: Record<string, any>;
    responseHeaders?: Record<string, any>;
    requestBody?: any;
    responseBody?: any;
    [key: string]: any;
}

/**
 * Console log entry
 */
interface ConsoleLog {
    level: 'debug' | 'info' | 'warn' | 'error' | 'log';
    message: string;
    timestamp: string | number;
    args?: any[];
    [key: string]: any;
}

/**
 * Timeline event entry
 */
interface TimelineEvent {
    type: 'APP_STARTUP' | 'VARIABLE_INVOKE' | 'PAGE_READY' | 'NETWORK_REQUEST' | string;
    timestamp: string | number;
    details?: Record<string, any>;
    [key: string]: any;
}

/**
 * Storage entry (AsyncStorage/localStorage)
 */
interface StorageEntry {
    key: string;
    value: any;
    [key: string]: any;
}

/**
 * App information
 */
interface AppInfo {
    name?: string;
    version?: string;
    applicationId?: string;
    theme?: string;
    locale?: string;
    [key: string]: any;
}

/**
 * Platform information
 */
interface PlatformInfo {
    os?: string;
    version?: string;
    device?: string;
    [key: string]: any;
}

/**
 * Complete info response
 */
interface InfoResponse {
    app: AppInfo;
    platform: PlatformInfo;
    [key: string]: any;
}

/**
 * Widget styles organized by part
 */
type WidgetStyles = Record<string, Record<string, any>>;

/**
 * Widget properties
 */
type WidgetProperties = Record<string, any>;

/**
 * Complete widget data (properties + styles)
 */
interface WidgetData {
    properties: WidgetProperties;
    styles: WidgetStyles;
}

/**
 * Base request arguments requiring baseUrl and channelId
 */
interface BaseWavePulseArgs {
    baseUrl: string;
    channelId: string;
}

/**
 * Widget-specific request arguments
 */
interface WidgetArgs extends BaseWavePulseArgs {
    widgetId: string;
}

// ============================================================================
// HTTP HELPER FUNCTIONS
// ============================================================================

/**
 * Builds a complete API URL with query parameters
 */
const buildApiUrl = (baseUrl: string, path: string, channelId: string): string => {
    // Ensure baseUrl doesn't end with slash and path starts with slash
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Concatenate base + path, then create URL object for query params
    const fullUrl = `${cleanBaseUrl}${cleanPath}`;
    const url = new URL(fullUrl);
    url.searchParams.set('channelId', channelId);
    return url.toString();
};

/**
 * Generic HTTP request wrapper with error handling
 */
const makeWavePulseRequest = async <T>(
    method: 'GET' | 'DELETE',
    url: string
): Promise<T> => {
    try {
        const response = await axios({
            method,
            url,
            headers: WAVEPULSE_HEADERS,
            timeout: REQUEST_TIMEOUT_MS,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                throw new Error(
                    `WavePulse API error (${error.response.status}): ${
                        error.response.data?.message || error.response.statusText
                    }`
                );
            } else if (error.request) {
                throw new Error(
                    `WavePulse API request failed: Unable to reach ${url}. ` +
                    `Ensure WavePulse server is running and accessible.`
                );
            }
        }
        throw new Error(`WavePulse request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

// ============================================================================
// GENERIC HELPER FUNCTIONS
// ============================================================================

/**
 * Generic function to fetch data from WavePulse API
 */
const fetchResource = async <T>(
    args: BaseWavePulseArgs,
    path: string,
    getSuccessMessage: (data: T) => string
): WavePulseResponse<T> => {
    const url = buildApiUrl(args.baseUrl, path, args.channelId);
    const data = await makeWavePulseRequest<T>('GET', url);
    return { data, message: getSuccessMessage(data) };
};

/**
 * Generic function to clear logs/events for a specific resource type
 */
const clearResource = async (
    args: BaseWavePulseArgs,
    path: string,
    resourceName: string
): WavePulseResponse<{ success: boolean }> => {
    const url = buildApiUrl(args.baseUrl, path, args.channelId);
    await makeWavePulseRequest('DELETE', url);
    return { data: { success: true }, message: `${resourceName} cleared successfully` };
};

/**
 * Generic function to fetch widget-related data
 */
const fetchWidgetResource = async <T>(
    args: WidgetArgs,
    pathBase: string,
    resourceType: string
): WavePulseResponse<T> => {
    const url = buildApiUrl(args.baseUrl, `${pathBase}/${args.widgetId}`, args.channelId);
    const data = await makeWavePulseRequest<T>('GET', url);
    return { data, message: `Widget ${resourceType} retrieved successfully for: ${args.widgetId}` };
};

// ============================================================================
// EXPORTED TOOL FUNCTIONS - ELEMENT TREE
// ============================================================================

/**
 * Get the element tree from the connected mobile app
 * Returns the widget/element hierarchy with id, name, tagName, and children
 */
export async function getElementTree(args: BaseWavePulseArgs): WavePulseResponse<ElementTreeNode> {
    return fetchResource(
        args,
        API_PATHS.ELEMENT_TREE,
        () => 'Element tree retrieved successfully. Use the "id" field for widget property/style lookups.'
    );
}

// ============================================================================
// EXPORTED TOOL FUNCTIONS - NETWORK LOGS
// ============================================================================

/**
 * Get accumulated network request logs from the connected mobile app
 * Returns all HTTP requests made by the app
 */
export async function getNetworkLogs(args: BaseWavePulseArgs): WavePulseResponse<NetworkLog[]> {
    return fetchResource(
        args,
        API_PATHS.NETWORK_LOGS,
        (data) => `Retrieved ${data.length} network log(s)`
    );
}

/**
 * Clear all network logs for the specified channel
 */
export async function clearNetworkLogs(args: BaseWavePulseArgs): WavePulseResponse<{ success: boolean }> {
    return clearResource(args, API_PATHS.NETWORK_LOGS, 'Network logs');
}

// ============================================================================
// EXPORTED TOOL FUNCTIONS - CONSOLE LOGS
// ============================================================================

/**
 * Get accumulated console logs from the connected mobile app
 * Returns debug, info, warn, and error console messages
 */
export async function getConsoleLogs(args: BaseWavePulseArgs): WavePulseResponse<ConsoleLog[]> {
    return fetchResource(
        args,
        API_PATHS.CONSOLE_LOGS,
        (data) => `Retrieved ${data.length} console log(s)`
    );
}

/**
 * Clear all console logs for the specified channel
 */
export async function clearConsoleLogs(args: BaseWavePulseArgs): WavePulseResponse<{ success: boolean }> {
    return clearResource(args, API_PATHS.CONSOLE_LOGS, 'Console logs');
}

// ============================================================================
// EXPORTED TOOL FUNCTIONS - TIMELINE
// ============================================================================

/**
 * Get accumulated timeline events from the connected mobile app
 * Returns events like APP_STARTUP, VARIABLE_INVOKE, PAGE_READY, NETWORK_REQUEST
 */
export async function getTimeline(args: BaseWavePulseArgs): WavePulseResponse<TimelineEvent[]> {
    return fetchResource(
        args,
        API_PATHS.TIMELINE,
        (data) => `Retrieved ${data.length} timeline event(s)`
    );
}

/**
 * Clear all timeline events for the specified channel
 */
export async function clearTimeline(args: BaseWavePulseArgs): WavePulseResponse<{ success: boolean }> {
    return clearResource(args, API_PATHS.TIMELINE, 'Timeline events');
}

// ============================================================================
// EXPORTED TOOL FUNCTIONS - STORAGE
// ============================================================================

/**
 * Get all storage entries from the connected mobile app
 * Returns AsyncStorage/localStorage key-value pairs
 */
export async function getStorage(args: BaseWavePulseArgs): WavePulseResponse<StorageEntry[] | Record<string, any>> {
    return fetchResource(
        args,
        API_PATHS.STORAGE,
        (data) => {
            const count = Array.isArray(data) ? data.length : Object.keys(data).length;
            return `Retrieved ${count} storage entry/entries`;
        }
    );
}

// ============================================================================
// EXPORTED TOOL FUNCTIONS - INFO
// ============================================================================

/**
 * Get app and platform information from the connected mobile app
 * Returns app details (name, version, theme, locale) and platform details (os, device)
 */
export async function getInfo(args: BaseWavePulseArgs): WavePulseResponse<InfoResponse> {
    return fetchResource(
        args,
        API_PATHS.INFO,
        () => 'App and platform information retrieved successfully'
    );
}

// ============================================================================
// EXPORTED TOOL FUNCTIONS - WIDGET
// ============================================================================

/**
 * Get both properties and styles for a specific widget
 * Important: Use the "id" field from element tree response, not the "name" field
 */
export async function getWidget(args: WidgetArgs): WavePulseResponse<WidgetData> {
    return fetchWidgetResource(args, API_PATHS.WIDGET, 'data');
}

/**
 * Get only properties for a specific widget
 * Important: Use the "id" field from element tree response, not the "name" field
 */
export async function getWidgetProperties(args: WidgetArgs): WavePulseResponse<WidgetProperties> {
    return fetchWidgetResource(args, API_PATHS.WIDGET_PROPERTIES, 'properties');
}

/**
 * Get only styles for a specific widget
 * Important: Use the "id" field from element tree response, not the "name" field
 */
export async function getWidgetStyles(args: WidgetArgs): WavePulseResponse<WidgetStyles> {
    return fetchWidgetResource(args, API_PATHS.WIDGET_STYLES, 'styles');
}
