import { CodebaseTool } from '../shared/base-tool.js';
import { CodebaseToolResult, CodebasePaths } from '../types.js';

export class AnalyzeBindingFlowTool extends CodebaseTool {
  async execute(args: {
    runtimePath: string;
    codegenPath: string;
    componentName?: string;
  }): Promise<CodebaseToolResult> {
    const startTime = Date.now();
    
    try {
      const analysisData: any = {
        bindingFlow: [],
        watchers: [],
        variables: []
      };
      
      // Search for binding flow components
      const searches: Array<() => Promise<string[]>> = [
        () => this.grep('datavalue|caption|text', this.runtimePath + '/components', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('onChange|onBlur|setValue', this.runtimePath + '/variables', { filePattern: '*.{tsx,ts,jsx,js}' }),
        () => this.grep('watch\\(.*Variables', this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' })
      ];
      
      if (args.componentName) {
        searches.push(
          () => this.grep(args.componentName!, this.runtimePath, { filePattern: '*.{tsx,ts,jsx,js}' })
        );
      }
      
      const results = await Promise.all(searches.map(fn => fn()));
      const allFiles = this.deduplicate(results.flat());
      
      analysisData.bindingFlow = [
        { step: 1, description: 'Variable data change triggers notification' },
        { step: 2, description: 'Watchers detect change via digest cycle' },
        { step: 3, description: 'WmMemo re-renders with new value' },
        { step: 4, description: 'Widget receives updated prop' },
        { step: 5, description: 'User interaction triggers onChange' },
        { step: 6, description: 'Variable.setValue updates data' }
      ];
      
      analysisData.relatedFiles = allFiles.slice(0, 10);
      
      return {
        success: true,
        data: analysisData,
        meta: {
          domain: 'binding-flow-analysis',
          searchStrategy: 'flow-tracing',
          totalFound: allFiles.length,
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          domain: 'binding-flow-analysis',
          executionTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export async function handleAnalyzeBindingFlow(args: any): Promise<CodebaseToolResult> {
  const tool = new AnalyzeBindingFlowTool(args.runtimePath, args.codegenPath);
  return await tool.execute(args);
}

