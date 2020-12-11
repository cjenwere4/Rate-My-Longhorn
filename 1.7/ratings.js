//header('content-type: application/json; charset=utf-8');
//header("access-control-allow-origin: *");

var i;
var index = -1;
var columnName = "Instructor";
var table = document.getElementsByTagName("table")[0];
var headings = table.getElementsByTagName("tr")[0].getElementsByTagName("th");
var courses = table.getElementsByTagName("tr")
if (courses.length > 0) {
    for (i = 0; i < headings.length; i++) {
        if (headings[i].innerHTML.normalize() === columnName.normalize()) { // get index of Instructor Column
            index = i;
        }
    }
    if (index > 0) {
        headings[index].innerHTML = columnName + " & Rating";
    } // we found something

    teachers= courses[6].getElementsByTagName("td")[5].getElementsByTagName("span");
    var rmpLink = "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=5000&wt=json&q=*%3A*+AND+schoolid" +
    "_s%3A1255&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+autosuggest&bf=pow" +
    "(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+" +
    "teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=";
    var randomURL = "https://jsonplaceholder.typicode.com/todos/1"
    console.log(teachers);

    var request = new XMLHttpRequest();
    request.open('GET', rmpLink, true); // need to fix CORS????
    request.onload = function () {
      // Begin accessing JSON data here
      var profData = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) { // check to see if website is running
        console.log("eagle landed");
      } else {
        console.log(request.status);    
      }
    }
    request.send()
    // For now just do it for the current page without infinite scrol.


    /*
    // only do this if the ut course registration is enabled
    window.onscroll = function(ev) {
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 600)) {
            table = document.getElementsByTagName("table")[0];
            headings = table.getElementsByTagName("tr")[0].getElementsByTagName("th");
            console.log(headings.length);
        }
    };

    */
}