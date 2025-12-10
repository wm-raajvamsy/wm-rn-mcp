# Comprehensive Widget Understanding Test Results

Test Date: 2025-12-10T08:25:20.644Z
Model: gpt-4o
System Prompt: WM_WIDGET_PROMPT.md
Total Questions: 25

════════════════════════════════════════════════════════════════════════════════

## Question 1: How many props does Accordion have?

**Widget:** Accordion
**Type:** count
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Accordion widget has a total of 6 properties.

────────────────────────────────────────────────────────────────────────────────

## Question 2: How many props does Text have?

**Widget:** Text
**Type:** count
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Text widget has a total of 28 properties. It has 7 of its own properties and inherits 21 properties from its parent, `BaseInputProps`.

────────────────────────────────────────────────────────────────────────────────

## Question 3: How many props does Form have?

**Widget:** Form
**Type:** count
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Form widget has a total of 22 properties.

────────────────────────────────────────────────────────────────────────────────

## Question 4: How many props does Label have?

**Widget:** Label
**Type:** count
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Label widget has a total of 18 properties.

────────────────────────────────────────────────────────────────────────────────

## Question 5: How many props does Checkbox have?

**Widget:** Checkbox
**Type:** count
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Checkbox widget has a total of 8 properties.

────────────────────────────────────────────────────────────────────────────────

## Question 6: What events does RadioSet widget support?

**Widget:** RadioSet
**Type:** events
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The RadioSet widget supports the following events:

1. **onFieldChange**: Triggered when a field change occurs.
2. **triggerValidation**: Triggered when validation is triggered.

These events allow you to handle changes in the RadioSet's state and manage validation processes.

────────────────────────────────────────────────────────────────────────────────

## Question 7: What events are available for Tab?

**Widget:** Tab
**Type:** events
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Tab widget, specifically the `WmTabs`, does not have any events associated with it.

────────────────────────────────────────────────────────────────────────────────

## Question 8: Does Picture widget have any events?

**Widget:** Picture
**Type:** events
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Picture widget does not have any events.

────────────────────────────────────────────────────────────────────────────────

## Question 9: List all events for Checkbox widget

**Widget:** Checkbox
**Type:** events
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Checkbox widget supports the following event:

- **onFieldChange**: This event is triggered when a field change occurs.

────────────────────────────────────────────────────────────────────────────────

## Question 10: How do I style the Button widget?

**Widget:** Button
**Type:** styling
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Button widget can be styled using a variety of CSS classes. Here's how you can style it:

### Default Class
- **Default class**: `app-button`

### Styleable Parts
The Button widget is divided into several parts that can be individually styled:
- **root**
- **content**
- **text**
- **badge**
- **icon**
- **skeleton**

### Available CSS Classes
You can use the following CSS classes to style the Button widget:
- `app-button`
- `btn-default`
- `btn-info`
- `btn-primary`
- `btn-secondary`
- `btn-danger`
- `btn-success`
- `btn-warning`
- `btn-link`
- `btn-only-label`
- `btn-dark`
- `btn-light`
- `fab-btn`
- `mini-fab-btn`
- `app-button-disabled`
- `app-button-text`
- `app-button-content`
- `app-button-badge`
- `app-button-icon`
- `app-button-skeleton`

### Class to Part Mapping
Each class affects a specific part of the Button widget:
- `app-button` affects the **root** part.
- `app-button-text` affects the **text** part.
- `app-button-content` affects the **content** part.
- `app-button-badge` affects the **badge** part.
- `app-button-icon` affects the **icon** part.
- `app-button-skeleton` affects the **skeleton** part.

### Example Usage
To style the text part of the Button, you can use the `app-button-text` class. For example:
```css
.app-button-text {
  font-size: 16px;
  color: #ffffff;
}
```

By using these classes, you can customize the appearance of the Button widget to fit your application's design requirements.

────────────────────────────────────────────────────────────────────────────────

## Question 11: What CSS classes are available for Text widget?

**Widget:** Text
**Type:** styling
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Text widget can be styled using the following CSS classes:

- **Default class**: `app-text`
- **Available CSS classes**:
  - `app-text`
  - `form-text-input-horizontal`
  - `form-password-input-horizontal`
  - `app-input`
  - `app-text-disabled`
  - `app-text-rtl`
  - `app-text-with-label`
  - `app-text-text`
  - `app-text-invalid`
  - `app-text-focused`
  - `app-text-flotaing-label`
  - `app-text-active-flotaing-label`
  - `app-text-skeleton`
  - `app-baseinput`

These classes can be used to style different parts of the Text widget, such as the root, text, invalid state, focused state, placeholder text, floating label, active floating label, and skeleton.

────────────────────────────────────────────────────────────────────────────────

## Question 12: How do I change the text color in Button?

**Widget:** Button
**Type:** styling-specific
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
To change the text color in the Button widget, you can use the CSS class `app-button-text`, which specifically targets the text part of the button. Here's how you can style it:

1. **Default Class**: The Button widget has a default class `app-button`.
2. **Styleable Parts**: The widget can be styled in parts, including `root`, `content`, `text`, `badge`, `icon`, and `skeleton`.
3. **Available CSS Classes**: You have a variety of classes available, such as `app-button`, `btn-default`, `btn-info`, `btn-primary`, `btn-secondary`, `btn-danger`, `btn-success`, `btn-warning`, `btn-link`, `btn-only-label`, `btn-dark`, `btn-light`, `fab-btn`, `mini-fab-btn`, `app-button-disabled`, `app-button-text`, `app-button-content`, `app-button-badge`, `app-button-icon`, and `app-button-skeleton`.

To specifically change the text color, you should apply styles to the `app-button-text` class. This class affects the `text` part of the button. You can add custom styles in your stylesheet like this:

```css
.app-button-text {
    color: #yourColorCode; /* Replace with your desired color */
}
```

This will change the text color of the Button widget to the color you specify.

────────────────────────────────────────────────────────────────────────────────

## Question 13: Which style part does app-button-badge affect?

**Widget:** Button
**Type:** styling-mapping
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The `app-button-badge` class affects the `badge` part of the Button widget.

────────────────────────────────────────────────────────────────────────────────

## Question 14: Does Text widget inherit props from a parent class?

**Widget:** Text
**Type:** inheritance
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Text widget, specifically the `WmText` component, does inherit properties from a parent class. It extends from `BaseInputProps`, which itself inherits from `BaseProps`. This inheritance chain provides the Text widget with a total of 28 properties, out of which 21 are inherited from its parent classes.

────────────────────────────────────────────────────────────────────────────────

## Question 15: What is the parent class of Text widget?

**Widget:** Text
**Type:** inheritance
**Tools Called:** analyze_component_hierarchy

**Answer:**
The parent class of the Text widget is `BaseComponent`.

────────────────────────────────────────────────────────────────────────────────

## Question 16: How many inherited props does Text have?

**Widget:** Text
**Type:** inheritance-count
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The `WmText` widget inherits 21 properties from its parent classes.

────────────────────────────────────────────────────────────────────────────────

## Question 17: Which has more props, Button or Text?

**Widget:** Multiple
**Type:** comparison
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The WmText widget has more properties than the WmButton widget. Here's the breakdown:

- **WmButton**: 
  - Total Properties: 18
  - Own Properties: 18
  - Inherited Properties: 0

- **WmText**:
  - Total Properties: 28
  - Own Properties: 7
  - Inherited Properties: 21

The WmText widget inherits a significant number of properties from its parent class, which contributes to its higher total property count.

────────────────────────────────────────────────────────────────────────────────

## Question 18: Compare the number of events between Button and Picture

**Widget:** Multiple
**Type:** comparison
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The comparison of events between the Button and Picture widgets is as follows:

- **Button Widget**: Supports 1 event, specifically the `onTap` event, which is triggered when a tap occurs on the button.
- **Picture Widget**: Does not support any events.

Therefore, the Button widget has more events compared to the Picture widget.

────────────────────────────────────────────────────────────────────────────────

## Question 19: What are the required props for Text widget?

**Widget:** Text
**Type:** required-props
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Text widget, known as `WmText`, does not have any required properties. All of its properties are optional. Here is a list of the properties it supports, along with their default values:

1. **floatinglabel**: `any` (default: `void 0`)
2. **placeholder**: `string` (default: `'Enter text'`)
3. **skeletonheight**: `any` (default: `null`)
4. **skeletonwidth**: `any` (default: `null`)
5. **autocapitalize**: `string` (default: `'none'`)
6. **returnkeytype**: `string` (default: `'auto'`)
7. **onSubmitEditing**: `function` (default: `() => {}`)

Additionally, it inherits several properties from `BaseInputProps`, such as:

- **autofocus**: `any` (default: `null`)
- **autocomplete**: `string` (default: `"username"`)
- **autotrim**: `boolean` (default: `true`)
- **datavalue**: `any` (default: `void 0`)
- **hastwowaybinding**: `boolean` (default: `false`)
- **maxchars**: `any` (default: `null`)
- **readonly**: `any` (default: `null`)
- **regexp**: `any` (default: `null`)
- **type**: `string` (default: `'text'`)
- **updateon**: `string` (default: `'blur'`)
- **required**: `boolean` (default: `false`)
- **checkFormField**: `any` (default: `void 0`)
- **onFieldChange**: `any` (default: `void 0`)
- **triggerValidation**: `any` (default: `void 0`)
- **accessibilitylabel**: `any` (default: `undefined`)
- **hint**: `any` (default: `undefined`)
- **accessibilityrole**: `any` (default: `void 0`)
- **accessibilitylabelledby**: `any` (default: `undefined`)
- **maskchar**: `any` (default: `null`)
- **displayformat**: `any` (default: `null`)
- **skipscripteventtrigger**: `boolean` (default: `false`)

These properties provide a wide range of customization options for the Text widget.

────────────────────────────────────────────────────────────────────────────────

## Question 20: What is the default value of iconposition prop in Button?

**Widget:** Button
**Type:** prop-details
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The default value of the `iconposition` prop in the Button widget is `'left'`.

────────────────────────────────────────────────────────────────────────────────

## Question 21: How many props does Container widget have?

**Widget:** Container
**Type:** count
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Container widget has a total of 65 properties. It has 12 of its own properties and inherits 53 properties from its parent classes.

────────────────────────────────────────────────────────────────────────────────

## Question 22: What events does Switch widget support?

**Widget:** Switch
**Type:** events
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Switch widget supports the following events:

1. **onFieldChange**: Triggered when a field change occurs.
2. **triggerValidation**: Triggered when validation is triggered.

These events allow you to handle changes and validation logic for the Switch widget effectively.

────────────────────────────────────────────────────────────────────────────────

## Question 23: Does Label widget extend any parent class?

**Widget:** Label
**Type:** inheritance
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Label widget, specifically `WmLabel`, extends from the `BaseProps` class. This means it inherits properties and behaviors defined in `BaseProps`, although in this case, it does not inherit any additional properties beyond its own 18 properties.

────────────────────────────────────────────────────────────────────────────────

## Question 24: What style classes are available for Picture?

**Widget:** Picture
**Type:** styling
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The `WmPicture` widget can be styled using the following CSS classes:

- **Default class**: `app-picture`
- **Available CSS classes**:
  - `app-picture`
  - `rounded-image`
  - `thumbnail-image`
  - `app-picture-skeleton`

### Styleable Parts
The widget has the following styleable parts:
- `root`
- `text`
- `picture`
- `skeleton`

### Class to Part Mapping
- `app-picture` affects the `root` part.
- `app-picture-skeleton` affects the `skeleton` part.

These classes allow you to customize the appearance of the `WmPicture` widget by targeting specific parts of the widget.

────────────────────────────────────────────────────────────────────────────────

## Question 25: List all props that start with 'icon' in Button widget

**Widget:** Button
**Type:** prop-filter
**Tools Called:** search_widget_by_name, read_widget_structure

**Answer:**
The Button widget has several properties that start with 'icon'. Here they are:

1. **iconclass**: Type: any, Default: null
2. **iconposition**: Type: string, Default: 'left'
3. **iconsize**: Type: number, Default: 0
4. **iconurl**: Type: any, Default: null
5. **iconheight**: Type: any, Default: null
6. **iconwidth**: Type: any, Default: null
7. **iconmargin**: Type: any, Default: null

These properties allow you to customize the icon's appearance and positioning within the Button widget.

────────────────────────────────────────────────────────────────────────────────
