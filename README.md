# YRDSB OT Daily Rate Calculator

## Overview

The **YRDSB OT Daily Rate Calculator** is a web-based tool that allows occasional teachers (OTs) to calculate their daily rate based on their instructional hours at various schools within the **York Region District School Board (YRDSB)**. The calculator factors in school start and end times, recess, and lunch breaks to determine the final pay rate. It also provides assignment tracking to maintain a record of days worked at different schools.

## Features

- **Autocomplete School Search**: Select a school from a predefined list.
- **Time Input Fields**: Enter start and end times to calculate the instructional duration.
- **Automated Pay Calculation**: Computes the pay rate based on instructional minutes.
- **Visual Timeline**: Interactive visual representation of the school day schedule.
- **Assignment Tracking**: Save assignments with specific dates and track total earnings.
- **PDF Report Generation**: Create detailed reports for individual assignments or comprehensive summaries.
- **Dark Mode Toggle**: Users can switch between light and dark modes.
- **Reset Button**: Clears all fields and results for a fresh calculation.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Technologies Used

- **HTML**: Structure of the webpage.
- **CSS**: Styling and layout with responsive design.
- **JavaScript**: Functionality, event handling, calculations, and data management.
- **JSON**: Fetches school bell times from an external file.
- **Local Storage**: Saves assignment data persistently in the browser.
- **jsPDF**: Client-side PDF generation for reports.

## How to Use

### Calculator Tab
1. Type a school name into the search box.
2. Select the correct school from the dropdown.
3. Enter the **start time** and **end time** of the teaching assignment (or use the visual timeline).
4. Click the **Calculate** button to determine the pay rate.
5. View results including:
   - Instructional time
   - Pay rate
   - Pay point
6. Click "How was this calculated?" to view the detailed breakdown.

### School Information Tab
1. Type a school name into the search box.
2. Select the correct school from the dropdown.
3. Click **Show Details** to view the school's schedule.
4. Review the school's instructional hours, recess, and lunch times.

### Assignments Tab
1. In the Calculator tab, complete a calculation.
2. Select a date for the assignment using the date picker.
3. Click **Add to Assignments** to save the current calculation.
4. Navigate to the Assignments tab to view all saved assignments.
5. See your total days worked and total pay.
6. Click **Export All Assignments** to generate a comprehensive PDF report.
7. Use **Clear All** to remove all saved assignments if needed.

## File Structure

```
|-- modern-index.html    # Main HTML structure
|-- modern-styles.css    # Modern UI styling with responsive design
|-- modern-app.js        # Application logic and event handlers
|-- timeline.js          # Timeline visualization component
|-- schoolTimes.json     # School data source
```

## Known Issues & Future Enhancements

- Currently, the JSON file **must be manually updated** with new school times.
- Assignment data is stored locally in the browser and doesn't sync between devices.
- Future versions may include:
  - Data synchronization across devices
  - Additional export formats (CSV, Excel)
  - Advanced filtering and search for assignments
  - Progressive Web App support for offline functionality

## Contributing

Contributions are welcome! Feel free to **fork** the repository, create a branch, and submit a **pull request**.

## License

This project is open-source and available under the **MIT License**.

---

Developed for **YRDSB Occasional Teachers** to simplify rate calculations and track assignments.

