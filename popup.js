// We use this script to save the info from the popup.html and apply to our teachersearch.js file
// This allows for easier communication of data (i think)

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("lastnameval").addEventListener('keyup', function(e){ // need to capture the enter key stroke
    if (e.keyCode === 13) {
        var link = createuserRMPLink();
        teacherSearch(link);
      }
    })
  });
function createuserRMPLink() {
  var rmpLink = "";
  var departmentSelected = document.getElementById('userdepartment').value;
  console.log("department: " + departmentSelected);
  if (departmentSelected != "undef") {
    rmpLink = "http://search.mtvnservices.com/typeahead/suggest/?solrformat=true&rows=1000&q=*%3A*+AND+schoolid_s%3A1255+"+
              "AND+teacherdepartment_s%3A%22"+departmentSelected+"%22&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E"+
              "2000+teacherfullname_t%5E2000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+"+
              "desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averagerating"+
              "score_rf+schoolid_s&fq=";
  } else { // we go through the entire database of UT staff
    rmpLink = "http://search.mtvnservices.com/typeahead/suggest/?solrformat=true&rows=5000&q=*%3A*+AND+schoolid" +
                 "_s%3A1255&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E" +
                 "2000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp" +
                 "&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=";
  }
  return rmpLink;
}
function teacherSearch(link) {
  var userInputLastName = document.getElementById('lastnameval').value;
  console.log("lastName: " + userInputLastName);
  // first xhtmlrep
  var rmpURL = link;
  var numFound = 0;
  var matches = new Array(5, 0); // need array for duplicates
  var numMatches = 0;
  var matchFound = false;
  var request = new XMLHttpRequest();
  request.open('GET', rmpURL, true);
  request.onload = function () {
    // Begin accessing JSON data here
    var profData = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) { // check to see if website is running
        console.log("Website works");
        numFound = profData["response"].numFound; // seems like the magic number......... xD
        console.log("numFound: " + numFound);
        for (var i = 0; i < numFound; i++) {
          if (profData["response"]["docs"][i] === undefined) {
            break; // this should fix the bug of reading undefined data and needed for the intentional excess called for the departments
          }
          var tempProfLastName = profData["response"]["docs"][i].teacherlastname_t; // get the last name from the data
          var tempProfLastName = profData["response"]["docs"][i].teacherlastname_t; // get the last name from the data
          if (userInputLastName.toLowerCase() == tempProfLastName.toLowerCase()) { // found the guy
            matchFound = true;
            console.log("matchFound:" + matchFound);
            var rmpID = profData["response"]["docs"][i].pk_id;
            var profObj = {
              rmpNum: rmpID,
              matchNum: numMatches, // need for optimatzation, easier for the user.
              lastName: tempProfLastName,
              firstName: profData["response"]["docs"][i].teacherfirstname_t,
              stringifiedData: function() {
                return this.matchNum + ": " + this.lastName + ", " + this.firstName + "\n";
              }
            }
            matches[numMatches] = profObj; // add rmpID to the array of matches
            numMatches++;
          }
        }
        console.log("matches: " + numMatches);
        if (!matchFound) {
          alert("\"" + userInputLastName + "\"" +" could not be found in the specified database.  It could be for the following reasons: \n \n"
                                                          + "1. Spelling error (database is sensitive to spelling errors). \n"
                                                          + "2. Teacher isn't present in the department selected. \n"
                                                          + "3. Teacher doesn't teach at this university. \n \n" +
                                                          "Try a different search query.");
        } else if (numMatches == 1) { // only one match present
            window.open("https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + matches[0].rmpNum); // will open the proffesor RMP page in a new tab
        } else {
          var teacherMatchesStr = "";
          var invalidID = false;
          for (var i = 0; i < numMatches; i++) {
            teacherMatchesStr += matches[i].stringifiedData();
          }
          console.log("teacherMatchesStr: " + teacherMatchesStr);
          var userVal = prompt("We found multiple (" + numMatches + ") matches for " + userInputLastName + ". " +
                                  "Enter the ID of teacher you want to select: \n \n" + teacherMatchesStr);

          if ((userVal < matches.length) && !(isNaN(userVal)) && !invalidID) {
            window.open("https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + matches[userVal].rmpNum); // will open the proffesor RMP page in a new tab
          } else {
            alert("Invalid input. Try a different search query.");
          }
        }
    } else {
      console.log("Website couldn't be loaded. :(");
    }
  }
  request.send();
}
