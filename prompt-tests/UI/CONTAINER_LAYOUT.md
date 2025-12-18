# WaveMaker Container Auto-Layout Guide

## Overview

This guide covers WaveMaker's container-based auto-layout system. Containers use 7 mandatory attributes to control layout behavior: `name`, `class`, `direction`, `gap`, `alignment`, `width`, and `height`.

---

## CRITICAL: Container vs Widget Properties

### Container-Only Properties vs Widget Properties

🚨 **CRITICAL DISTINCTION:**

**1. Absolutely Container-Only (NEVER on widgets):**
- `direction="row|column"` - **Container-only**
- `gap="N|auto"` - **Container-only**
- `alignment="..."` - **Container-only**

**2. Available on ALL widgets, but VALUE RESTRICTIONS:**

| Property | Container Values | Widget Values | 
|----------|-----------------|---------------|
| `width` | ✅ `"fill"`, `"hug"`, `"Npx"`, `"N%"` | ✅ `"Npx"`, `"N%"` ❌ NOT `"fill"` or `"hug"` |
| `height` | ✅ `"fill"`, `"hug"`, `"Npx"`, `"N%"` | ✅ `"Npx"`, `"N%"` ❌ NOT `"fill"` or `"hug"` |

**Examples:**

✅ **CORRECT:**
```xml
<!-- Containers can use fill/hug -->
<wm-container width="fill" height="hug" direction="row" gap="8" alignment="center">
  <!-- Widgets can use px or % -->
  <wm-picture width="80px" height="80px" picturesource="..." class="avatar" />
  <wm-label width="200px" caption="Name" class="text-base" />
  <wm-button width="120px" height="44px" caption="Edit" class="btn-primary" />
</wm-container>
```

❌ **WRONG:**
```xml
<!-- NEVER use fill/hug on widgets -->
<wm-label width="fill" caption="Text" />  <!-- ❌ fill doesn't work on labels -->
<wm-button width="hug" caption="Click" />  <!-- ❌ hug doesn't work on buttons -->
<wm-picture width="fill" height="fill" />  <!-- ❌ fill/hug don't work on pictures -->
```

---

## Container Auto-Layout Rules

### Rule 1: 7 Mandatory Attributes (NO EXCEPTIONS)

**Every `wm-container` MUST have ALL 7 attributes:**

```xml
<wm-container 
  name="unique_name"
  class="css-class"
  direction="row|column"
  gap="N|auto"
  alignment="..."
  width="fill|hug|Npx"
  height="fill|hug|Npx"
>
```

**Attribute Details:**

| Attribute | Values | Purpose | Never Skip |
|-----------|--------|---------|------------|
| `name` | Unique identifier | Element identification | ✅ Required |
| `class` | CSS class string | Styling | ✅ Required (use `""` if none) |
| `direction` | `row` or `column` | Layout axis | ✅ Required |
| `gap` | `auto` or numeric (`8`, `16`) | Spacing between children | ✅ Required |
| `alignment` | Direction-specific | Cross-axis alignment | ✅ Required |
| `width` | `fill`, `hug`, or `Npx` | Container width | ✅ Required |
| `height` | `fill`, `hug`, or `Npx` | Container height | ✅ Required |

### Rule 2: Screen Root Properties

```xml
<wm-container 
  name="screen_root" 
  class="h-full w-full" 
  direction="column" 
  gap="16" 
  alignment="top-center" 
  width="fill" 
  height="fill"
>
```

🚨 **NON-NEGOTIABLE:** Screen root MUST have:
- `width="fill" height="fill"` (full screen)
- Common alignment values: `"top-center"` for centered content, `"top-left"` for left-aligned


### Rule 3: Alignment Values

**For `direction="row"` (horizontal):**
- `alignment="start"` - Left-aligned vertically
- `alignment="center"` - Center-aligned vertically
- `alignment="end"` - Right-aligned vertically
- `alignment="middle-left"` - Vertically centered, horizontally left
- `alignment="middle-center"` - Vertically and horizontally centered
- `alignment="middle-right"` - Vertically centered, horizontally right

**For `direction="column"` (vertical):**
- `alignment="top-left"` - Horizontally left-aligned
- `alignment="top-center"` - Horizontally center-aligned
- `alignment="top-right"` - Horizontally right-aligned

### Rule 4: Gap Values

**`gap="auto"`:**
- Use for flexible spacing (items pushed to edges)
- Common in: button rows, navigation bars, headers
- Usually paired with `width="fill"`

**`gap="N"` (numeric):**
- Use for fixed spacing (e.g., `gap="8"`, `gap="16"`)
- Common in: lists, stacked content, detail columns
- Usually paired with consistent spacing

### Rule 5: Width/Height Values

| Value | Behavior | Use Case |
|-------|----------|----------|
| `fill` | Expands to fill parent | Full-width sections, screen root |
| `hug` | Wraps content | Icon columns, nested details, cards |
| `Npx` | Fixed size | Specific dimensions (rare for containers) |

**Common Patterns:**
- `width="fill" height="hug"` - Full-width section (most rows)
- `width="hug" height="hug"` - Compact group (nav tabs, icon columns)
- `width="fill" height="fill"` - Screen root only

---

## Container Patterns (Generic Templates)

### Pattern 1: Full-Width Row (Edge-to-Edge)

**Use for:** Headers, button rows, navigation bars, toolbars, status bars

```xml
<wm-container name="row_container" class="w-full" direction="row" gap="auto" alignment="center" width="fill" height="hug">
  <!-- Children pushed to edges -->
</wm-container>
```

**Visual Layouts:**

```
gap="auto" with 2 children:
┌────────────────────────────────────────┐
│ [Logo] ──────────────────── [Menu] │
└────────────────────────────────────────┘

gap="auto" with 3 children:
┌────────────────────────────────────────┐
│ [Back] ────── [Title] ────── [Save] │
└────────────────────────────────────────┘

gap="auto" with 4+ children:
┌────────────────────────────────────────┐
│ [A] ── [B] ── [C] ─────────── [D] │
└────────────────────────────────────────┘
```

**Common UI/UX Scenarios:**

1. **App Header Bar**
   ```xml
   <wm-container name="header" class="header" direction="row" gap="auto" alignment="center" width="fill" height="hug">
     <wm-picture name="logo" class="logo" />
     <wm-button name="menu_btn" caption="Menu" />
   </wm-container>
   ```
   ```
   ┌────────────────────────────┐
   │ 🏢 Logo ────────── ☰ Menu │
   └────────────────────────────┘
   ```

2. **Modal Header**
   ```xml
   <wm-container name="modal_header" class="modal-header" direction="row" gap="auto" alignment="center" width="fill" height="hug">
     <wm-button name="close_btn" caption="×" />
     <wm-label name="modal_title" caption="Settings" />
     <wm-button name="save_btn" caption="Save" />
   </wm-container>
   ```
   ```
   ┌────────────────────────────┐
   │ [×] ── Settings ── [Save] │
   └────────────────────────────┘
   ```

3. **Action Bar (2 buttons at opposite ends)**
   ```xml
   <wm-container name="actions" class="actions" direction="row" gap="auto" alignment="center" width="fill" height="hug">
     <wm-button name="cancel_btn" caption="Cancel" />
     <wm-button name="confirm_btn" caption="Confirm" />
   </wm-container>
   ```
   ```
   ┌────────────────────────────┐
   │ [Cancel] ────── [Confirm] │
   └────────────────────────────┘
   ```

4. **Status Bar with Multiple Indicators**
   ```xml
   <wm-container name="status_bar" class="status" direction="row" gap="auto" alignment="center" width="fill" height="hug">
     <wm-icon name="wifi_icon" iconclass="fa fa-wifi" />
     <wm-icon name="battery_icon" iconclass="fa fa-battery-full" />
     <wm-icon name="signal_icon" iconclass="fa fa-signal" />
   </wm-container>
   ```
   ```
   ┌────────────────────────────┐
   │ 📶 ─────── 🔋 ─────── 📡 │
   └────────────────────────────┘
   ```

5. **Toolbar with Left/Right Groups**
   ```xml
   <wm-container name="toolbar" class="toolbar" direction="row" gap="auto" alignment="center" width="fill" height="hug">
     <wm-button name="back_btn" caption="← Back" />
     <wm-container name="right_actions" class="actions" direction="row" gap="8" alignment="center" width="hug" height="hug">
       <wm-button name="share_btn" caption="Share" />
       <wm-button name="delete_btn" caption="Delete" />
     </wm-container>
   </wm-container>
   ```
   ```
   ┌─────────────────────────────────────┐
   │ [← Back] ──── [Share] [Delete] │
   └─────────────────────────────────────┘
   ```

### Pattern 2: Compact Content Group

**Use for:** Clustered buttons, centered content, dialog boxes, empty states, onboarding screens

```xml
<wm-container name="group_container" class="centered" direction="column" gap="8" alignment="top-center" width="hug" height="hug">
  <!-- Children wrapped tightly -->
</wm-container>
```

**Visual Layouts:**

```
Column with gap="8" (tight spacing):
┌──────────┐
│  [Item]  │
│          │  ← gap: 8px
│  [Item]  │
│          │  ← gap: 8px
│  [Item]  │
└──────────┘

Column with gap="16" (comfortable spacing):
┌──────────┐
│  [Item]  │
│          │  ← gap: 16px
│  [Item]  │
│          │  ← gap: 16px
│  [Item]  │
└──────────┘
```

**Common UI/UX Scenarios:**

1. **Empty State**
   ```xml
   <wm-container name="empty_state" class="empty-state" direction="column" gap="12" alignment="top-center" width="hug" height="hug">
     <wm-picture name="empty_icon" class="icon-lg" />
     <wm-label name="empty_title" caption="No Items Found" class="text-lg font-bold" />
     <wm-label name="empty_subtitle" caption="Try adding your first item" class="text-sm text-gray-500" />
     <wm-button name="add_btn" caption="Add Item" class="btn-primary" />
   </wm-container>
   ```
   ```
   ┌─────────────────────┐
   │        📦           │
   │                     │
   │   No Items Found    │
   │                     │
   │ Try adding your     │
   │    first item       │
   │                     │
   │    [Add Item]       │
   └─────────────────────┘
   ```

2. **Confirmation Dialog with Action Buttons**
   ```xml
   <wm-container name="confirm_dialog" class="dialog" direction="column" gap="16" alignment="top-center" width="hug" height="hug">
     <wm-label name="dialog_title" caption="Delete Item?" class="text-xl font-bold" />
     <wm-label name="dialog_message" caption="This action cannot be undone" class="text-sm" />
     <wm-button name="cancel_btn" caption="Cancel" class="btn-secondary" />
     <wm-button name="delete_btn" caption="Delete" class="btn-danger" />
   </wm-container>
   ```
   ```
   ┌─────────────────────┐
   │   Delete Item?      │
   │                     │
   │ This action cannot  │
   │    be undone        │
   │                     │
   │    [Cancel]         │
   │    [Delete]         │
   └─────────────────────┘
   ```

3. **Stacked Buttons (Menu Options)**
   ```xml
   <wm-container name="button_group" class="button-stack" direction="column" gap="8" alignment="top-center" width="hug" height="hug">
     <wm-button name="option1_btn" caption="Option 1" class="btn-primary" />
     <wm-button name="option2_btn" caption="Option 2" class="btn-secondary" />
     <wm-button name="option3_btn" caption="Option 3" class="btn-outline" />
   </wm-container>
   ```
   ```
   ┌─────────────────┐
   │   [Option 1]    │
   │   [Option 2]    │
   │   [Option 3]    │
   └─────────────────┘
   ```

### Pattern 3: Icon + Label Column

**Use for:** Navigation tabs, action buttons with icon and text stacked, feature lists, statistics cards

```xml
<wm-container name="tab_container" class="nav-tab" direction="column" gap="4" alignment="top-center" width="hug" height="hug">
  <wm-picture name="icon" class="icon" picturesource="assets/icon.png" />
  <wm-label name="label" class="text-xs" caption="Label" />
</wm-container>
```

**Rule:** Icon+Label columns ALWAYS use `width="hug" height="hug"`

**Visual Layouts:**

```
Single icon+label:
┌────┐
│ 🏠 │
│Home│
└────┘

Row of icon+label tabs (gap="auto" between them):
┌────┐     ┌────┐     ┌────┐     ┌────┐
│ 🏠 │     │ 🔍 │     │ ❤️ │     │ 👤 │
│Home│     │Find│     │Fav │     │ Me │
└────┘     └────┘     └────┘     └────┘
```

**Common UI/UX Scenarios:**

1. **Bottom Navigation Bar (Horizontal Layout)**
   ```xml
   <wm-container name="bottom_nav" class="nav-bar" direction="row" gap="auto" alignment="center" width="fill" height="hug">
     <wm-container name="home_tab" class="nav-tab" direction="column" gap="4" alignment="top-center" width="hug" height="hug">
       <wm-icon name="home_icon" iconclass="fa fa-home" class="icon" />
       <wm-label name="home_label" caption="Home" class="text-xs" />
     </wm-container>
     <wm-container name="search_tab" class="nav-tab" direction="column" gap="4" alignment="top-center" width="hug" height="hug">
       <wm-icon name="search_icon" iconclass="fa fa-search" class="icon" />
       <wm-label name="search_label" caption="Search" class="text-xs" />
     </wm-container>
     <wm-container name="favorites_tab" class="nav-tab" direction="column" gap="4" alignment="top-center" width="hug" height="hug">
       <wm-icon name="fav_icon" iconclass="fa fa-heart" class="icon" />
       <wm-label name="fav_label" caption="Favorites" class="text-xs" />
     </wm-container>
   </wm-container>
   ```
   ```
   ┌────────────────────────────────────────┐
   │  🏠     🔍      ❤️                    │
   │ Home  Search  Favs                    │
   └────────────────────────────────────────┘
   ```

2. **Statistics Dashboard (Value + Label)**
   ```xml
   <wm-container name="stats" class="stats" direction="row" gap="24" alignment="center" width="fill" height="hug">
     <wm-container name="stat1" class="stat" direction="column" gap="4" alignment="top-center" width="hug" height="hug">
       <wm-label name="stat1_value" caption="1,234" class="text-2xl font-bold" />
       <wm-label name="stat1_label" caption="Sales" class="text-sm text-gray-500" />
     </wm-container>
     <wm-container name="stat2" class="stat" direction="column" gap="4" alignment="top-center" width="hug" height="hug">
       <wm-label name="stat2_value" caption="567" class="text-2xl font-bold" />
       <wm-label name="stat2_label" caption="Customers" class="text-sm text-gray-500" />
     </wm-container>
   </wm-container>
   ```
   ```
   ┌─────────────────────────────────────┐
   │  1,234      567                     │
   │  Sales    Customers                 │
   └─────────────────────────────────────┘
   ```

### Pattern 4: List Item Row

**Use for:** Product lists, transaction rows, list items with image + details + actions, chat messages, notifications

```xml
<wm-container name="list_item" class="item" direction="row" gap="12" alignment="top-left" width="fill" height="hug">
  <wm-picture name="item_image" class="thumbnail" picturesource="assets/image.png" />
  
  <wm-container name="details" class="details" direction="column" gap="4" alignment="top-left" width="hug" height="hug">
    <wm-label name="title" class="font-bold" caption="Title" />
    <wm-label name="subtitle" class="text-sm text-gray-500" caption="Subtitle" />
  </wm-container>
  
  <wm-button name="action1" class="btn-sm" caption="Action" />
</wm-container>
```

**Visual Layouts:**

```
Basic list item (Image + Details):
┌────────────────────────────────────────┐
│ [IMG]  Title                           │
│        Subtitle                        │
└────────────────────────────────────────┘

With action on right (gap="12" keeps spacing):
┌────────────────────────────────────────┐
│ [IMG]  Title               [Action]    │
│        Subtitle                        │
└────────────────────────────────────────┘

With price/badge on right:
┌────────────────────────────────────────┐
│ [IMG]  Product Name            $99.99  │
│        Description             ⭐⭐⭐  │
└────────────────────────────────────────┘

Complex with multiple sections:
┌────────────────────────────────────────┐
│ [IMG]  Title           Status  [Edit]  │
│        Subtitle        Badge   [Del]   │
└────────────────────────────────────────┘
```

**Common UI/UX Scenarios:**

1. **E-commerce Product List**
   ```xml
   <wm-container name="product_item" class="product" direction="row" gap="12" alignment="top-left" width="fill" height="hug">
     <wm-picture name="product_img" class="thumbnail" width="80px" height="80px" />
     
     <wm-container name="product_details" class="details" direction="column" gap="4" alignment="top-left" width="hug" height="hug">
       <wm-label name="product_name" caption="Wireless Headphones" class="font-bold" />
       <wm-label name="product_desc" caption="Noise cancelling" class="text-sm text-gray-500" />
       <wm-label name="product_rating" caption="⭐⭐⭐⭐⭐ (4.5)" class="text-xs" />
     </wm-container>
     
     <wm-container name="product_right" class="right-section" direction="column" gap="8" alignment="top-right" width="hug" height="hug">
       <wm-label name="product_price" caption="$149.99" class="text-lg font-bold" />
       <wm-button name="add_cart_btn" caption="Add to Cart" class="btn-primary btn-sm" />
     </wm-container>
   </wm-container>
   ```
   ```
   ┌──────────────────────────────────────────────┐
   │ [📷]  Wireless Headphones       $149.99     │
   │       Noise cancelling         [Add Cart]   │
   │       ⭐⭐⭐⭐⭐ (4.5)                       │
   └──────────────────────────────────────────────┘
   ```

2. **Transaction History**
   ```xml
   <wm-container name="transaction" class="transaction" direction="row" gap="12" alignment="top-left" width="fill" height="hug">
     <wm-picture name="merchant_icon" class="icon-md" width="48px" height="48px" />
     
     <wm-container name="transaction_details" class="details" direction="column" gap="2" alignment="top-left" width="hug" height="hug">
       <wm-label name="merchant_name" caption="Starbucks Coffee" class="font-bold" />
       <wm-label name="transaction_date" caption="Today, 10:30 AM" class="text-sm text-gray-500" />
       <wm-label name="transaction_category" caption="Food & Drink" class="text-xs badge" />
     </wm-container>
     
     <wm-container name="amount_section" class="amount" direction="column" gap="4" alignment="top-right" width="hug" height="hug">
       <wm-label name="transaction_amount" caption="-$12.50" class="text-lg font-bold text-red-600" />
       <wm-label name="balance" caption="Balance: $987.50" class="text-xs text-gray-500" />
     </wm-container>
   </wm-container>
   ```
   ```
   ┌──────────────────────────────────────────────┐
   │ ☕  Starbucks Coffee              -$12.50    │
   │     Today, 10:30 AM          Balance: $987  │
   │     Food & Drink                             │
   └──────────────────────────────────────────────┘
   ```

3. **Contact List (Simplified - Direct Buttons)**
   ```xml
   <wm-container name="contact" class="contact" direction="row" gap="12" alignment="top-left" width="fill" height="hug">
     <wm-picture name="avatar" class="avatar" width="56px" height="56px" />
     
     <wm-container name="contact_details" class="details" direction="column" gap="4" alignment="top-left" width="hug" height="hug">
       <wm-label name="contact_name" caption="Sarah Johnson" class="text-lg font-bold" />
       <wm-label name="contact_status" caption="Online" class="text-sm text-green-600" />
     </wm-container>
     
     <wm-button name="message_btn" caption="💬" class="btn-icon" />
     <wm-button name="call_btn" caption="📞" class="btn-icon" />
   </wm-container>
   ```
   ```
   ┌──────────────────────────────────────────┐
   │ 👤  Sarah Johnson          [💬] [📞]    │
   │     Online                               │
   └──────────────────────────────────────────┘
   ```

### Pattern 5: Nested Detail Columns

**Use for:** Transaction details, user info, stacked text within list items, metadata displays

```xml
<wm-container name="detail_column" class="details" direction="column" gap="4" alignment="top-left" width="hug" height="hug">
  <wm-label name="primary" class="text-base" caption="Primary Text" />
  <wm-label name="secondary" class="text-sm text-gray-500" caption="Secondary Text" />
</wm-container>
```

**Critical:** Even deeply nested containers need ALL 7 attributes

**Visual Layouts:**

```
Simple 2-line detail:
┌──────────────┐
│ Primary      │
│ Secondary    │
└──────────────┘

Side-by-side details (in row):
┌────────────────────────────────────┐
│ ┌──────────┐      ┌──────────┐    │
│ │ Title    │      │ Price    │    │
│ │ Subtitle │      │ $99      │    │
│ └──────────┘      └──────────┘    │
└────────────────────────────────────┘
```

**Common UI/UX Scenarios:**

1. **Text Hierarchy (3+ levels)**
   ```xml
   <wm-container name="user_info" class="user-info" direction="column" gap="4" alignment="top-left" width="hug" height="hug">
     <wm-label name="user_name" caption="John Smith" class="text-lg font-bold" />
     <wm-label name="user_email" caption="john.smith@email.com" class="text-sm text-gray-600" />
     <wm-label name="user_joined" caption="Member since Jan 2024" class="text-xs text-gray-500" />
   </wm-container>
   ```
   ```
   ┌───────────────────────┐
   │ John Smith            │
   │ john.smith@email.com  │
   │ Member since Jan 2024 │
   └───────────────────────┘
   ```

2. **Right-Aligned Numbers (Price/Stats)**
   ```xml
   <wm-container name="price_details" class="price" direction="column" gap="4" alignment="top-right" width="hug" height="hug">
     <wm-label name="subtotal" caption="Subtotal: $99.00" class="text-base" />
     <wm-label name="tax" caption="Tax: $8.91" class="text-sm text-gray-600" />
     <wm-label name="total" caption="Total: $107.91" class="text-lg font-bold" />
   </wm-container>
   ```
   ```
   ┌──────────────────┐
   │ Subtotal: $99.00 │
   │ Tax: $8.91       │
   │ Total: $107.91   │
   └──────────────────┘
   ```

3. **Multi-Step Timeline (Nested Containers)**
   ```xml
   <wm-container name="timeline" class="timeline" direction="column" gap="12" alignment="top-left" width="hug" height="hug">
     <wm-container name="step1" class="step" direction="column" gap="2" alignment="top-left" width="hug" height="hug">
       <wm-label name="step1_status" caption="✅ Order Placed" class="text-base font-bold" />
       <wm-label name="step1_time" caption="Today at 2:30 PM" class="text-xs text-gray-500" />
     </wm-container>
     <wm-container name="step2" class="step" direction="column" gap="2" alignment="top-left" width="hug" height="hug">
       <wm-label name="step2_status" caption="📦 Processing" class="text-base font-bold" />
       <wm-label name="step2_time" caption="In progress..." class="text-xs text-gray-500" />
     </wm-container>
   </wm-container>
   ```
   ```
   ┌──────────────────────┐
   │ ✅ Order Placed      │
   │ Today at 2:30 PM     │
   │                      │
   │ 📦 Processing        │
   │ In progress...       │
   └──────────────────────┘
   ```

### Pattern 6: Card Container

**Use for:** Service cards, product cards, content cards, feature highlights, blog posts, dashboard widgets

```xml
<wm-container name="card" class="card" direction="column" gap="8" alignment="top-left" width="hug" height="hug">
  <wm-picture name="card_image" class="card-img" picturesource="assets/image.png" />
  <wm-label name="card_title" class="font-bold" caption="Title" />
  <wm-label name="card_subtitle" class="text-sm" caption="Subtitle" />
</wm-container>
```

**Critical:** Card containers MUST have `alignment` attribute

**Visual Layouts:**

```
Basic card (vertical):
┌─────────────────┐
│   [IMAGE]       │
│                 │
│ Card Title      │
│ Description     │
└─────────────────┘

Card with action button:
┌─────────────────┐
│   [IMAGE]       │
│                 │
│ Card Title      │
│ Description     │
│   [Button]      │
└─────────────────┘

Card grid (3 cards in row):
┌──────┐  ┌──────┐  ┌──────┐
│ [IMG]│  │ [IMG]│  │ [IMG]│
│ Title│  │ Title│  │ Title│
│ Desc │  │ Desc │  │ Desc │
└──────┘  └──────┘  └──────┘

Card with header and footer:
┌─────────────────┐
│ Header/Badge    │
│   [IMAGE]       │
│ Card Title      │
│ Description     │
│ ──────────────  │
│ Footer Info     │
└─────────────────┘
```

**Common UI/UX Scenarios:**

1. **Product Card**
   ```xml
   <wm-container name="product_card" class="card" direction="column" gap="12" alignment="top-left" width="hug" height="hug">
     <wm-picture name="product_image" class="card-img" width="200px" height="200px" />
     <wm-label name="product_name" caption="Wireless Earbuds" class="text-lg font-bold" />
     <wm-label name="product_rating" caption="⭐⭐⭐⭐⭐ (127 reviews)" class="text-sm" />
     <wm-label name="product_price" caption="$79.99" class="text-xl font-bold text-blue-600" />
     <wm-button name="add_to_cart" caption="Add to Cart" class="btn-primary" />
   </wm-container>
   ```
   ```
   ┌────────────────────┐
   │    [📷 IMAGE]      │
   │                    │
   │ Wireless Earbuds   │
   │ ⭐⭐⭐⭐⭐ (127)    │
   │ $79.99             │
   │   [Add to Cart]    │
   └────────────────────┘
   ```

2. **Blog/Article Card**
   ```xml
   <wm-container name="article_card" class="card" direction="column" gap="8" alignment="top-left" width="hug" height="hug">
     <wm-picture name="article_image" class="card-img" width="300px" height="180px" />
     <wm-label name="article_category" caption="Technology" class="text-xs badge" />
     <wm-label name="article_title" caption="10 Tips for Better Productivity" class="text-lg font-bold" />
     <wm-label name="article_excerpt" caption="Learn how to maximize your daily output..." class="text-sm text-gray-600" />
     <wm-container name="article_meta" class="meta" direction="row" gap="8" alignment="center" width="fill" height="hug">
       <wm-label name="author" caption="By John Doe" class="text-xs text-gray-500" />
       <wm-label name="read_time" caption="5 min read" class="text-xs text-gray-500" />
     </wm-container>
   </wm-container>
   ```
   ```
   ┌────────────────────────────┐
   │     [ARTICLE IMAGE]        │
   │                            │
   │ Technology                 │
   │ 10 Tips for Better         │
   │ Productivity               │
   │ Learn how to maximize...   │
   │ By John Doe • 5 min read   │
   └────────────────────────────┘
   ```

3. **Dashboard Widget Card**
   ```xml
   <wm-container name="stats_card" class="card" direction="column" gap="8" alignment="top-left" width="hug" height="hug">
     <wm-container name="card_header" class="header" direction="row" gap="auto" alignment="center" width="fill" height="hug">
       <wm-label name="widget_title" caption="Total Sales" class="text-sm font-bold" />
       <wm-icon name="trend_icon" iconclass="fa fa-arrow-up" class="text-green-500" />
     </wm-container>
     <wm-label name="main_value" caption="$24,567" class="text-3xl font-bold" />
     <wm-label name="comparison" caption="+12% from last month" class="text-sm text-green-600" />
     <wm-button name="view_details" caption="View Details →" class="btn-link" />
   </wm-container>
   ```
   ```
   ┌────────────────────────┐
   │ Total Sales        ↗️  │
   │                        │
   │ $24,567                │
   │ +12% from last month   │
   │ View Details →         │
   └────────────────────────┘
   ```

4. **Event Card (Special gap="0")**
   ```xml
   <wm-container name="event_card" class="card" direction="column" gap="0" alignment="top-left" width="hug" height="hug">
     <wm-container name="event_date_badge" class="badge" direction="column" gap="2" alignment="top-center" width="fill" height="hug">
       <wm-label name="month" caption="MAR" class="text-xs text-white" />
       <wm-label name="day" caption="15" class="text-2xl font-bold text-white" />
     </wm-container>
     <wm-container name="event_details" class="details" direction="column" gap="8" alignment="top-left" width="fill" height="hug">
       <wm-label name="event_title" caption="Product Launch Event" class="text-lg font-bold" />
       <wm-label name="event_time" caption="🕐 2:00 PM - 5:00 PM" class="text-sm" />
       <wm-label name="event_location" caption="📍 Downtown Convention Center" class="text-sm" />
       <wm-button name="rsvp_btn" caption="RSVP Now" class="btn-primary" />
     </wm-container>
   </wm-container>
   ```
   ```
   ┌────────────────────────┐
   │      MAR               │
   │       15               │
   ├────────────────────────┤
   │ Product Launch Event   │
   │ 🕐 2:00 PM - 5:00 PM  │
   │ 📍 Downtown Center    │
   │   [RSVP Now]           │
   └────────────────────────┘
   ```

5. **Pricing Card**
   ```xml
   <wm-container name="pricing_card" class="card" direction="column" gap="16" alignment="top-center" width="hug" height="hug">
     <wm-label name="plan_name" caption="Pro Plan" class="text-xl font-bold" />
     <wm-container name="price_section" class="price" direction="row" gap="4" alignment="center" width="hug" height="hug">
       <wm-label name="currency" caption="$" class="text-2xl" />
       <wm-label name="amount" caption="29" class="text-5xl font-bold" />
       <wm-label name="period" caption="/month" class="text-sm text-gray-500" />
     </wm-container>
     <wm-container name="features" class="features" direction="column" gap="8" alignment="top-left" width="fill" height="hug">
       <wm-label name="feature1" caption="✓ Unlimited projects" class="text-sm" />
       <wm-label name="feature2" caption="✓ Priority support" class="text-sm" />
       <wm-label name="feature3" caption="✓ Advanced analytics" class="text-sm" />
       <wm-label name="feature4" caption="✓ Team collaboration" class="text-sm" />
     </wm-container>
     <wm-button name="subscribe_btn" caption="Subscribe Now" class="btn-primary" />
   </wm-container>
   ```
   ```
   ┌────────────────────────┐
   │      Pro Plan          │
   │                        │
   │    $   29   /month     │
   │                        │
   │ ✓ Unlimited projects   │
   │ ✓ Priority support     │
   │ ✓ Advanced analytics   │
   │ ✓ Team collaboration   │
   │                        │
   │   [Subscribe Now]      │
   └────────────────────────┘
   ```

---

## Pattern 7: Complex Compositions

**Use for:** Combining multiple patterns, complex UIs with nested layouts, dashboard screens, forms

### 7.1: Search Bar with Filters

```xml
<wm-container name="search_section" class="search" direction="column" gap="12" alignment="top-left" width="fill" height="hug">
  <!-- Search row -->
  <wm-container name="search_row" class="search-bar" direction="row" gap="8" alignment="center" width="fill" height="hug">
    <wm-text name="search_input" placeholder="Search..." class="flex-1" />
    <wm-button name="search_btn" caption="🔍" class="btn-icon" />
  </wm-container>
  
  <!-- Filter chips row -->
  <wm-container name="filters" class="filters" direction="row" gap="8" alignment="start" width="fill" height="hug">
    <wm-button name="filter_all" caption="All" class="chip active" />
    <wm-button name="filter_recent" caption="Recent" class="chip" />
    <wm-button name="filter_popular" caption="Popular" class="chip" />
    <wm-button name="filter_nearby" caption="Nearby" class="chip" />
  </wm-container>
</wm-container>
```

```
┌──────────────────────────────────────┐
│ [Search...        ] [🔍]            │
│                                      │
│ [All] [Recent] [Popular] [Nearby]   │
└──────────────────────────────────────┘
```

### 7.2: Header with Profile and Actions

```xml
<wm-container name="app_header" class="header" direction="row" gap="auto" alignment="center" width="fill" height="hug">
  <!-- Left: Back + Title -->
  <wm-container name="header_left" class="left" direction="row" gap="8" alignment="center" width="hug" height="hug">
    <wm-button name="back_btn" caption="←" class="btn-icon" />
    <wm-label name="page_title" caption="Settings" class="text-xl font-bold" />
  </wm-container>
  
  <!-- Right: Actions + Avatar -->
  <wm-container name="header_right" class="right" direction="row" gap="12" alignment="center" width="hug" height="hug">
    <wm-button name="notifications_btn" caption="🔔" class="btn-icon" />
    <wm-picture name="user_avatar" class="avatar" width="40px" height="40px" />
  </wm-container>
</wm-container>
```

```
┌─────────────────────────────────────────┐
│ [←] Settings           [🔔] [👤]       │
└─────────────────────────────────────────┘
```

### 7.3: Social Media Post Card

```xml
<wm-container name="post_card" class="post" direction="column" gap="12" alignment="top-left" width="fill" height="hug">
  <!-- Header: Avatar + Name + Time + More -->
  <wm-container name="post_header" class="header" direction="row" gap="auto" alignment="center" width="fill" height="hug">
    <wm-container name="user_info" class="user" direction="row" gap="8" alignment="center" width="hug" height="hug">
      <wm-picture name="user_avatar" class="avatar" width="48px" height="48px" />
      <wm-container name="user_details" class="details" direction="column" gap="2" alignment="top-left" width="hug" height="hug">
        <wm-label name="user_name" caption="John Doe" class="font-bold" />
        <wm-label name="post_time" caption="2 hours ago" class="text-xs text-gray-500" />
      </wm-container>
    </wm-container>
    <wm-button name="more_btn" caption="⋯" class="btn-icon" />
  </wm-container>
  
  <!-- Content -->
  <wm-label name="post_content" caption="Just launched my new project! 🚀" class="text-base" />
  <wm-picture name="post_image" class="post-img" width="100%" height="300px" />
  
  <!-- Actions: Like, Comment, Share -->
  <wm-container name="post_actions" class="actions" direction="row" gap="16" alignment="start" width="fill" height="hug">
    <wm-button name="like_btn" caption="❤️ 124" class="btn-link" />
    <wm-button name="comment_btn" caption="💬 32" class="btn-link" />
    <wm-button name="share_btn" caption="🔗 Share" class="btn-link" />
  </wm-container>
</wm-container>
```

```
┌────────────────────────────────────────┐
│ 👤 John Doe                      ⋯    │
│    2 hours ago                         │
│                                        │
│ Just launched my new project! 🚀      │
│                                        │
│ [     POST IMAGE     ]                 │
│                                        │
│ [❤️ 124]  [💬 32]  [🔗 Share]       │
└────────────────────────────────────────┘
```

### 7.4: E-commerce Cart Summary

```xml
<wm-container name="cart_summary" class="cart" direction="column" gap="16" alignment="top-left" width="fill" height="hug">
  <wm-label name="summary_title" caption="Order Summary" class="text-xl font-bold" />
  
  <!-- Cart item -->
  <wm-container name="item1" class="item" direction="row" gap="12" alignment="center" width="fill" height="hug">
    <wm-picture name="item1_img" class="thumbnail" width="60px" height="60px" />
    <wm-container name="item1_details" class="details" direction="column" gap="4" alignment="top-left" width="hug" height="hug">
      <wm-label name="item1_name" caption="Product Name" class="font-bold" />
      <wm-label name="item1_qty" caption="Qty: 2" class="text-sm text-gray-500" />
    </wm-container>
    <wm-label name="item1_price" caption="$59.98" class="font-bold" />
  </wm-container>
  
  <!-- Price breakdown -->
  <wm-container name="price_breakdown" class="breakdown" direction="column" gap="8" alignment="top-left" width="fill" height="hug">
    <wm-container name="subtotal_row" class="row" direction="row" gap="auto" alignment="center" width="fill" height="hug">
      <wm-label name="subtotal_label" caption="Subtotal" class="text-sm" />
      <wm-label name="subtotal_value" caption="$59.98" class="text-sm" />
    </wm-container>
    <wm-container name="total_row" class="row" direction="row" gap="auto" alignment="center" width="fill" height="hug">
      <wm-label name="total_label" caption="Total" class="text-lg font-bold" />
      <wm-label name="total_value" caption="$70.38" class="text-lg font-bold" />
    </wm-container>
  </wm-container>
  
  <wm-button name="checkout_btn" caption="Proceed to Checkout" class="btn-primary btn-lg" />
</wm-container>
```

```
┌──────────────────────────────┐
│ Order Summary                │
│                              │
│ [📷] Product Name    $59.98  │
│      Qty: 2                  │
│                              │
│ Subtotal            $59.98   │
│ Total               $70.38   │
│                              │
│  [Proceed to Checkout]       │
└──────────────────────────────┘
```

---

## Quick Reference

### Container Attribute Template
```xml
<wm-container 
  name="unique_name"
  class="css-class"
  direction="row|column"
  gap="N|auto"
  alignment="..."
  width="fill|hug|Npx"
  height="fill|hug|Npx"
>
```

### Common Container Patterns

**Full-Width Row:**
```xml
<wm-container name="row" class="w-full" direction="row" gap="auto" alignment="center" width="fill" height="hug">
```

**Compact Group:**
```xml
<wm-container name="group" class="centered" direction="column" gap="8" alignment="top-center" width="hug" height="hug">
```

**Screen Root:**
```xml
<wm-container name="screen_root" class="h-full w-full" direction="column" gap="16" alignment="top-center" width="fill" height="fill">
```

---
