// Listen in on uninstallation event, need to collect
var formLink = "https://forms.gle/jNFukhtCT5AN58o9A";
chrome.runtime.setUninstallURL(formLink, callback);
function callback() {
  console.log('Done.');
}

// hasn't been uninstalled, listen in on user data
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("lastnameval").addEventListener('keyup', function(e){ // need to capture the enter key stroke
    if (e.keyCode === 13) {
        var link = createuserRMPLink();
        teacherSearch(link);
      }
    })
  });
function createuserRMPLink() {
  var rmpLink = "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=5000&wt=json&q=*%3A*+AND+schoolid" +
                "_s%3A1255&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+autosuggest&bf=pow" +
                "(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+" +
                "teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=";
  return rmpLink;
}
function teacherSearch(link) {
  var userInputLastName = document.getElementById('lastnameval').value;
  var partialUserInputGuess = userInputLastName.substring(0, 3) // needed for teacher suggestions
  console.log("lastName: " + userInputLastName);
  console.log("guess: " + partialUserInputGuess);
  // first xhtmlrep
  var rmpURL = link;
  var numFound = 0;
  var matches = new Array(5, 0); // need array for duplicates
  var numMatches = 0;
  var matchFound = false;
  var partialMatchFound = false
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
            break; // this should fix the bug of reading und defined data and needed for the intentional excess called for the departments
          }
          var tempProfLastName = profData["response"]["docs"][i].teacherlastname_t; // get the last name from the data
          var firstName = profData["response"]["docs"][i].teacherfirstname_t; // get the last name from the data
          
          if (userInputLastName.toLowerCase() == tempProfLastName.toLowerCase()) { // found the guy
            matchFound = true;
            console.log("matchFound:" + matchFound);
            var rmpID = profData["response"]["docs"][i].pk_id;
            // DEFINE PROF OBJECT
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
          } else if (partialUserInputGuess.toLowerCase() == tempProfLastName.toLowerCase().substring(0,3)) {
              partialMatchFound = true;
              console.log("partialMatchFound:" + partialMatchFound);
              var rmpID = profData["response"]["docs"][i].pk_id;
              // DEFINE PROF OBJECT
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
        if (!matchFound && !partialMatchFound) {
          alert("\"" + userInputLastName + "\"" +" could not be found in the specified database.  It could be for the following reasons: \n \n"
                                                          + "1. Spelling error (database is sensitive to spelling errors). \n"
                                                          + "2. Teacher isn't present in the department selected. \n"
                                                          + "3. Teacher doesn't teach at this university. \n \n" +
                                                          "Try a different search query.");
        } else if (numMatches == 1) { // only one match present
            window.open("https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + matches[0].rmpNum); // will open the proffesor RMP page in a new tab
        } else if (matchFound) {
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
        } else if (partialMatchFound) {
          var teacherMatchesStr = "";
          var invalidID = false;
          for (var i = 0; i < numMatches; i++) {
            teacherMatchesStr += matches[i].stringifiedData();
          }
          console.log("teacherMatchesStr: " + teacherMatchesStr);
          var userVal = prompt("We found multiple (" + numMatches + ") similar matches for " + userInputLastName + ". " +
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
