# YRDSB OT Daily Rate Calculator

## Overview

The **YRDSB OT Daily Rate Calculator** is a web-based tool that allows occasional teachers (OTs) to calculate their daily rate based on their instructional hours at various schools within the **York Region District School Board (YRDSB)**. The calculator factors in school start and end times, recess, and lunch breaks to determine the final pay rate.

## Features

- **Autocomplete School Search**: Select a school from a predefined list.
- **Time Input Fields**: Enter start and end times to calculate the instructional duration.
- **Automated Pay Calculation**: Computes the pay rate based on instructional minutes.
- **Dark Mode Toggle**: Users can switch between light and dark modes.
- **Reset Button**: Clears all fields and results for a fresh calculation.

## Technologies Used

- **HTML**: Structure of the webpage.
- **CSS**: Styling and layout.
- **JavaScript**: Functionality, event handling, and calculations.
- **JSON**: Fetches school bell times from an external file.

## How to Use

1. Type a school name into the search box.
2. Select the correct school from the dropdown.
3. Enter the **start time** and **end time** of the teaching assignment.
4. Click the **Calculate** button to determine the pay rate.
5. View results including:
   - Instructional time
   - Pay rate
   - Pay point
6. Use the **Reset** button to clear all fields.
7. Toggle the **Dark Mode switch** for a different display theme.

## File Structure

```
|-- index.html        # Main HTML file
|-- styles.css        # Styling for the web page
|-- schools.js        # JavaScript handling search, calculations, and UI interactions
|-- schoolTimes.json  # JSON file containing school bell times
```

## Known Issues & Future Enhancements

- Currently, the JSON file **must be manually updated** with new school times.
- A **backend server** could be implemented to dynamically fetch school data.

## Contributing

Contributions are welcome! Feel free to **fork** the repository, create a branch, and submit a **pull request**.

## License

This project is open-source and available under the **MIT License**.

---

Developed for **YRDSB Occasional Teachers** to simplify rate calculations.

