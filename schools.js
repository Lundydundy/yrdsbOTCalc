document.addEventListener("DOMContentLoaded", async () => {

    async function loadSchools() {
        try {
            const response = await fetch('schoolTimes.json'); // Fetch JSON file
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const schools = await response.json(); // Convert response to JSON
            console.log(schools); // Log or use the data
            return schools
        } catch (error) {
            console.error("Error loading schools:", error);
        }
    }

    function timeStringToDate(timeString) {
        const [hours, minutes] = timeString.split(":").map(Number);
        const date = new Date(); // Current date
        date.setHours(hours, minutes, 0, 0); // Set hours and minutes
        return date;
    }

    function subtractTimesInMinutes(startTime, endTime) {
        // Convert time strings to Date objects
        const startDate = timeStringToDate(startTime);
        const endDate = timeStringToDate(endTime);

        // Calculate the difference in milliseconds
        let diffMs = endDate - startDate;

        // Handle case where endTime is on the next day
        if (diffMs < 0) {
            diffMs += 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
        }

        // Convert milliseconds to minutes
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        return diffMinutes;
    }

    const calculate = (schoolName, start, end) => {
        const pay = 286.38
        const school = schoolDict[schoolName];

        console.log(school);

        const startTime = timeStringToDate(school.begin) > timeStringToDate(start) ? school.begin : start;
        const endTime = timeStringToDate(school.dismiss) < timeStringToDate(end) ? school.dismiss : end;

        const recessTime = startTime < school.recStart || startTime > school.recEnd ? subtractTimesInMinutes(school.recStart, school.recEnd) : subtractTimesInMinutes(startTime, school.recEnd);
        const lunchTime = startTime < school.lunchStart || startTime > school.lunchEnd ? subtractTimesInMinutes(school.lunchStart, school.lunchEnd) : subtractTimesInMinutes(startTime, school.lunchEnd);

        console.log("startTime:", startTime, "\nendTime:", endTime, "\nrecessTime:", recessTime, "\nlunchTime:", lunchTime);

        let instructionalTime = subtractTimesInMinutes(startTime, endTime);
        if (startTime < school.recStart || (startTime > school.recStart && startTime < school.recEnd)) instructionalTime -= recessTime;
        if (startTime < school.lunchStart || (startTime > school.lunchStartStart && startTime < school.lunchEnd)) instructionalTime -= lunchTime;

        console.log("instructionalTime:", instructionalTime);

        let payPoint = instructionalTime / 300;

        console.log(payPoint);

        // if the user starts before lunch and finishes after lunch or works less than 0.5
        if (timeStringToDate(start) < timeStringToDate(school.lunchStart) && timeStringToDate(end) > timeStringToDate(school.lunchEnd) && payPoint < 0.7) {
            payPoint = 0.7;
        } else if (payPoint < 0.5) {
            payPoint = 0.5;
        }

        console.log(payPoint.toFixed(1));

        console.log(parseFloat(pay * payPoint).toFixed(2));

        document.getElementById("point").textContent = payPoint.toString().length > 5 ? payPoint.toFixed(4) : payPoint;
        document.getElementById("instructional").textContent = `${instructionalTime} mins`;
        document.getElementById("rate").textContent = parseFloat(pay * payPoint).toFixed(2);

    }

    const checkForErrors = (schoolName, start, end, page) => {
        if (page === "Calc") {
            if (!schoolName || !start || !end) {
                document.getElementById(`error${page}`).textContent = "Please fill out all fields";
                return false;
            }

            if (!schoolNames.includes(schoolName)) {
                document.getElementById(`error${page}`).textContent = "Please enter a valid school name";
                return false;
            }

            if (timeStringToDate(start) > timeStringToDate(end)) {
                document.getElementById(`error${page}`).textContent = "Start time cannot be later than end time. Make sure to use 24 hour time.";
                return false;
            }

            if (timeStringToDate(start) < timeStringToDate("07:45") || timeStringToDate(end) > timeStringToDate("16:05")) {
                document.getElementById(`error${page}`).textContent = "Please enter a time between 7:45 and 16:05. Make sure to use 24 hour time.";
                return false;
            }

            document.getElementById(`error${page}`).textContent = "";

            return true;

        } else {
            if (!schoolName) {
                document.getElementById(`error${page}`).textContent = "Please fill out all fields";
                return false;
            }

            if (!schoolNames.includes(schoolName)) {
                document.getElementById(`error${page}`).textContent = "Please enter a valid school name";
                return false;
            }

            document.getElementById(`error${page}`).textContent = "";

            return true;
        }

    }

    const schoolNames = [
        "Adrienne Clarkson", "Aldergrove", "Alexander Muir", "Anne Frank", "Armadale",
        "Armitage Village", "Ashton Meadows", "Aurora Grove", "Aurora Heights", "Bakersfield",
        "Ballantrae", "Barbara Reid", "Baythorn", "Bayview Fairways", "Bayview Glen",
        "Bayview Hill", "Beckett Farm", "Beverley Acres", "Beynon Fields", "Black River",
        "Black Walnut", "Blue Willow", "Bogart", "Bond Lake", "Boxwood", "Brownridge",
        "Burrlington Outdoor", "Buttonville", "Carrville Mills", "Castlemore", "Cedarwood",
        "Central Park", "Charles Howitt", "Charlton", "Clearmeadow", "Coledale", "Coppard Glen",
        "Cornell Village", "Crosby Heights", "Crossland", "David Suzuki", "Deer Park", "Denne",
        "Devins Drive", "Discovery", "Donald Cousens", "Doncrest", "Dr. Roberta Bondar",
        "E.J. Sand", "Edward T. Crowle", "Elder's Mills", "Ellen Fairclough", "Fairwood",
        "Forest Run", "Fossil Hill", "Franklin Street", "Fred Varley", "German Mills",
        "Giant Steps Program", "Glad Park", "Glen Cedar", "Glen Shields", "Glenn Gould",
        "Greensborough", "H.G. Bernard", "Harry Bowes", "Hartman", "Henderson Avenue",
        "Herbert H. Carnegie", "Highgate", "Highview", "Holland Landing", "J.L.R. Bell",
        "James Robinson", "Jersey", "John McCrae", "Johnny Lombardi", "Johnsview Village",
        "Joseph A. Gibson", "Julliard", "Keswick", "Kettle Lakes", "Kettleby", "King City",
        "Kleinburg", "Lake Simcoe", "Lake Wilcox", "Lakeside", "Legacy", "Lester B. Pearson",
        "Lincoln Alexander", "Little Rouge", "Lorna Jackson", "Louis-Honore Frechette",
        "Mackenzie Glen", "MacLeod's Landing", "Maple Creek", "Maple Leaf", "Markham Gateway",
        "Mazo de la Roche", "Meadowbrook", "Michaëlle Jean", "Michael Cranny", "Milliken Mills",
        "Milne Outdoor", "Moraine Hills", "Morning Glory", "Mount Albert", "Mount Joy",
        "Nellie McClung", "Nobleton", "Nokiidaa", "Northern Lights", "O.M. MacKillop",
        "Oak Ridges", "Oscar Peterson", "Park Avenue", "Parkland", "Parkview", "Phoebe Gilman",
        "Pierre Berton", "Pine Grove", "Pleasantville", "Poplar Bank", "Prince Charles",
        "Queensville", "R.L. Graham", "Ramer Wood", "Randall", "Red Maple", "Redstone",
        "Reesor Park", "Regency Acres", "Richmond Rose", "Rick Hansen", "Robert Munsch",
        "Rogers", "Romeo Dallaire", "Rosedale Heights", "Roselawn", "Ross Doan", "Rouge Park",
        "Roy H. Crosby", "Sam Chapman", "Schomberg", "Sharon", "Sibbald Pt Outdoor",
        "Silver Pines", "Silver Stream", "Sir Wilfrid Laurier", "Sixteenth Avenue",
        "Stonebridge", "Stonehaven", "Stornoway Cres.", "Stuart Scott", "Summitview",
        "Sutton", "Swan Lake Outdoor", "Tanya Khan", "Terry Fox", "Teston Village", "Thornhill",
        "Thornhill Woods", "Trillium Woods", "Unionville", "Unionville Meadows", "Vellore Woods",
        "Ventura Park", "Victoria Square", "Viola Desmond", "Vivian Outdoor", "W.J. Watson",
        "Waabgon Gamig FNS", "Walter Scott", "Wellington", "Wendat Village", "Westminster",
        "Whispering Pines", "Whitchurch Highlands", "Wilclay", "William Armstrong",
        "William Berczy", "Willowbrook", "Wilshire", "Windham Ridge", "Wismer", "Woodbridge",
        "Woodland", "York Academy 0158", "York Academy 2614", "York Academy 3950",
        "York Academy 4358", "York Academy 8095", "York Academy 8132", "Yorkhill",
        "YRDSB Elem Virtual School"
    ];

    const schoolDict = await loadSchools();

    const searchBoxCalc = document.getElementById("searchBoxCalc");
    const searchBoxInfo = document.getElementById("searchBoxInfo");

    const dropdownCalc = document.getElementById("dropdownCalc");
    const dropdownInfo = document.getElementById("dropdownInfo");


    searchBoxCalc.addEventListener("input", function () {
        const input = this.value.toLowerCase();
        dropdownCalc.innerHTML = "";
        if (!input) {
            dropdownCalc.style.display = "none";
            return;
        }

        const filtered = schoolNames.filter(name => name.toLowerCase().includes(input));

        if (filtered.length > 0) {
            dropdownCalc.style.display = "block";
            filtered.forEach(name => {
                const option = document.createElement("div");
                option.textContent = name;
                option.addEventListener("click", function () {
                    searchBoxCalc.value = name;
                    dropdownCalc.style.display = "none";
                });
                dropdownCalc.appendChild(option);
            });
        } else {
            dropdownCalc.style.display = "none";
        }
    });

    searchBoxInfo.addEventListener("input", function () {
        const input = this.value.toLowerCase();
        dropdownInfo.innerHTML = "";
        if (!input) {
            dropdownInfo.style.display = "none";
            return;
        }

        const filtered = schoolNames.filter(name => name.toLowerCase().includes(input));

        if (filtered.length > 0) {
            dropdownInfo.style.display = "block";
            filtered.forEach(name => {
                const option = document.createElement("div");
                option.textContent = name;
                option.addEventListener("click", function () {
                    searchBoxInfo.value = name;
                    dropdownInfo.style.display = "none";
                });
                dropdownInfo.appendChild(option);
            });
        } else {
            dropdownInfo.style.display = "none";
        }
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".autocomplete-container")) {
            dropdownCalc.style.display = "none";
        }
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".autocomplete-container-2")) {
            dropdownInfo.style.display = "none";
        }
    });

    document.getElementById("searchButton").addEventListener("click", () => {

        const schoolName = document.getElementById("searchBoxCalc").value;
        const start = document.getElementById("startTime").value;
        const end = document.getElementById("endTime").value;

        if (!checkForErrors(schoolName, start, end, "Calc")) return;

        calculate(schoolName, start, end);
    })

    document.getElementById("resetButtonCalc").addEventListener("click", () => {
        document.getElementById("searchBoxCalc").value = "";
        document.getElementById("startTime").value = "";
        document.getElementById("endTime").value = "";
        document.getElementById("point").textContent = "0";
        document.getElementById("instructional").textContent = "0";
        document.getElementById("rate").textContent = "0";
        document.getElementById("errorCalc").textContent = "";

    })

    document.getElementById("resetButtonInfo").addEventListener("click", () => {
        document.getElementById("searchBoxInfo").value = "";
        document.getElementById("schoolName").textContent = "";
        document.getElementById("InstStart").textContent = "";
        document.getElementById("InstEnd").textContent = "";
        document.getElementById("Recess").textContent = "";
        document.getElementById("Lunch").textContent = "";
        document.getElementById("errorInfo").textContent = "";

    })

    document.getElementById("switch").addEventListener("change", () => {
        document.querySelector("body").style.backgroundColor = document.querySelector("body").style.backgroundColor === "black" ? "white" : "black";
        document.querySelector("body").style.color = document.querySelector("body").style.color === "rgb(249, 249, 249)" ? "black" : "rgb(249, 249, 249)";
        document.querySelector("#dropdownCalc").style.backgroundColor = document.querySelector("#dropdownCalc").style.backgroundColor === "black" ? "white" : "black";
        document.querySelector("#dropdownInfo").style.backgroundColor = document.querySelector("#dropdownInfo").style.backgroundColor === "black" ? "white" : "black";
        document.querySelectorAll("input").forEach((input) => {
            input.style.backgroundColor = input.style.backgroundColor === "rgb(48, 48, 48)" ? "white" : "rgb(48, 48, 48)";
            input.style.color = input.style.backgroundColor === "rgb(48, 48, 48)" ? "white" : "rgb(48, 48, 48)";
            input.style.setProperty("--placeholder-color", input.style.backgroundColor === "rgb(48, 48, 48)" ? "rgb(227, 227, 227)" : "rgb(100, 100, 100)")
        })
        document.querySelectorAll("button").forEach((button) => {
            button.style.color = document.querySelector("body").style.backgroundColor === "black" ? "rgb(211, 208, 208)" : "white";
        })
        document.querySelectorAll("#searchButton, #searchButtonInfo").forEach((button) => {
            button.style.backgroundColor = document.querySelector("body").style.backgroundColor === "black" ? "rgb(55, 125, 58)" : "rgb(76, 175, 80)";
        })
        document.querySelectorAll(".reset").forEach((button) => {
            button.style.backgroundColor = document.querySelector("body").style.backgroundColor === "black" ? "rgb(136, 16, 8)" : "rgb(234, 20, 6)";
        })
    })

    document.getElementById("calculator-page-btn").addEventListener("click", () => {
        document.getElementById("calculator-page").style.display = "block";
        document.getElementById("school-info-page").style.display = "none";
    })

    document.getElementById("school-info-page-btn").addEventListener("click", () => {
        document.getElementById("calculator-page").style.display = "none";
        document.getElementById("school-info-page").style.display = "block";
    })

    document.getElementById("searchButtonInfo").addEventListener("click", () => {
        const schoolName = document.getElementById("searchBoxInfo").value;
        if (!checkForErrors(schoolName, 0, 0, "Info")) return;
        
        const school = schoolDict[schoolName];
   
        document.getElementById("schoolName").textContent = schoolName;
        document.getElementById("InstStart").textContent = school.begin;
        document.getElementById("InstEnd").textContent = school.dismiss;
        document.getElementById("Recess").textContent = `${school.recStart} - ${school.recEnd}`;
        document.getElementById("Lunch").textContent = `${school.lunchStart} - ${school.lunchEnd}`;
    }
    )


});