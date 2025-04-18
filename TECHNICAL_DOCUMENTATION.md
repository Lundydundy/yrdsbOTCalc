# YRDSB OT Daily Rate Calculator - Technical Code Documentation

This document provides an in-depth explanation of the code implementation for the modernized YRDSB OT Daily Rate Calculator, detailing how each component was built and the reasoning behind technical decisions.

## Table of Contents
1. [Timeline Component](#timeline-component)
2. [CSS Structure](#css-structure)
3. [HTML Structure](#html-structure)
4. [JavaScript Application Logic](#javascript-application-logic)
5. [Pay Calculation Explanation](#pay-calculation-explanation)

## Timeline Component

The timeline component (`timeline.js`) is a reusable class-based component that visualizes the school day schedule.

### Class Structure

```javascript
class SchoolTimeline {
  constructor(container, school) {
    this.container = container;
    this.school = school;
    this.startTime = null;
    this.endTime = null;
    this.timelineWidth = 100;
    this.dayStartTime = "07:40";
    this.dayEndTime = "16:05"; // Extended to 16:05 to ensure full visibility of the 16:00 marker
    this.onChange = null;
  }
  
  // Methods...
}
```

**Implementation Reasoning:**
- **Class-based approach:** Used an OOP pattern for better encapsulation and to allow multiple timeline instances (calculator and info pages)
- **Container-based rendering:** The timeline accepts a container element, making it reusable across different parts of the application
- **School object injection:** Passes the school data as a dependency rather than coupling it directly to the data source
- **Extended end time:** The dayEndTime is set to 16:05 instead of 16:00 to ensure the 16:00 marker is fully visible, while the timeline still displays hourly markers up to 16:00

### Time Conversion Methods

```javascript
timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
```

**Implementation Reasoning:**
- **Time as minutes:** Converting time strings to minutes simplifies position calculations and time math
- **Two-way conversion:** Supports both converting time strings to minutes (for math) and minutes back to time strings (for display)
- **String padding:** Ensures consistent 2-digit format (e.g., "08:05" instead of "8:5")

### Positioning Logic

```javascript
getPositionPercentage(timeStr) {
  const dayStart = this.timeToMinutes(this.dayStartTime);
  const dayEnd = this.timeToMinutes(this.dayEndTime);
  const dayLength = dayEnd - dayStart;
  const time = this.timeToMinutes(timeStr);
  return ((time - dayStart) / dayLength) * 100;
}
```

**Implementation Reasoning:**
- **Percentage-based positioning:** Uses percentages instead of pixels for responsive design
- **Normalization:** Calculates position as a percentage of the total day length
- **Linear mapping:** Creates a proportional visual representation of time periods

### Timeline Rendering

```javascript
render() {
  // Clear container
  this.container.innerHTML = "";
  this.container.classList.add("school-timeline");

  // Create timeline container
  const timeline = document.createElement("div");
  timeline.className = "timeline-track";
  
  // Create time markers
  // ...
  
  // Create school segments (instruction, recess, lunch)
  if (this.school) {
    // Render segments...
  }
  
  // Create selection elements
  // ...
  
  // Set up drag handlers
  // ...
  
  return this;
}
```

**Implementation Reasoning:**
- **Fresh rendering:** Clears and rebuilds the timeline on each update for consistency
- **Progressive enhancement:** First creates the base track, then adds markers, segments, and interactive elements
- **Conditional rendering:** Checks if school data is available before attempting to render segments
- **Method chaining:** Returns `this` to allow chained method calls (e.g., `timeline.render().setTimes()`)

### Drag Handlers

```javascript
setupDraggableHandles() {
  const self = this;
  let activeHandle = null;
  
  // Mouse down
  this.startHandle.addEventListener('mousedown', function(e) {
    activeHandle = self.startHandle;
    e.preventDefault();
  });
  
  // Mouse move
  document.addEventListener('mousemove', function(e) {
    if (activeHandle) {
      updateTimeFromPosition(e);
    }
  });
  
  // Mouse up
  document.addEventListener('mouseup', function() {
    activeHandle = null;
  });
  
  // Click on timeline
  // ...
}
```

**Implementation Reasoning:**
- **Document-level event handling:** Attaches mousemove and mouseup to document, ensuring drag works even when cursor leaves the timeline
- **State tracking:** Uses a closure to track the active handle state between event handlers
- **Event prevention:** Prevents default browser behavior that might interfere with dragging
- **Self variable:** Uses a `self` variable to maintain reference to the class instance within event handlers

### Time Position Calculation

```javascript
function updateTimeFromPosition(e) {
  // Calculate percentage across timeline
  const rect = self.container.getBoundingClientRect();
  const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  
  // Convert to time
  const minutesFromStart = (percentage / 100) * dayLength + dayStart;
  const timeStr = self.minutesToTime(Math.round(minutesFromStart / 5) * 5);
  
  // Update based on which handle is active
  // ...
}
```

**Implementation Reasoning:**
- **Bounding rectangle:** Uses `getBoundingClientRect()` to get accurate dimensions accounting for any position changes
- **Constrained percentage:** Clamps value between 0-100% to prevent handles from exceeding track bounds
- **Time rounding:** Rounds time to nearest 5 minutes for better usability
- **Handle-specific updates:** Updates either start or end time based on which handle is being dragged

## CSS Structure

The CSS file (`modern-styles.css`) implements a comprehensive design system using CSS variables and modular components.

### CSS Variables

```css
:root {
  --primary-color: #1976d2;
  --primary-dark: #004ba0;
  --primary-light: #63a4ff;
  --accent-color: #ff9800;
  --text-color: #333333;
  --light-text: #717171;
  --background-color: #f5f5f5;
  --card-color: #ffffff;
  --border-color: #e0e0e0;
  --error-color: #d32f2f;
  --success-color: #388e3c;
  --instructional-color: #4caf50;
  --recess-color: #ff9800;
  --lunch-color: #f44336;
}

.dark-mode {
  --primary-color: #42a5f5;
  --primary-dark: #0077c2;
  --primary-light: #80d6ff;
  --accent-color: #ffb74d;
  --text-color: #f5f5f5;
  --light-text: #cccccc;
  --background-color: #121212;
  --card-color: #1e1e1e;
  --border-color: #333333;
  --instructional-color: #66bb6a;
  --recess-color: #ffa726;
  --lunch-color: #ef5350;
}
```

**Implementation Reasoning:**
- **CSS variables:** Used for theming and consistency across the application
- **Color system:** Created a comprehensive color palette with primary, accent, and functional colors
- **Dark mode overrides:** Implemented dark mode by changing variable values rather than duplicating styles
- **Semantic naming:** Used descriptive names that reflect purpose rather than specific colors

### Component Styles

```css
.card {
  background-color: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin: 1rem 0;
  transition: all 0.3s ease;
}

.timeline-track {
  position: relative;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 15px;
}

.timeline-segment {
  position: absolute;
  height: 100%;
  border-radius: 15px;
}
```

**Implementation Reasoning:**
- **Component isolation:** Each UI component has its own set of styles
- **Variable usage:** Used CSS variables consistently instead of hardcoded values
- **Progressive enhancement:** Applied sophisticated visual effects (shadows, transitions) as enhancements
- **Relative units:** Used `rem` and percentages for better scaling and responsiveness

### Responsive Design

```css
@media (max-width: 768px) {
  .app-title {
    font-size: 1.25rem;
  }
  
  .btn {
    width: 100%;
  }
  
  .btn-group {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
```

**Implementation Reasoning:**
- **Mobile-first approach:** Base styles work on mobile, with media queries enhancing for larger screens
- **Strategic breakpoints:** Used standard breakpoints (576px, 768px) for consistent responsive behavior
- **Targeted changes:** Modified only what needs to change at each breakpoint rather than redefining everything
- **Layout shifts:** Changed layout direction (row to column) where needed for smaller screens

## HTML Structure

The HTML file (`modern-index.html`) creates a semantic structure with clear component organization.

### Header and Navigation

```html
<header class="app-header">
  <div class="container">
    <h1 class="app-title">YRDSB OT Daily Rate Calculator</h1>
    <nav class="app-nav">
      <a id="calculator-tab" class="nav-tab active">Calculator</a>
      <a id="info-tab" class="nav-tab">School Information</a>
      <label class="theme-switch">
        <input type="checkbox" id="theme-toggle">
        <span class="theme-slider"></span>
      </label>
    </nav>
  </div>
</header>
```

**Implementation Reasoning:**
- **Semantic HTML:** Used semantic elements (`header`, `nav`) for better accessibility
- **Container pattern:** Wrapped content in a container div for consistent width control
- **Inline toggle:** Placed theme toggle directly in nav for easy access
- **Accessible labels:** Used proper labeling for interactive elements

### Card-Based Layout

```html
<div class="card">
  <div class="card-header">
    <h2 class="card-title">Select School</h2>
  </div>
  <div class="form-group">
    <!-- Content -->
  </div>
</div>
```

**Implementation Reasoning:**
- **Card containers:** Used cards to segment the interface into logical sections
- **Consistent headers:** Each card has a consistent header structure with a title
- **Nested components:** Organized form elements into logical groups
- **Visual hierarchy:** Created clear visual distinction between different functional areas

### Search Component

```html
<div class="search-container">
  <i class="fas fa-search search-icon"></i>
  <input 
    type="text" 
    id="searchBoxCalc" 
    class="search-input" 
    placeholder="Type a school name..." 
    autocomplete="off"
  >
  <div id="dropdownCalc" class="autocomplete-dropdown"></div>
</div>
```

**Implementation Reasoning:**
- **Wrapper container:** Used a container to position the icon and dropdown relative to the input
- **Search icon:** Added a visual indicator of the search functionality
- **Disabled browser autocomplete:** Used `autocomplete="off"` to prevent interference with custom autocomplete
- **Empty dropdown:** Created an empty dropdown container to be populated by JavaScript

### Timeline Container

```html
<div id="timeline-container"></div>
```

**Implementation Reasoning:**
- **Empty container:** Created an empty container for JavaScript to populate with the timeline
- **Minimal markup:** Kept HTML lean by generating complex interactive elements via JavaScript
- **ID-based targeting:** Used ID for direct JavaScript targeting rather than class selectors

### Pay Explanation Section

```html
<div id="pay-explanation" class="pay-explanation">
  <div class="explanation-toggle">
    <button id="toggle-explanation" class="btn-link">
      <i class="fas fa-info-circle"></i> How was this calculated?
    </button>
  </div>
  <div id="explanation-details" class="explanation-details" style="display: none;">
    <!-- Explanation items -->
  </div>
</div>
```

**Implementation Reasoning:**
- **Progressive disclosure:** Initially hid the details to keep the interface clean
- **Toggleable content:** Added a button to show/hide the explanation on demand
- **Structured data:** Organized explanation into logical sections for clarity
- **Visual separation:** Used design elements (background, border) to distinguish from main results

## JavaScript Application Logic

The main application JavaScript file (`modern-app.js`) handles data fetching, UI interactions, and calculations.

### Module Structure

```javascript
document.addEventListener('DOMContentLoaded', async function() {
  // Global variables
  let schoolDict = {};
  let schoolNames = [];
  let currentSchool = null;
  let calcTimeline = null;
  let infoTimeline = null;
  
  // DOM Elements
  // ...
  
  // Functions
  // ...
  
  // Initialize the application
  async function init() {
    // ...
  }
  
  // Start the application
  init();
});
```

**Implementation Reasoning:**
- **IIFE with DOMContentLoaded:** Ensures code runs only after DOM is ready
- **Limited global scope:** Keeps variables inside the main function to avoid global namespace pollution
- **State management:** Uses simple variables for application state (current school, timelines)
- **Logical organization:** Grouped code by functionality (DOM elements, utility functions, event handlers)
- **Async initialization:** Used async function for initialization to handle asynchronous data loading

### Data Loading

```javascript
async function loadSchools() {
  try {
    const response = await fetch('schoolTimes.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const schools = await response.json();
    delete schools['School Name']; // Remove header row
    
    // Extract school names
    schoolNames = Object.keys(schools);
    schoolDict = schools;
    
    console.log(`Loaded ${schoolNames.length} schools`);
    return schools;
  } catch (error) {
    console.error("Error loading schools:", error);
    showError(errorCalc, "Failed to load school data. Please refresh the page.");
    return {};
  }
}
```

**Implementation Reasoning:**
- **Async/await pattern:** Used modern async/await for cleaner promise handling
- **Error handling:** Implemented comprehensive error handling with user feedback
- **Response validation:** Checked if response is OK before proceeding
- **Data cleanup:** Removed header row from data to have clean school entries
- **Return value:** Returned the loaded data for potential chaining of operations

### Enhanced Autocomplete

```javascript
function setupAutocomplete(searchBox, dropdown) {
  let activeIndex = -1;
  let filteredSchools = [];
  
  searchBox.addEventListener('input', debounce(function() {
    const input = searchBox.value.toLowerCase();
    // Filter and display matching schools
    // ...
  }, 200));
  
  // Keyboard navigation
  searchBox.addEventListener('keydown', function(e) {
    // Handle arrow keys, Enter, Escape
    // ...
  });
}
```

**Implementation Reasoning:**
- **Debouncing:** Applied debouncing to prevent excessive filtering during fast typing
- **Case insensitivity:** Converted input to lowercase for case-insensitive matching
- **State tracking:** Kept track of active selection index and filtered schools
- **Keyboard navigation:** Implemented keyboard controls for accessibility
- **Reusable function:** Created a single function for both calculator and info page

### Time Preset Handling

```javascript
function setPresetTimes(presetType) {
  if (!currentSchool) return;
  
  switch(presetType) {
    case 'full-day':
      // Add 15 mins before and after instructional time for full day
      const startHour = parseInt(currentSchool.begin.split(':')[0]);
      const startMin = parseInt(currentSchool.begin.split(':')[1]);
      // Calculate 15 minutes before start time
      // ...
      break;
    case 'am-only':
      startTimeInput.value = currentSchool.begin;
      endTimeInput.value = currentSchool.lunchStart;
      break;
    case 'pm-only':
      startTimeInput.value = currentSchool.lunchEnd;
      endTimeInput.value = currentSchool.dismiss;
      break;
  }
  
  // Update timeline if available
  if (calcTimeline) {
    calcTimeline.setTimes(startTimeInput.value, endTimeInput.value);
  }
}
```

**Implementation Reasoning:**
- **Early return:** Immediately returned if no school is selected
- **Switch statement:** Used switch for clear, maintainable handling of different presets
- **Manual time calculation:** Carefully handled time addition/subtraction with hour/minute conversion
- **Timeline synchronization:** Updated the visual timeline to match the selected preset times
- **Contract compliance:** Added the contractual 15 minutes before/after for full days

### Pay Rate Calculation

```javascript
function calculateRate(schoolName, startTime, endTime) {
  if (!schoolDict[schoolName]) {
    showError(errorCalc, "Please select a valid school");
    return;
  }
  
  const school = schoolDict[schoolName];
  
  // Validate and adjust times
  // ...
  
  // Calculate total time between start and end
  const totalTime = subtractTimesInMinutes(finalStartTime, finalEndTime);
  
  // Calculate recess and lunch time
  // ...

  // Subtract non-instructional time
  const instructionalTime = totalTime - recessMinutes - lunchMinutes;
  
  // Calculate pay point
  let payPoint = instructionalTime / 300;
  
  // Apply minimum pay rules
  // ...
  
  // Update UI
  // ...
  
  return {
    totalTime,
    recessMinutes,
    lunchMinutes,
    instructionalTime,
    payPoint,
    payRate,
    minRuleApplied
  };
}
```

**Implementation Reasoning:**
- **Input validation:** Validated school existence before proceeding
- **Time bound checking:** Made sure times are within school hours
- **Complex recess/lunch calculations:** Carefully handled overlaps between work hours and breaks
- **Rule application:** Applied the minimum pay rules based on contractual requirements
- **Detailed return object:** Returned comprehensive calculation details for explanation
- **UI updates:** Updated multiple UI elements with calculation results

### Event Setup

```javascript
function setupCalculatorEvents() {
  // Calculate button
  calculateBtn.addEventListener('click', function() {
    // ...
  });
  
  // Reset button
  resetButtonCalc.addEventListener('click', function() {
    // ...
  });
  
  // Toggle explanation
  toggleExplanation.addEventListener('click', function() {
    if (explanationDetails.style.display === 'none') {
      explanationDetails.style.display = 'block';
    } else {
      explanationDetails.style.display = 'none';
    }
  });
  
  // Setup preset buttons
  presetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const presetType = this.getAttribute('data-preset');
      // ...
    });
  });
}
```

**Implementation Reasoning:**
- **Functional grouping:** Grouped related event handlers into setup functions
- **Event delegation:** For repeating elements like preset buttons, used iteration to attach handlers
- **Data attributes:** Used data attributes to store preset types instead of hardcoding in JavaScript
- **Toggle functionality:** Implemented simple show/hide toggle for explanation details
- **Clean state management:** Reset function returns all states to initial values

## Pay Calculation Explanation

The pay calculation explanation component adds transparency to how rates are calculated.

### HTML Structure

```html
<div id="explanation-details" class="explanation-details" style="display: none;">
  <div class="explanation-item">
    <span>Total Work Time:</span>
    <span id="total-time">0 mins</span>
  </div>
  <!-- Other explanation items -->
  <div class="explanation-separator"></div>
  <div class="explanation-item">
    <span>Pay Point Calculation:</span>
    <span id="point-calc">0 mins ÷ 300 = 0</span>
  </div>
  <!-- Minimum rules and final calculation -->
</div>
```

**Implementation Reasoning:**
- **Progressive disclosure:** Initially hidden to avoid overwhelming users
- **Structured data:** Presented calculation steps in logical order
- **Visual separation:** Added separator between raw calculation and rule application
- **Dynamic placeholders:** Created empty spans to be populated with actual values

### JavaScript Logic

```javascript
// Update explanation details
totalTimeDisplay.textContent = `${totalTime} mins`;
recessTimeDisplay.textContent = `${recessMinutes} mins`;
lunchTimeDisplay.textContent = `${lunchMinutes} mins`;
instrMinutesDisplay.textContent = `${instructionalTime} mins`;
pointCalcDisplay.textContent = `${instructionalTime} mins ÷ 300 = ${(instructionalTime / 300).toFixed(4)}`;
minRuleDisplay.textContent = minRuleApplied;
finalCalcDisplay.textContent = `$${BASE_PAY_RATE.toFixed(2)} × ${payPoint} = $${payRate.toFixed(2)}`;

// Show or hide the minimum pay rule line
const minPayElement = document.getElementById('min-pay-applied');
if (minRuleApplied === "None") {
  minPayElement.style.display = "none";
} else {
  minPayElement.style.display = "flex";
}
```

**Implementation Reasoning:**
- **Detailed breakdown:** Showed every component of the calculation
- **Formatted display:** Added units and formatted numbers for readability
- **Conditional display:** Only showed minimum rule when applied
- **Exact formula representation:** Showed formulas exactly as calculated
- **Currency formatting:** Used toFixed(2) for proper currency display

---

This technical documentation provides insight into the implementation choices for each component of the YRDSB OT Daily Rate Calculator. The code was developed with a focus on modularity, maintainability, and progressive enhancement, ensuring a solid foundation for future expansion.