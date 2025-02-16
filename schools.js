// import schoolDict from './schoolTimes.json';

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
    
    const schoolDict = await loadSchools();

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
    
    // Look up the bell times and add up the instructional minutes (no before/after school or recess/lunch) and divide by 300. The minimum for that would be 0.7 but it is probably more.

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

    const searchBox = document.getElementById("searchBox");
    const dropdown = document.getElementById("dropdown");

    searchBox.addEventListener("input", function() {
        const input = this.value.toLowerCase();
        dropdown.innerHTML = "";
        if (!input) {
            dropdown.style.display = "none";
            return;
        }
        
        const filtered = schoolNames.filter(name => name.toLowerCase().includes(input));

        if (filtered.length > 0) {
            dropdown.style.display = "block";
            filtered.forEach(name => {
                const option = document.createElement("div");
                option.textContent = name;
                option.addEventListener("click", function() {
                    searchBox.value = name;
                    dropdown.style.display = "none";
                });
                dropdown.appendChild(option);
            });
        } else {
            dropdown.style.display = "none";
        }
    });

    document.addEventListener("click", function(e) {
        if (!e.target.closest(".autocomplete-container")) {
            dropdown.style.display = "none";
        }
    });


    const calculate = (schoolName, start, end) => {
        const pay = 286.38
        const school = schoolDict[schoolName];
        
        console.log(school);
        
        const startTime = timeStringToDate(school.begin) > timeStringToDate(start) ? school.begin : start;
        const endTime = timeStringToDate(school.dismiss) < timeStringToDate(end) ? school.dismiss : end; 
        
        const recessTime = subtractTimesInMinutes(school.recStart, school.recEnd);
        const lunchTime = subtractTimesInMinutes(school.lunchStart, school.lunchEnd);
        
        console.log("startTime:", startTime, "\nendTime:", endTime, "\nrecessTime:", recessTime, "\nlunchTime:", lunchTime);
        
        const instructionalTime = subtractTimesInMinutes(startTime, endTime) - recessTime - lunchTime;

        console.log("instructionalTime:", instructionalTime);
        
        let payPoint = instructionalTime / 300;

        console.log(payPoint);
        
        // if the user starts before lunch and finishes after lunch or works less than 0.5
        if(timeStringToDate(start) < timeStringToDate(school.lunchStart) && timeStringToDate(end) > timeStringToDate(school.lunchEnd) && payPoint < 0.7) {
            payPoint = 0.7;
        } else if (payPoint < 0.5) {
            payPoint = 0.5;
        }
        
        console.log(payPoint.toFixed(1));
        
        console.log(parseFloat(pay * payPoint).toFixed(2));

        document.getElementById("point").textContent = payPoint.toFixed(1);
        document.getElementById("instructional").textContent = `${instructionalTime} mins`;
        document.getElementById("rate").textContent = parseFloat(pay * payPoint.toFixed(1)).toFixed(2);
        
    }

    document.getElementById("searchButton").addEventListener("click", () => {
        
        const schoolName = document.getElementById("searchBox").value;
        const start = document.getElementById("startTime").value;
        const end = document.getElementById("endTime").value;


        calculate(schoolName, start, end);
    })

    document.getElementById("resetButton").addEventListener("click", () => {
        document.getElementById("searchBox").value = "";
        document.getElementById("startTime").value = "";
        document.getElementById("endTime").value = "";
        document.getElementById("point").textContent = "";
        document.getElementById("instructional").textContent = "";
        document.getElementById("rate").textContent = "";
    })

});



    // console.log(schoolDict);




    // fs.readFile("./schoolTimes.csv", (err, data) => {
    //     const dict = {};
    //     const file = data.toString().split("\n");
    //     console.log(file)

    //     file.forEach((line, i) => {
    //         line = line.split(",")

    //         dict[line[0]] = {
                
    //             begin: line[5],
    //             recStart : line[7],
    //             recEnd : line[9],
    //             recLen : line[8],
    //             lunchStart : line[11],
    //             lunchEnd : line[13],
    //             dismiss: line[19]
    //         }
    //     })

    //     console.log(dict)
    //     fs.writeFile("./schoolTimes.json", JSON.stringify(dict), (err) => {
    //         if (err) {
    //             console.log(err)
    //         }
    //     })
    // })