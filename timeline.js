/**
 * Visual Timeline Component for YRDSB OT Daily Rate Calculator
 * Displays school day with visual indicators for instructional time, recess, and lunch periods
 */

class SchoolTimeline {
  constructor(container, school) {
    this.container = container;
    this.school = school;
    this.startTime = null;
    this.endTime = null;
    this.timelineWidth = 100; // percentage
    this.dayStartTime = "07:40"; // Changed from 07:45 to 07:40
    this.dayEndTime = "16:05";
    this.onChange = null; // callback for changes
  }

  // Convert time string to minutes since start of day
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Convert minutes to time string
  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }

  // Calculate position percentage based on time
  getPositionPercentage(timeStr) {
    const dayStart = this.timeToMinutes(this.dayStartTime);
    const dayEnd = this.timeToMinutes(this.dayEndTime);
    const dayLength = dayEnd - dayStart;
    const time = this.timeToMinutes(timeStr);
    return ((time - dayStart) / dayLength) * 100;
  }

  // Set selected start and end times
  setTimes(startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.updateSelectionIndicators();
    
    if (this.onChange) {
      this.onChange(startTime, endTime);
    }
  }

  // Update the selection indicators based on current values
  updateSelectionIndicators() {
    if (!this.startHandle || !this.endHandle || !this.selectionRange) return;
    
    if (this.startTime) {
      const startPos = this.getPositionPercentage(this.startTime);
      this.startHandle.style.left = `${startPos}%`;
      this.selectionRange.style.left = `${startPos}%`;
    }
    
    if (this.endTime) {
      const endPos = this.getPositionPercentage(this.endTime);
      this.endHandle.style.left = `${endPos}%`;
      this.selectionRange.style.width = `${endPos - this.getPositionPercentage(this.startTime)}%`;
    }
  }

  // Create and render the timeline
  render() {
    // Clear container
    this.container.innerHTML = "";
    this.container.classList.add("school-timeline");

    // Create timeline container
    const timeline = document.createElement("div");
    timeline.className = "timeline-track";
    
    // Create time markers (hours)
    const timeMarkers = document.createElement("div");
    timeMarkers.className = "time-markers";
    
    // Add 7:40 marker
    const earlyMarker = document.createElement("div");
    earlyMarker.className = "time-marker";
    earlyMarker.textContent = "7:40";
    earlyMarker.style.left = `${this.getPositionPercentage("07:40")}%`;
    timeMarkers.appendChild(earlyMarker);
    
    for (let hour = 8; hour <= 16; hour++) {
      const marker = document.createElement("div");
      marker.className = "time-marker";
      marker.textContent = `${hour}:00`;
      marker.style.left = `${this.getPositionPercentage(hour + ":00")}%`;
      timeMarkers.appendChild(marker);
    }

    // Create school segments (instruction, recess, lunch)
    if (this.school) {
      // Instructional start to recess
      const instrToRecess = document.createElement("div");
      instrToRecess.className = "timeline-segment instructional";
      instrToRecess.style.left = `${this.getPositionPercentage(this.school.begin)}%`;
      instrToRecess.style.width = `${this.getPositionPercentage(this.school.recStart) - this.getPositionPercentage(this.school.begin)}%`;
      instrToRecess.setAttribute("data-tooltip", `Instructional: ${this.school.begin} - ${this.school.recStart}`);
      timeline.appendChild(instrToRecess);
      
      // Recess
      const recess = document.createElement("div");
      recess.className = "timeline-segment recess";
      recess.style.left = `${this.getPositionPercentage(this.school.recStart)}%`;
      recess.style.width = `${this.getPositionPercentage(this.school.recEnd) - this.getPositionPercentage(this.school.recStart)}%`;
      recess.setAttribute("data-tooltip", `Recess: ${this.school.recStart} - ${this.school.recEnd}`);
      timeline.appendChild(recess);
      
      // Recess to lunch
      const recessToLunch = document.createElement("div");
      recessToLunch.className = "timeline-segment instructional";
      recessToLunch.style.left = `${this.getPositionPercentage(this.school.recEnd)}%`;
      recessToLunch.style.width = `${this.getPositionPercentage(this.school.lunchStart) - this.getPositionPercentage(this.school.recEnd)}%`;
      recessToLunch.setAttribute("data-tooltip", `Instructional: ${this.school.recEnd} - ${this.school.lunchStart}`);
      timeline.appendChild(recessToLunch);
      
      // Lunch
      const lunch = document.createElement("div");
      lunch.className = "timeline-segment lunch";
      lunch.style.left = `${this.getPositionPercentage(this.school.lunchStart)}%`;
      lunch.style.width = `${this.getPositionPercentage(this.school.lunchEnd) - this.getPositionPercentage(this.school.lunchStart)}%`;
      lunch.setAttribute("data-tooltip", `Lunch: ${this.school.lunchStart} - ${this.school.lunchEnd}`);
      timeline.appendChild(lunch);
      
      // Lunch to dismissal
      const lunchToDismiss = document.createElement("div");
      lunchToDismiss.className = "timeline-segment instructional";
      lunchToDismiss.style.left = `${this.getPositionPercentage(this.school.lunchEnd)}%`;
      lunchToDismiss.style.width = `${this.getPositionPercentage(this.school.dismiss) - this.getPositionPercentage(this.school.lunchEnd)}%`;
      lunchToDismiss.setAttribute("data-tooltip", `Instructional: ${this.school.lunchEnd} - ${this.school.dismiss}`);
      timeline.appendChild(lunchToDismiss);
    }
    
    // Create selection elements
    this.selectionRange = document.createElement("div");
    this.selectionRange.className = "selection-range";
    timeline.appendChild(this.selectionRange);
    
    this.startHandle = document.createElement("div");
    this.startHandle.className = "time-handle start-handle";
    this.startHandle.setAttribute("data-handle", "start");
    timeline.appendChild(this.startHandle);
    
    this.endHandle = document.createElement("div");
    this.endHandle.className = "time-handle end-handle";
    this.endHandle.setAttribute("data-handle", "end");
    timeline.appendChild(this.endHandle);
    
    // Add draggable functionality for handles
    this.setupDraggableHandles();
    
    // Append to container
    this.container.appendChild(timeline);
    this.container.appendChild(timeMarkers);
    
    // Display current schedule
    this.updateSelectionIndicators();
    
    return this;
  }
  
  // Setup draggable functionality for the timeline handles
  setupDraggableHandles() {
    const self = this;
    let activeHandle = null;
    const dayStart = this.timeToMinutes(this.dayStartTime);
    const dayEnd = this.timeToMinutes(this.dayEndTime);
    const dayLength = dayEnd - dayStart;
    
    // Helper to update time based on mouse position
    function updateTimeFromPosition(e) {
      if (!activeHandle) return;
      
      // Calculate percentage across timeline
      const rect = self.container.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      
      // Convert to time
      const minutesFromStart = (percentage / 100) * dayLength + dayStart;
      const timeStr = self.minutesToTime(Math.round(minutesFromStart / 5) * 5); // Round to nearest 5 minutes
      
      if (activeHandle === self.startHandle) {
        if (!self.endTime || timeStr < self.endTime) {
          self.startTime = timeStr;
        }
      } else if (activeHandle === self.endHandle) {
        if (!self.startTime || timeStr > self.startTime) {
          self.endTime = timeStr;
        }
      }
      
      self.updateSelectionIndicators();
      
      // Trigger callback if available
      if (self.onChange) {
        self.onChange(self.startTime, self.endTime);
      }
    }
    
    // Mouse down on handles
    this.startHandle.addEventListener('mousedown', function(e) {
      activeHandle = self.startHandle;
      e.preventDefault();
    });
    
    this.endHandle.addEventListener('mousedown', function(e) {
      activeHandle = self.endHandle;
      e.preventDefault();
    });
    
    // Mouse move and up for drag behavior
    document.addEventListener('mousemove', function(e) {
      if (activeHandle) {
        updateTimeFromPosition(e);
      }
    });
    
    document.addEventListener('mouseup', function() {
      activeHandle = null;
    });
    
    // Click on timeline to set times
    this.container.addEventListener('click', function(e) {
      if (e.target === self.startHandle || e.target === self.endHandle) return;
      
      // Determine if we're setting start or end time
      if (!self.startTime || (self.startTime && self.endTime)) {
        self.startTime = null;
        self.endTime = null;
        activeHandle = self.startHandle;
        updateTimeFromPosition(e);
      } else {
        activeHandle = self.endHandle;
        updateTimeFromPosition(e);
      }
      
      activeHandle = null;
    });
  }
}