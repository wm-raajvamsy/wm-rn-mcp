/**
 * Validation Rules for WaveMaker UI Markup (Container-based)
 * 
 * Defines all validation criteria for generated markup using wm-container
 */

export const VALIDATION_RULES = {
  structure: {
    hasRootStructure: {
      description: 'Must have wm-page → wm-content → wm-page-content structure',
      severity: 'critical',
      check: (doc) => {
        const page = doc.querySelector('wm-page');
        if (!page) return { pass: false, message: 'Missing wm-page root element' };
        
        const content = page.querySelector('wm-content');
        if (!content) return { pass: false, message: 'Missing wm-content inside wm-page' };
        
        const pageContent = content.querySelector('wm-page-content');
        if (!pageContent) return { pass: false, message: 'Missing wm-page-content inside wm-content' };
        
        return { pass: true };
      }
    },
    
    screenContainerComplete: {
      description: 'Screen root container must have width="fill" and height="fill"',
      severity: 'critical',
      check: (doc) => {
        const pageContent = doc.querySelector('wm-page-content');
        if (!pageContent) return { pass: false, message: 'No wm-page-content found' };
        
        const screenContainer = pageContent.querySelector('wm-container');
        if (!screenContainer) return { pass: false, message: 'No screen container found' };
        
        const width = screenContainer.getAttribute('width');
        const height = screenContainer.getAttribute('height');
        
        if (width !== 'fill') return { pass: false, message: `Screen container width is "${width}", expected "fill"` };
        if (height !== 'fill') return { pass: false, message: `Screen container height is "${height}", expected "fill"` };
        
        return { pass: true };
      }
    }
  },
  
  mandatoryAttributes: {
    containersHaveLayout: {
      description: 'All wm-container must have direction, gap, and alignment',
      severity: 'critical',
      check: (doc) => {
        const containers = doc.querySelectorAll('wm-container');
        const issues = [];
        
        containers.forEach((container, idx) => {
          const name = container.getAttribute('name') || `container-${idx}`;
          const direction = container.getAttribute('direction');
          const gap = container.getAttribute('gap');
          const alignment = container.getAttribute('alignment');
          
          if (!direction) issues.push(`${name}: missing direction`);
          if (gap === null || gap === undefined) issues.push(`${name}: missing gap`);
          if (!alignment) issues.push(`${name}: missing alignment`);
          
          // Validate direction values
          if (direction && !['row', 'column'].includes(direction)) {
            issues.push(`${name}: invalid direction="${direction}" (must be "row" or "column")`);
          }
          
          // Validate alignment values
          const validFixedAlignments = [
            'top-left', 'top-center', 'top-right',
            'middle-left', 'middle-center', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
          ];
          const validAutoAlignments = ['start', 'center', 'end'];
          const allValidAlignments = [...validFixedAlignments, ...validAutoAlignments];
          
          if (alignment && !allValidAlignments.includes(alignment)) {
            issues.push(`${name}: invalid alignment="${alignment}"`);
          }
          
          // Validate gap values
          if (gap !== null && gap !== undefined && gap !== 'auto') {
            const gapNum = Number(gap);
            if (isNaN(gapNum)) {
              issues.push(`${name}: invalid gap="${gap}" (must be number or "auto")`);
            }
          }
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    containersShouldHaveSizing: {
      description: 'All wm-container should have width and height for better layout control',
      severity: 'info',
      check: (doc) => {
        const containers = doc.querySelectorAll('wm-container');
        const issues = [];
        
        containers.forEach((container, idx) => {
          const name = container.getAttribute('name') || `container-${idx}`;
          const width = container.getAttribute('width');
          const height = container.getAttribute('height');
          
          if (!width) issues.push(`${name}: missing width (consider "fill", "hug", or specific value)`);
          if (!height) issues.push(`${name}: missing height (consider "fill" or "hug")`);
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    allHaveNameAndClass: {
      description: 'All WaveMaker elements must have name and class attributes',
      severity: 'critical',
      check: (doc) => {
        const wmElements = doc.querySelectorAll('[class^="wm-"], wm-page, wm-content, wm-page-content, wm-container, wm-button, wm-label, wm-text, wm-icon, wm-picture, wm-list, wm-listtemplate, wm-form, wm-form-field');
        const issues = [];
        
        wmElements.forEach((el) => {
          const tagName = el.tagName.toLowerCase();
          const name = el.getAttribute('name');
          const className = el.getAttribute('class');
          
          if (!name) issues.push(`${tagName}: missing name attribute`);
          if (!className) issues.push(`${tagName}[name="${name || '?'}"]: missing class attribute`);
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    classEqualsName: {
      description: 'class attribute must equal name attribute',
      severity: 'warning',
      check: (doc) => {
        const wmElements = doc.querySelectorAll('[name][class]');
        const issues = [];
        
        wmElements.forEach((el) => {
          const name = el.getAttribute('name');
          const className = el.getAttribute('class');
          
          if (name && className && name !== className) {
            issues.push(`${el.tagName.toLowerCase()}[name="${name}"]: class="${className}" (should be "${name}")`);
          }
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    uniqueClasses: {
      description: 'All class values must be unique',
      severity: 'warning',
      check: (doc) => {
        const wmElements = doc.querySelectorAll('[class]');
        const classMap = new Map();
        
        wmElements.forEach((el) => {
          const className = el.getAttribute('class');
          if (className) {
            if (!classMap.has(className)) {
              classMap.set(className, []);
            }
            classMap.set(className, [...classMap.get(className), el.tagName.toLowerCase()]);
          }
        });
        
        const duplicates = Array.from(classMap.entries())
          .filter(([_, elements]) => elements.length > 1)
          .map(([className, elements]) => `"${className}" used ${elements.length} times`);
        
        return duplicates.length === 0 
          ? { pass: true } 
          : { pass: false, message: duplicates.join('; ') };
      }
    }
  },
  
  widgetUsage: {
    formsUseFormField: {
      description: 'Forms must use wm-form-field, not standalone inputs',
      severity: 'critical',
      check: (doc) => {
        const forms = doc.querySelectorAll('wm-form');
        const issues = [];
        
        forms.forEach((form) => {
          const name = form.getAttribute('name') || 'unnamed-form';
          const standaloneInputs = form.querySelectorAll('wm-text, wm-textarea, wm-number, wm-select, wm-checkbox, wm-switch, wm-toggle, wm-radioset');
          
          if (standaloneInputs.length > 0) {
            issues.push(`${name}: contains ${standaloneInputs.length} standalone input(s) (use wm-form-field instead)`);
          }
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    formTitleEmpty: {
      description: 'wm-form title attribute must be empty',
      severity: 'warning',
      check: (doc) => {
        const forms = doc.querySelectorAll('wm-form[title]');
        const issues = [];
        
        forms.forEach((form) => {
          const name = form.getAttribute('name') || 'unnamed-form';
          const title = form.getAttribute('title');
          
          if (title && title !== '') {
            issues.push(`${name}: title="${title}" (should be empty)`);
          }
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    iconsNoCaption: {
      description: 'Icons with iconclass should have caption=""',
      severity: 'warning',
      check: (doc) => {
        const icons = doc.querySelectorAll('wm-icon[iconclass], wm-button[iconclass]');
        const issues = [];
        
        icons.forEach((icon) => {
          const name = icon.getAttribute('name') || 'unnamed';
          const caption = icon.getAttribute('caption');
          const iconclass = icon.getAttribute('iconclass');
          
          if (iconclass && caption && caption !== '') {
            issues.push(`${name}: has iconclass="${iconclass}" but caption="${caption}" (should be empty)`);
          }
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    
    imagesHaveDimensions: {
      description: 'Images must have width and height',
      severity: 'warning',
      check: (doc) => {
        const pictures = doc.querySelectorAll('wm-picture');
        const issues = [];
        
        pictures.forEach((picture) => {
          const name = picture.getAttribute('name') || 'unnamed-picture';
          const width = picture.getAttribute('width');
          const height = picture.getAttribute('height');
          
          if (!width) issues.push(`${name}: missing width`);
          if (!height) issues.push(`${name}: missing height`);
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    }
  },
  
  noInlineStyles: {
    noStyleAttribute: {
      description: 'No style="" attribute allowed (use CSS classes instead)',
      severity: 'critical',
      check: (doc) => {
        const elements = doc.querySelectorAll('[style]');
        const issues = [];
        
        elements.forEach((el) => {
          const name = el.getAttribute('name') || el.tagName.toLowerCase();
          const style = el.getAttribute('style');
          issues.push(`${name}: has style="${style}"`);
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    noColorAttrs: {
      description: 'No inline color/backgroundcolor attributes',
      severity: 'critical',
      check: (doc) => {
        const elements = doc.querySelectorAll('[color], [backgroundcolor]');
        const issues = [];
        
        elements.forEach((el) => {
          const name = el.getAttribute('name') || el.tagName.toLowerCase();
          if (el.hasAttribute('color')) issues.push(`${name}: has color attribute`);
          if (el.hasAttribute('backgroundcolor')) issues.push(`${name}: has backgroundcolor attribute`);
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    noPaddingMargin: {
      description: 'No inline padding/margin attributes',
      severity: 'critical',
      check: (doc) => {
        const elements = doc.querySelectorAll('[padding], [margin]');
        const issues = [];
        
        elements.forEach((el) => {
          const name = el.getAttribute('name') || el.tagName.toLowerCase();
          if (el.hasAttribute('padding')) issues.push(`${name}: has padding attribute`);
          if (el.hasAttribute('margin')) issues.push(`${name}: has margin attribute`);
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    },
    
    noFontAttrs: {
      description: 'No inline font attributes (fontsize, fontweight, etc.)',
      severity: 'critical',
      check: (doc) => {
        const elements = doc.querySelectorAll('[fontsize], [fontweight], [fontfamily]');
        const issues = [];
        
        elements.forEach((el) => {
          const name = el.getAttribute('name') || el.tagName.toLowerCase();
          if (el.hasAttribute('fontsize')) issues.push(`${name}: has fontsize attribute`);
          if (el.hasAttribute('fontweight')) issues.push(`${name}: has fontweight attribute`);
          if (el.hasAttribute('fontfamily')) issues.push(`${name}: has fontfamily attribute`);
        });
        
        return issues.length === 0 
          ? { pass: true } 
          : { pass: false, message: issues.join('; ') };
      }
    }
  }
};

export const SEVERITY_LEVELS = {
  critical: 3,
  warning: 2,
  info: 1
};
