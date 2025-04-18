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
  const calculatorPage = document.getElementById('calculator-page');
  const schoolInfoPage = document.getElementById('school-info-page');
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  
  // Handle mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      appNav.classList.toggle('active');
    });
    
    // Close mobile menu when a navigation item is clicked
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          appNav.classList.remove('active');
        }
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideNav = appNav.contains(event.target);
      const isClickOnToggle = mobileMenuToggle.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnToggle && appNav.classList.contains('active')) {
        appNav.classList.remove('active');
      }
    });
  }
  
  // Constants
  const BASE_PAY_RATE = 286.38;
  
  // Utility Functions
  function timeStringToDate(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  function subtractTimesInMinutes(startTime, endTime) {
    const startDate = timeStringToDate(startTime);
    const endDate = timeStringToDate(endTime);
    
    let diffMs = endDate - startDate;
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000; // Add 24 hours for next-day times
    }
    
    return Math.floor(diffMs / (1000 * 60));
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
    let activeIndex = -1;
    let filteredSchools = [];
    
    searchBox.addEventListener('input', debounce(function() {
      const input = searchBox.value.toLowerCase();
      dropdown.innerHTML = '';
      filteredSchools = [];
      activeIndex = -1;
      
      if (!input) {
        dropdown.style.display = 'none';
        return;
      }
      
      filteredSchools = schoolNames.filter(name => 
        name.toLowerCase().includes(input)
      );
      
      if (filteredSchools.length > 0) {
        dropdown.style.display = 'block';
        
        filteredSchools.forEach((name, index) => {
          const option = document.createElement('div');
          option.className = 'autocomplete-item';
          
          // Highlight matching text
          const matchIndex = name.toLowerCase().indexOf(input.toLowerCase());
          if (matchIndex !== -1) {
            const before = name.substring(0, matchIndex);
            const match = name.substring(matchIndex, matchIndex + input.length);
            const after = name.substring(matchIndex + input.length);
            option.innerHTML = before + '<strong>' + match + '</strong>' + after;
          } else {
            option.textContent = name;
          }
          
          option.addEventListener('click', function() {
            searchBox.value = name;
            dropdown.style.display = 'none';
            
            if (searchBox === searchBoxCalc) {
              updateSchool(name);
            }
          });
          
          option.addEventListener('mouseover', function() {
            activeIndex = index;
            highlightOption(dropdown, index);
          });
          
          dropdown.appendChild(option);
        });
      } else {
        dropdown.style.display = 'none';
      }
    }, 200));
    
    // Keyboard navigation
    searchBox.addEventListener('keydown', function(e) {
      const items = dropdown.querySelectorAll('.autocomplete-item');
      
      if (!items.length) return;
      
      // Down arrow
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex < items.length - 1) ? activeIndex + 1 : 0;
        highlightOption(dropdown, activeIndex);
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
      // Up arrow
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex > 0) ? activeIndex - 1 : items.length - 1;
        highlightOption(dropdown, activeIndex);
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
      // Enter key
      else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        searchBox.value = filteredSchools[activeIndex];
        dropdown.style.display = 'none';
        
        if (searchBox === searchBoxCalc) {
          updateSchool(filteredSchools[activeIndex]);
        }
      }
      // Escape key
      else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
        activeIndex = -1;
      }
    });
  }
  
  function highlightOption(dropdown, index) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach(item => item.classList.remove('active'));
    
    if (index >= 0 && index < items.length) {
      items[index].classList.add('active');
    }
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
    
    switch(presetType) {
      case 'full-day':
        // Add 15 mins before and after instructional time for full day
        const startHour = parseInt(currentSchool.begin.split(':')[0]);
        const startMin = parseInt(currentSchool.begin.split(':')[1]);
        const endHour = parseInt(currentSchool.dismiss.split(':')[0]);
        const endMin = parseInt(currentSchool.dismiss.split(':')[1]);
        
        // Calculate 15 minutes before start time
        let beforeStartMin = startMin - 15;
        let beforeStartHour = startHour;
        if (beforeStartMin < 0) {
          beforeStartMin += 60;
          beforeStartHour -= 1;
        }
        
        // Calculate 15 minutes after end time
        let afterEndMin = endMin + 15;
        let afterEndHour = endHour;
        if (afterEndMin >= 60) {
          afterEndMin -= 60;
          afterEndHour += 1;
        }
        
        // Format the times as HH:MM
        const fullStartTime = `${beforeStartHour.toString().padStart(2, '0')}:${beforeStartMin.toString().padStart(2, '0')}`;
        const fullEndTime = `${afterEndHour.toString().padStart(2, '0')}:${afterEndMin.toString().padStart(2, '0')}`;
        
        startTimeInput.value = fullStartTime;
        endTimeInput.value = fullEndTime;
        break;
      case 'am-only':
        startTimeInput.value = currentSchool.begin;
        endTimeInput.value = currentSchool.lunchStart;
        break;
      case 'pm-only':
        startTimeInput.value = currentSchool.lunchEnd;
        endTimeInput.value = currentSchool.dismiss;
        break;
      default:
        return;
    }
    
    // Update timeline if available
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
    
    // Update the school info displays
    schoolNameDisplay.textContent = schoolName;
    instStartDisplay.textContent = school.begin;
    instEndDisplay.textContent = school.dismiss;
    recessDisplay.textContent = `${school.recStart} - ${school.recEnd}`;
    lunchDisplay.textContent = `${school.lunchStart} - ${school.lunchEnd}`;
    
    // Update the timeline for school info
    if (infoTimelineContainer) {
      if (!infoTimeline) {
        infoTimeline = new SchoolTimeline(infoTimelineContainer, school);
        infoTimeline.render();
      } else {
        infoTimeline.school = school;
        infoTimeline.render();
      }
    }
    
    clearError(errorInfo);
  }
  
  // Error handling functions
  function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }
  
  function clearError(element) {
    element.textContent = '';
    element.style.display = 'none';
  }
  
  // Validation functions
  function validateCalculatorInputs(schoolName, startTime, endTime) {
    if (!schoolName || !startTime || !endTime) {
      showError(errorCalc, "Please fill out all fields");
      return false;
    }
    
    if (!schoolNames.includes(schoolName)) {
      showError(errorCalc, "Please enter a valid school name");
      return false;
    }
    
    if (timeStringToDate(startTime) > timeStringToDate(endTime)) {
      showError(errorCalc, "Start time cannot be later than end time");
      return false;
    }
    
    if (timeStringToDate(startTime) < timeStringToDate("07:45") || 
        timeStringToDate(endTime) > timeStringToDate("16:05")) {
      showError(errorCalc, "Please enter a time between 7:45 and 16:05");
      return false;
    }
    
    clearError(errorCalc);
    return true;
  }
  
  function validateInfoInput(schoolName) {
    if (!schoolName) {
      showError(errorInfo, "Please enter a school name");
      return false;
    }
    
    if (!schoolNames.includes(schoolName)) {
      showError(errorInfo, "Please enter a valid school name");
      return false;
    }
    
    clearError(errorInfo);
    return true;
  }
  
  // Helper function to debounce input events
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // Setup event listeners for calculator tab
  function setupCalculatorEvents() {
    // Calculate button
    calculateBtn.addEventListener('click', function() {
      const schoolName = searchBoxCalc.value;
      const startTime = startTimeInput.value;
      const endTime = endTimeInput.value;
      
      if (validateCalculatorInputs(schoolName, startTime, endTime)) {
        calculateRate(schoolName, startTime, endTime);
      }
    });
    
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
      
      // Hide explanation details
      explanationDetails.style.display = 'none';
    });
    
    // Connect input time fields to timeline
    startTimeInput.addEventListener('change', function() {
      if (calcTimeline && this.value) {
        if (!endTimeInput.value) {
          calcTimeline.setTimes(this.value, null);
        } else {
          calcTimeline.setTimes(this.value, endTimeInput.value);
        }
      }
    });
    
    endTimeInput.addEventListener('change', function() {
      if (calcTimeline && startTimeInput.value && this.value) {
        calcTimeline.setTimes(startTimeInput.value, this.value);
      }
    });
    
    // Toggle explanation visibility
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
        if (currentSchool) {
          setPresetTimes(presetType);
        } else {
          showError(errorCalc, "Please select a school first");
        }
      });
    });
  }
  
  // Setup event listeners for info tab
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
      
      // Reset timeline
      if (infoTimeline) {
        infoTimeline.school = null;
        infoTimeline.render();
      }
    });
    
    // Handle search box focus
    searchBoxInfo.addEventListener('focus', function() {
      if (this.value) {
        const event = new Event('input');
        this.dispatchEvent(event);
      }
    });
  }
  
  // Setup tab navigation
  function setupTabs() {
    calculatorTab.addEventListener('click', function() {
      calculatorPage.style.display = 'block';
      schoolInfoPage.style.display = 'none';
      calculatorTab.classList.add('active');
      infoTab.classList.remove('active');
    });
    
    infoTab.addEventListener('click', function() {
      calculatorPage.style.display = 'none';
      schoolInfoPage.style.display = 'block';
      infoTab.classList.add('active');
      calculatorTab.classList.remove('active');
    });
  }
  
  // Setup theme toggling
  function setupThemeToggle() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.checked = true;
    }
    
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
  
  // Setup click-outside functionality for dropdowns
  function setupOutsideClicks() {
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-container')) {
        dropdownCalc.style.display = 'none';
        dropdownInfo.style.display = 'none';
      }
    });
  }
  
  // Add mobile menu toggle functionality
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.app-nav');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });
  }
  
  // Close menu when a nav item is clicked
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        nav.classList.remove('active');
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
      nav.classList.remove('active');
    }
  });

  // Initialize the application
  async function init() {
    // Load school data
    await loadSchools();
    
    // Setup autocomplete for both search boxes
    setupAutocomplete(searchBoxCalc, dropdownCalc);
    setupAutocomplete(searchBoxInfo, dropdownInfo);
    
    // Setup event handlers
    setupCalculatorEvents();
    setupInfoEvents();
    setupTabs();
    setupThemeToggle();
    setupOutsideClicks();
    
    console.log('Application initialized');
  }
  
  // Start the application
  init();
});