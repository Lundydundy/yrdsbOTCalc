/**
 * YRDSB OT Daily Rate Calculator - Modern Design
 * 
 * A calculator for occasional teachers to compute their daily rate
 * based on instructional time at various schools.
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Mobile menu toggle - CONSOLIDATED VERSION
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const appNav = document.querySelector('.app-nav');
  
  if (mobileMenuToggle && appNav) {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    
    mobileMenuToggle.addEventListener('click', function() {
      appNav.classList.toggle('active');
      // Toggle aria-expanded attribute for accessibility
      const expanded = appNav.classList.contains('active');
      mobileMenuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!appNav.contains(event.target) && !mobileMenuToggle.contains(event.target) && appNav.classList.contains('active')) {
        appNav.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close mobile menu when clicking on navigation items
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          appNav.classList.remove('active');
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
  
  // Global variables
  let schoolDict = {};
  let schoolNames = [];
  let currentSchool = null;
  let calcTimeline = null;
  let infoTimeline = null;
  
  // Constants
  const BASE_PAY_RATE = 286.38;
  
  // Utility Functions
  function timeStringToDate(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  function subtractTimesInMinutes(startTime, endTime) {
    const startDate = timeStringToDate(startTime);
    const endDate = timeStringToDate(endTime);
    return Math.round((endDate - startDate) / 60000);
  }
  
  // Load school data
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
  
  // Enhanced autocomplete function
  function setupAutocomplete(searchBox, dropdown) {
    if (!searchBox || !dropdown) return;
    
    let currentFocus = -1;
    let filteredItems = [];
    
    // Input event for typing in search box
    searchBox.addEventListener("input", debounce(function() {
      const val = this.value.trim().toLowerCase();
      
      // Close any already open dropdown
      closeAllLists();
      if (!val) return false;
      
      filteredItems = [];
      
      // Filter school names based on input
      schoolNames.forEach(schoolName => {
        if (schoolName.toLowerCase().includes(val)) {
          filteredItems.push(schoolName);
        }
      });
      
      // Sort filtered items by relevance
      filteredItems.sort((a, b) => {
        // Exact starts with match takes priority
        const aStartsWith = a.toLowerCase().startsWith(val);
        const bStartsWith = b.toLowerCase().startsWith(val);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then sort by string length for more precise matches
        return a.length - b.length;
      });
      
      // Limit to top 10 results
      filteredItems = filteredItems.slice(0, 10);
      
      // Display the matches
      dropdown.innerHTML = '';
      dropdown.style.display = filteredItems.length > 0 ? "block" : "none";
      
      filteredItems.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.className = "autocomplete-item";
        
        // Highlight the matching part
        const matchIndex = item.toLowerCase().indexOf(val.toLowerCase());
        const beforeMatch = item.substr(0, matchIndex);
        const match = item.substr(matchIndex, val.length);
        const afterMatch = item.substr(matchIndex + val.length);
        
        itemElement.innerHTML = beforeMatch + "<strong>" + match + "</strong>" + afterMatch;
        
        // Store the actual value
        itemElement.dataset.value = item;
        
        // Click event
        itemElement.addEventListener("click", function(e) {
          searchBox.value = this.dataset.value;
          closeAllLists();
          
          // If this is the calculator search box, update the school
          if (searchBox === searchBoxCalc) {
            updateSchool(this.dataset.value);
          }
        });
        
        dropdown.appendChild(itemElement);
      });
      
      currentFocus = -1;
    }, 200));
    
    // Key down event for keyboard navigation
    searchBox.addEventListener("keydown", function(e) {
      // Only process if dropdown is visible
      if (dropdown.style.display !== "block") return;
      
      if (e.keyCode === 40) { // Down arrow
        currentFocus++;
        highlightOption(dropdown, currentFocus);
        e.preventDefault();
      } else if (e.keyCode === 38) { // Up arrow
        currentFocus--;
        highlightOption(dropdown, currentFocus);
        e.preventDefault();
      } else if (e.keyCode === 13 || e.keyCode === 9) { // Enter or Tab
        e.preventDefault();
        if (currentFocus > -1) {
          const items = dropdown.querySelectorAll('.autocomplete-item');
          if (items[currentFocus]) {
            items[currentFocus].click();
          }
        } else if (filteredItems.length > 0) {
          // Just select the first item if none highlighted
          searchBox.value = filteredItems[0];
          closeAllLists();
          
          // If this is the calculator search box, update the school
          if (searchBox === searchBoxCalc) {
            updateSchool(filteredItems[0]);
          }
        }
      }
    });
    
    // Close the list when clicking elsewhere
    document.addEventListener("click", function(e) {
      if (e.target !== searchBox) {
        closeAllLists();
      }
    });
    
    // Helper function to close all autocomplete lists
    function closeAllLists() {
      dropdown.style.display = "none";
      dropdown.innerHTML = '';
      currentFocus = -1;
    }
  }
  
  function highlightOption(dropdown, index) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach(item => item.classList.remove('active'));
    
    if (index >= 0 && index < items.length) {
      items[index].classList.add('active');
    }
  }

  // DOM Elements - Calculator
  const searchBoxCalc = document.getElementById('searchBoxCalc');
  const dropdownCalc = document.getElementById('dropdownCalc');
  const startTimeInput = document.getElementById('startTime');
  const endTimeInput = document.getElementById('endTime');
  const calculateBtn = document.getElementById('calculateBtn');
  const resetButtonCalc = document.getElementById('resetButtonCalc');
  const errorCalc = document.getElementById('errorCalc');
  const pointDisplay = document.getElementById('point');
  const rateDisplay = document.getElementById('rate');
  const instructionalDisplay = document.getElementById('instructional');
  const timelineContainer = document.getElementById('timeline-container');
  
  // DOM Elements - Explanation
  const toggleExplanation = document.getElementById('toggle-explanation');
  const explanationDetails = document.getElementById('explanation-details');
  const totalTimeDisplay = document.getElementById('total-time');
  const recessTimeDisplay = document.getElementById('recess-time');
  const lunchTimeDisplay = document.getElementById('lunch-time');
  const instrMinutesDisplay = document.getElementById('instr-minutes');
  const pointCalcDisplay = document.getElementById('point-calc');
  const minRuleDisplay = document.getElementById('min-rule');
  const finalCalcDisplay = document.getElementById('final-calc');
  
  // DOM Elements - School Info
  const searchBoxInfo = document.getElementById('searchBoxInfo');
  const dropdownInfo = document.getElementById('dropdownInfo');
  const searchButtonInfo = document.getElementById('searchButtonInfo');
  const resetButtonInfo = document.getElementById('resetButtonInfo');
  const errorInfo = document.getElementById('errorInfo');
  const schoolNameDisplay = document.getElementById('schoolName');
  const instStartDisplay = document.getElementById('InstStart');
  const instEndDisplay = document.getElementById('InstEnd');
  const recessDisplay = document.getElementById('Recess');
  const lunchDisplay = document.getElementById('Lunch');
  const infoTimelineContainer = document.getElementById('info-timeline-container');
  
  // DOM Elements - Presets
  const presetButtons = document.querySelectorAll('.preset-btn');
  
  // Tab navigation elements
  const calculatorTab = document.getElementById('calculator-tab');
  const infoTab = document.getElementById('info-tab');
  const assignmentsTab = document.getElementById('assignments-tab');
  const calculatorPage = document.getElementById('calculator-page');
  const schoolInfoPage = document.getElementById('school-info-page');
  const assignmentsPage = document.getElementById('assignments-page');
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  
  // DOM Elements - PDF Export
  const generatePDFButton = document.getElementById('generatePDF');
  
  // DOM Elements - Assignments
  const addToAssignmentsBtn = document.getElementById('addToAssignments');
  const assignmentsList = document.getElementById('assignments-list');
  const noAssignmentsMessage = document.getElementById('no-assignments-message');
  const assignmentsSummary = document.getElementById('assignments-summary');
  const totalDaysDisplay = document.getElementById('total-days');
  const totalPayDisplay = document.getElementById('total-pay');
  const clearAllAssignmentsBtn = document.getElementById('clearAllAssignments');
  const generateAssignmentsPDFBtn = document.getElementById('generateAssignmentsPDF');
  const assignmentDatePicker = document.getElementById('assignmentDate');

  // Assignment management functions
  let assignments = [];

  function loadAssignments() {
    const savedAssignments = localStorage.getItem('assignments');
    if (savedAssignments) {
      assignments = JSON.parse(savedAssignments);
    }
  }

  function saveAssignments() {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }

  function addAssignment(schoolName, startTime, endTime, payPoint, payRate, date = null) {
    // Default to today if no date is provided
    const assignmentDate = date || new Date().toISOString().split('T')[0];
    
    // Create assignment object
    const newAssignment = {
      id: Date.now().toString(),
      schoolName,
      startTime,
      endTime,
      payPoint: parseFloat(payPoint),
      payRate: parseFloat(payRate),
      date: assignmentDate
    };
    
    // Add to assignments array
    assignments.push(newAssignment);
    
    // Save to local storage
    saveAssignments();
    
    // Re-render assignments list
    displayAssignments();
    
    return newAssignment;
  }

  function removeAssignment(id) {
    assignments = assignments.filter(assignment => assignment.id !== id);
    saveAssignments();
    displayAssignments();
  }

  function clearAllAssignments() {
    assignments = [];
    saveAssignments();
    displayAssignments();
  }

  function calculateTotalPay() {
    if (assignments.length === 0) {
      totalDaysDisplay.textContent = '0';
      totalPayDisplay.textContent = '0.00';
      return { days: 0, pay: 0 };
    }
    
    const totalDays = assignments.length;
    const totalPay = assignments.reduce((sum, assignment) => sum + assignment.payRate, 0);
    
    totalDaysDisplay.textContent = totalDays;
    totalPayDisplay.textContent = totalPay.toFixed(2);
    
    return { days: totalDays, pay: totalPay };
  }

  function displayAssignments() {
    // Clear the list
    assignmentsList.innerHTML = '';
    
    // Show/hide no assignments message
    if (assignments.length === 0) {
      noAssignmentsMessage.style.display = 'block';
      assignmentsSummary.style.display = 'none';
      return;
    }
    
    // Hide no assignments message and show summary
    noAssignmentsMessage.style.display = 'none';
    assignmentsSummary.style.display = 'block';
    
    // Sort assignments by date (newest first)
    const sortedAssignments = [...assignments].sort((a, b) => 
      new Date(b.date) - new Date(a.date));
    
    // Create assignment items
    sortedAssignments.forEach(assignment => {
      const assignmentItem = document.createElement('div');
      assignmentItem.className = 'assignment-item';
      assignmentItem.innerHTML = `
        <div class="assignment-header">
          <div class="assignment-school">${assignment.schoolName}</div>
          <div class="assignment-date">${formatDate(assignment.date)}</div>
        </div>
        <div class="assignment-content">
          <div class="assignment-details">
            <div class="assignment-detail">
              <div class="detail-label">Time</div>
              <div class="detail-value">${assignment.startTime} - ${assignment.endTime}</div>
            </div>
            <div class="assignment-detail">
              <div class="detail-label">Pay Point</div>
              <div class="detail-value">${assignment.payPoint}</div>
            </div>
            <div class="assignment-detail">
              <div class="detail-label">Pay</div>
              <div class="detail-value">$${assignment.payRate.toFixed(2)}</div>
            </div>
          </div>
          <div class="assignment-actions">
            <button class="btn btn-danger btn-icon remove-assignment" data-id="${assignment.id}">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      `;
      
      assignmentsList.appendChild(assignmentItem);
      
      // Add event listener to remove button
      const removeBtn = assignmentItem.querySelector('.remove-assignment');
      removeBtn.addEventListener('click', function() {
        removeAssignment(this.getAttribute('data-id'));
      });
    });
    
    // Update total pay calculation
    calculateTotalPay();
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Setup event listeners for assignments
  function setupAssignmentsEvents() {
    // Add to assignments button
    addToAssignmentsBtn.addEventListener('click', function() {
      const schoolName = searchBoxCalc.value;
      const startTime = startTimeInput.value;
      const endTime = endTimeInput.value;
      const payPoint = pointDisplay.textContent;
      const payRate = rateDisplay.textContent;
      const assignmentDate = assignmentDatePicker.value;
      
      // Validate that we have a calculation
      if (!payPoint || payPoint === "0" || !payRate || payRate === "0.00") {
        showError(errorCalc, "Please calculate a rate first");
        return;
      }
      
      // Add the assignment
      addAssignment(schoolName, startTime, endTime, payPoint, payRate, assignmentDate);
      
      // Show success message
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-check"></i> Added!';
      this.classList.add('btn-success');
      this.classList.remove('btn-secondary');
      
      // Reset button after 2 seconds
      setTimeout(() => {
        this.innerHTML = originalText;
        this.classList.remove('btn-success');
        this.classList.add('btn-secondary');
      }, 2000);
    });
    
    // Clear all assignments button
    clearAllAssignmentsBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all assignments? This cannot be undone.')) {
        clearAllAssignments();
      }
    });
    
    // Generate PDF of all assignments
    generateAssignmentsPDFBtn.addEventListener('click', function() {
      generateAssignmentsPDF();
    });
  }

  // Setup event listeners for calculator tab
  function setupCalculatorEvents() {
    // Calculate button
    calculateBtn.addEventListener('click', function() {
      const schoolName = searchBoxCalc.value;
      const startTime = startTimeInput.value;
      const endTime = endTimeInput.value;
      
      if (validateCalculatorInputs(schoolName, startTime, endTime)) {
        const result = calculateRate(schoolName, startTime, endTime);
        
        // Reset date picker to today when calculating
        if (assignmentDatePicker) {
          assignmentDatePicker.valueAsDate = new Date();
        }
        
        // Enable the PDF and Add to Assignments buttons after successful calculation
        if (generatePDFButton) {
          generatePDFButton.removeAttribute('disabled');
          generatePDFButton.classList.add('active');
        }
        
        if (addToAssignmentsBtn) {
          addToAssignmentsBtn.removeAttribute('disabled');
          addToAssignmentsBtn.classList.add('active');
        }
      }
    });
    
    // Toggle explanation details
    if (toggleExplanation && explanationDetails) {
      toggleExplanation.addEventListener('click', function() {
        if (explanationDetails.style.display === 'none' || !explanationDetails.style.display) {
          explanationDetails.style.display = 'block';
          this.innerHTML = '<i class="fas fa-times-circle"></i> Hide details';
        } else {
          explanationDetails.style.display = 'none';
          this.innerHTML = '<i class="fas fa-info-circle"></i> How was this calculated?';
        }
      });
    }
    
    // Reset button
    resetButtonCalc.addEventListener('click', function() {
      searchBoxCalc.value = '';
      startTimeInput.value = '';
      endTimeInput.value = '';
      pointDisplay.textContent = '0';
      instructionalDisplay.textContent = '0';
      rateDisplay.textContent = '0.00';
      clearError(errorCalc);
      
      // Reset the explanation details
      totalTimeDisplay.textContent = '0 mins';
      recessTimeDisplay.textContent = '0 mins';
      lunchTimeDisplay.textContent = '0 mins';
      instrMinutesDisplay.textContent = '0 mins';
      pointCalcDisplay.textContent = '0 mins ÷ 300 = 0';
      minRuleDisplay.textContent = 'None';
      finalCalcDisplay.textContent = `$${BASE_PAY_RATE.toFixed(2)} × 0 = $0.00`;
      document.getElementById('min-pay-applied').style.display = 'none';
      
      // Reset the result circle
      const resultCircle = document.querySelector('.result-circle');
      if (resultCircle) {
        resultCircle.style.background = `conic-gradient(var(--primary-color) 0% 0%, #f0f0f0 0% 100%)`;
      }
      
      // Reset timeline
      if (calcTimeline) {
        calcTimeline.setTimes(null, null);
      }
      
      // Disable the PDF and Add to Assignments buttons
      if (generatePDFButton) {
        generatePDFButton.setAttribute('disabled', '');
        generatePDFButton.classList.remove('active');
      }
      
      if (addToAssignmentsBtn) {
        addToAssignmentsBtn.setAttribute('disabled', '');
        addToAssignmentsBtn.classList.remove('active');
      }
      
      // Hide explanation details
      explanationDetails.style.display = 'none';
    });
  }

  // Generate PDF with all assignments
  function generateAssignmentsPDF() {
    // Check if there are assignments to export
    if (assignments.length === 0) {
      alert("No assignments to export. Please add assignments first.");
      return;
    }

    const { days, pay } = calculateTotalPay();
    const sortedAssignments = [...assignments].sort((a, b) => 
      new Date(b.date) - new Date(a.date));
    
    // Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185); // Primary color
    doc.text('YRDSB OT Assignments Summary', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Days: ${days}`, 20, 40);
    doc.text(`Total Pay: $${pay.toFixed(2)}`, 20, 50);
    
    // Create table for assignments
    const tableColumn = ["Date", "School", "Time", "Pay Point", "Pay"];
    const tableRows = [];
    
    // Add data to table rows
    sortedAssignments.forEach(item => {
      const formattedDate = new Date(item.date).toLocaleDateString();
      const row = [
        formattedDate,
        item.schoolName,
        `${item.startTime} - ${item.endTime}`,
        item.payPoint.toString(),
        `$${item.payRate.toFixed(2)}`
      ];
      tableRows.push(row);
    });
    
    // Create the table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [200, 200, 200]
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      }
    });
    
    // Add monthly breakdown if there are more than 1 day
    if (days > 1) {
      // Calculate earnings by month
      const monthlyBreakdown = sortedAssignments.reduce((acc, assignment) => {
        const monthYear = new Date(assignment.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        if (!acc[monthYear]) {
          acc[monthYear] = {
            days: 0,
            pay: 0
          };
        }
        
        acc[monthYear].days += 1;
        acc[monthYear].pay += assignment.payRate;
        
        return acc;
      }, {});
      
      // Get monthly data for table
      const monthlyHeaders = ["Month", "Days", "Pay"];
      const monthlyRows = Object.entries(monthlyBreakdown).map(([month, data]) => [
        month,
        data.days,
        `$${data.pay.toFixed(2)}`
      ]);
      
      // Add monthly breakdown table
      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Monthly Breakdown', 105, finalY, { align: 'center' });
      
      doc.autoTable({
        head: [monthlyHeaders],
        body: monthlyRows,
        startY: finalY + 10,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineColor: [200, 200, 200]
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
    }
    
    // Add footer with app information
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by YRDSB OT Daily Rate Calculator', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`YRDSB_OT_Assignments_Summary.pdf`);
  }

  // PDF Export functionality
  const pdfExportBtn = document.getElementById('generatePDF');
  if (pdfExportBtn) {
    pdfExportBtn.addEventListener('click', function() {
      generatePDF();
    });
  }
  
  // Generate PDF report of the calculation
  function generatePDF() {
    // Check if there's a calculation to export
    if (!pointDisplay.textContent || pointDisplay.textContent === "0") {
      showError(errorCalc, "Please calculate a rate before generating a PDF");
      return;
    }

    const schoolName = searchBoxCalc.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    
    // Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185); // Primary color
    doc.text('YRDSB OT Daily Rate Calculation', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    
    // School and time information
    doc.setFontSize(14);
    doc.text('Assignment Details', 20, 45);
    doc.setFontSize(12);
    doc.text(`School: ${schoolName}`, 20, 55);
    doc.text(`Assignment Time: ${startTime} - ${endTime}`, 20, 65);
    
    // Calculation breakdown
    doc.setFontSize(14);
    doc.text('Calculation Breakdown', 20, 80);
    doc.setFontSize(12);
    doc.text(`Total Time: ${totalTimeDisplay.textContent}`, 20, 90);
    doc.text(`Recess Time: ${recessTimeDisplay.textContent}`, 20, 100);
    doc.text(`Lunch Time: ${lunchTimeDisplay.textContent}`, 20, 110);
    doc.text(`Instructional Time: ${instrMinutesDisplay.textContent}`, 20, 120);
    doc.text(`Pay Point Calculation: ${pointCalcDisplay.textContent}`, 20, 130);
    
    // Minimum rule applied (if any)
    if (minRuleDisplay.textContent !== "None") {
      doc.text(`Minimum Rule Applied: ${minRuleDisplay.textContent}`, 20, 140);
    }
    
    // Final calculation
    doc.text(`Final Calculation: ${finalCalcDisplay.textContent}`, 20, minRuleDisplay.textContent !== "None" ? 150 : 140);
    
    // Results section
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185); // Primary color
    doc.text('Final Results', 105, minRuleDisplay.textContent !== "None" ? 165 : 155, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pay Point: ${pointDisplay.textContent}`, 105, minRuleDisplay.textContent !== "None" ? 175 : 165, { align: 'center' });
    doc.text(`Pay Rate: $${rateDisplay.textContent}`, 105, minRuleDisplay.textContent !== "None" ? 185 : 175, { align: 'center' });
    
    // Add footer with app information
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by YRDSB OT Daily Rate Calculator', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`YRDSB_OT_Rate_${schoolName.replace(/\s+/g, '_')}.pdf`);
  }

  // Setup tab navigation
  function setupTabs() {
    calculatorTab.addEventListener('click', function() {
      calculatorPage.style.display = 'block';
      schoolInfoPage.style.display = 'none';
      assignmentsPage.style.display = 'none';
      calculatorTab.classList.add('active');
      infoTab.classList.remove('active');
      assignmentsTab.classList.remove('active');
    });
    
    infoTab.addEventListener('click', function() {
      calculatorPage.style.display = 'none';
      schoolInfoPage.style.display = 'block';
      assignmentsPage.style.display = 'none';
      infoTab.classList.add('active');
      calculatorTab.classList.remove('active');
      assignmentsTab.classList.remove('active');
    });
    
    assignmentsTab.addEventListener('click', function() {
      calculatorPage.style.display = 'none';
      schoolInfoPage.style.display = 'none';
      assignmentsPage.style.display = 'block';
      assignmentsTab.classList.add('active');
      calculatorTab.classList.remove('active');
      infoTab.classList.remove('active');
      
      // Refresh assignments display when switching to the tab
      displayAssignments();
    });
  }

  // Handle school selection update
  function updateSchool(schoolName) {
    if (schoolDict[schoolName]) {
      currentSchool = schoolDict[schoolName];
      
      // Update the timeline for calculator
      if (timelineContainer) {
        if (!calcTimeline) {
          calcTimeline = new SchoolTimeline(timelineContainer, currentSchool);
          calcTimeline.render();
          
          // Connect timeline to time inputs
          calcTimeline.onChange = function(startTime, endTime) {
            if (startTime) startTimeInput.value = startTime;
            if (endTime) endTimeInput.value = endTime;
          };
        } else {
          calcTimeline.school = currentSchool;
          calcTimeline.render();
        }
      }
      
      clearError(errorCalc);
      
      // Set default times based on school schedule
      setPresetTimes('full-day');
    }
  }
  
  // Calculate the pay rate with detailed breakdown
  function calculateRate(schoolName, startTime, endTime) {
    if (!schoolDict[schoolName]) {
      showError(errorCalc, "Please select a valid school");
      return;
    }
    
    const school = schoolDict[schoolName];
    
    // Validate and adjust times
    const schoolStartTime = timeStringToDate(school.begin);
    const schoolEndTime = timeStringToDate(school.dismiss);
    const teacherStartTime = timeStringToDate(startTime);
    const teacherEndTime = timeStringToDate(endTime);
    
    // Use school times if teacher times are outside school hours
    const finalStartTime = teacherStartTime < schoolStartTime ? school.begin : startTime;
    const finalEndTime = teacherEndTime > schoolEndTime ? school.dismiss : endTime;
    
    // Calculate total time between start and end
    const totalTime = subtractTimesInMinutes(finalStartTime, finalEndTime);
    
    // Calculate recess time to subtract
    let recessMinutes = 0;
    const startTimeDate = timeStringToDate(finalStartTime);
    const endTimeDate = timeStringToDate(finalEndTime);
    const recessStartDate = timeStringToDate(school.recStart);
    const recessEndDate = timeStringToDate(school.recEnd);

    if (startTimeDate < recessStartDate && endTimeDate > recessStartDate) {
      if (endTimeDate <= recessEndDate) {
        recessMinutes = subtractTimesInMinutes(school.recStart, finalEndTime);
      } else {
        recessMinutes = subtractTimesInMinutes(school.recStart, school.recEnd);
      }
    } else if (startTimeDate >= recessStartDate && startTimeDate < recessEndDate) {
      if (endTimeDate <= recessEndDate) {
        recessMinutes = subtractTimesInMinutes(finalStartTime, finalEndTime);
      } else {
        recessMinutes = subtractTimesInMinutes(finalStartTime, school.recEnd);
      }
    }
    
    // Calculate lunch time to subtract
    let lunchMinutes = 0;
    const lunchStartDate = timeStringToDate(school.lunchStart);
    const lunchEndDate = timeStringToDate(school.lunchEnd);

    if (startTimeDate < lunchStartDate && endTimeDate > lunchStartDate) {
      if (endTimeDate <= lunchEndDate) {
        lunchMinutes = subtractTimesInMinutes(school.lunchStart, finalEndTime);
      } else {
        lunchMinutes = subtractTimesInMinutes(school.lunchStart, school.lunchEnd);
      }
    } else if (startTimeDate >= lunchStartDate && startTimeDate < lunchEndDate) {
      if (endTimeDate <= lunchEndDate) {
        lunchMinutes = subtractTimesInMinutes(finalStartTime, finalEndTime);
      } else {
        lunchMinutes = subtractTimesInMinutes(finalStartTime, school.lunchEnd);
      }
    }

    // Subtract non-instructional time
    const instructionalTime = totalTime - recessMinutes - lunchMinutes;
    
    // Calculate pay point (divide by 300 minutes for full day)
    let payPoint = instructionalTime / 300;
    
    // Track which minimum pay rule was applied
    let minRuleApplied = "None";
    
    // Apply minimum pay rules
    if (teacherStartTime < lunchStartDate && teacherEndTime > lunchEndDate && payPoint < 0.7) {
      payPoint = 0.7; // Minimum 0.7 if working through lunch period
      minRuleApplied = "0.7 - Working through lunch period";
    } else if (payPoint < 0.5) {
      payPoint = 0.5; // Minimum 0.5 for any assignment
      minRuleApplied = "0.5 - Minimum for any assignment";
    }
    
    // Calculate actual pay rate
    const payRate = BASE_PAY_RATE * payPoint;
    
    // Update the UI with results
    pointDisplay.textContent = payPoint.toString().length > 5 ? payPoint.toFixed(4) : payPoint;
    instructionalDisplay.textContent = `${instructionalTime} `;
    rateDisplay.textContent = payRate.toFixed(2);
    
    // Update the result circle visualization
    const resultCircle = document.querySelector('.result-circle');
    if (resultCircle) {
      resultCircle.style.background = `conic-gradient(var(--primary-color) 0% ${payPoint * 100}%, #f0f0f0 ${payPoint * 100}% 100%)`;
    }
    
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
  
  // Set preset times for the selected school
  function setPresetTimes(presetType) {
    if (!currentSchool) return;
    
    switch (presetType) {
      case 'full-day':
        startTimeInput.value = currentSchool.begin;
        endTimeInput.value = currentSchool.dismiss;
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
    
    // Update timeline if it exists
    if (calcTimeline) {
      calcTimeline.setTimes(startTimeInput.value, endTimeInput.value);
    }
  }
  
  // Show school information
  function showSchoolInfo(schoolName) {
    if (!schoolDict[schoolName]) {
      showError(errorInfo, "Please select a valid school");
      return;
    }
    
    const school = schoolDict[schoolName];
    
    // Update the display
    schoolNameDisplay.textContent = schoolName;
    instStartDisplay.textContent = school.begin;
    instEndDisplay.textContent = school.dismiss;
    recessDisplay.textContent = `${school.recStart} - ${school.recEnd}`;
    lunchDisplay.textContent = `${school.lunchStart} - ${school.lunchEnd}`;
    
    // Update info timeline if it exists
    if (infoTimelineContainer) {
      if (!infoTimeline) {
        infoTimeline = new SchoolTimeline(infoTimelineContainer, school);
        infoTimeline.render();
      } else {
        infoTimeline.school = school;
        infoTimeline.render();
      }
    }
  }
  
  // Error handling functions
  function showError(element, message) {
    if (element) {
      element.textContent = message;
      element.style.display = "block";
    }
  }
  
  function clearError(element) {
    if (element) {
      element.textContent = "";
      element.style.display = "none";
    }
  }
  
  // Validation functions
  function validateCalculatorInputs(schoolName, startTime, endTime) {
    clearError(errorCalc);
    
    if (!schoolName) {
      showError(errorCalc, "Please select a school");
      return false;
    }
    
    if (!schoolDict[schoolName]) {
      showError(errorCalc, "Please select a valid school from the dropdown");
      return false;
    }
    
    if (!startTime) {
      showError(errorCalc, "Please enter a start time");
      return false;
    }
    
    if (!endTime) {
      showError(errorCalc, "Please enter an end time");
      return false;
    }
    
    // Validate time sequence
    const startDate = timeStringToDate(startTime);
    const endDate = timeStringToDate(endTime);
    
    if (startDate >= endDate) {
      showError(errorCalc, "End time must be after start time");
      return false;
    }
    
    return true;
  }
  
  function validateInfoInput(schoolName) {
    clearError(errorInfo);
    
    if (!schoolName) {
      showError(errorInfo, "Please enter a school name");
      return false;
    }
    
    if (!schoolDict[schoolName]) {
      showError(errorInfo, "Please select a valid school from the dropdown");
      return false;
    }
    
    return true;
  }
  
  // Helper function to debounce input events
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }

  // Setup theme toggle
  function setupThemeToggle() {
    if (!themeToggle) return;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.checked = true;
    } else if (savedTheme === 'light') {
      document.body.classList.remove('dark-mode');
      themeToggle.checked = false;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
      themeToggle.checked = true;
    }
    
    // Toggle theme on change
    themeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }
  
  // Setup outside clicks for dropdowns
  function setupOutsideClicks() {
    document.addEventListener('click', function(event) {
      // Close dropdowns when clicking outside
      if (!dropdownCalc.contains(event.target) && event.target !== searchBoxCalc) {
        dropdownCalc.style.display = 'none';
      }
      
      if (!dropdownInfo.contains(event.target) && event.target !== searchBoxInfo) {
        dropdownInfo.style.display = 'none';
      }
    });
  }
  
  // Setup event listeners for school info page
  function setupInfoEvents() {
    // Search button
    searchButtonInfo.addEventListener('click', function() {
      const schoolName = searchBoxInfo.value;
      
      if (validateInfoInput(schoolName)) {
        showSchoolInfo(schoolName);
      }
    });
    
    // Reset button
    resetButtonInfo.addEventListener('click', function() {
      searchBoxInfo.value = '';
      schoolNameDisplay.textContent = '-';
      instStartDisplay.textContent = '-';
      instEndDisplay.textContent = '-';
      recessDisplay.textContent = '-';
      lunchDisplay.textContent = '-';
      clearError(errorInfo);
    });
  }

  // Initialize the application
  async function init() {
    // Load school data
    await loadSchools();
    
    // Setup autocomplete for both search boxes
    setupAutocomplete(searchBoxCalc, dropdownCalc);
    setupAutocomplete(searchBoxInfo, dropdownInfo);
    
    // Set default date to today
    if (assignmentDatePicker) {
      assignmentDatePicker.valueAsDate = new Date();
    }
    
    // Setup event handlers
    setupCalculatorEvents();
    setupInfoEvents();
    setupTabs();
    setupThemeToggle();
    setupOutsideClicks();
    setupAssignmentsEvents();
    
    // Load saved assignments from local storage
    loadAssignments();
    displayAssignments();
    
    console.log('Application initialized');
  }
  
  // Start the application
  init();
});