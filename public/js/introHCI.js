'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	initializePage();
})

/*
 * Function that is called when the document is ready.
 */
function initializePage() {
	$('.project a').click(function(e) {
		// Prevent following the link
		e.preventDefault();

		// Get the div ID, e.g., "project3"
		var projectID = $(this).closest('.project').attr('id');
		// get rid of 'project' from the front of the id 'project3'
		var idNumber = projectID.substr('project'.length);

		// this is the URL we'll call
		var url_call = '/project/'+idNumber;

		// How to respond to the GET request
		function addProjectDetails(project_json) {
			// We need to compute a display string for the date
			// Search 'toLocaleDateString' online for more details.
			var date_obj = new Date(project_json['date']);
			var options = {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric"
			};
			var display_date = date_obj.toLocaleDateString('en-US', options);

			// compose the HTML
			var new_html =
				'<div class="project-date">'+display_date+'</div>'+
				'<div class="project-summary">'+project_json['summary']+'</div>'+
				'<button class="project-delete btn btn-default" '+
					'type="button">delete</button>';

			// get the DIV to add content to
			var details_div = $('#project' + idNumber + ' .details');
			// add the content to the DIV
			details_div.html(new_html);

			details_div.find('.project-delete').click(function(e) {
				$.post('/project/'+idNumber+'/delete', function() {
					window.location.href = '/';
				});
			});
		}

		// issue the GET request
		$.get(url_call, addProjectDetails);
	});

	$('#newProjectSubmitButton').click(function(e) {
		console.log('clicked');
		var title = $('#new-project-form #title').val();
		var image_url = $('#new-project-form #image_url').val();
		var date = $('#new-project-form #date').val();
		var summary = $('#new-project-form #summary').val();
		var json = {
			'project_title': title,
			'image_url': image_url,
			'date':  date,
			'summary': summary
		};
		$.post('/project/new', json, function() {
			window.location.href = '/'; // reload the page
		});
	});
}

google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(drawChart);

function drawChart() {
	var piArray = [];
	var stringTimeArray = [];
	var macArray = [];

    $('#hidden').children().each(function(){
	piArray.push( $('#'+this.id).data("pi"));
	stringTimeArray.push( $('#'+this.id).data("time") );
	macArray.push( $('#'+this.id).data("mac") );
	});
        	
    console.log(piArray);
    console.log(stringTimeArray);
    console.log(macArray);

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'time');

    var macSetSize = 0;
    var macSet = {};
    var columnArray = [];
    for (var n = 0; n < macArray.length; n++) {
    	if(! (macArray[n] in macSet) ) {
    		macSet[macArray[n]] = true;
    		data.addColumn('number', macArray[n]);
    		columnArray.push(macArray[n]);
    		macSetSize++;
    	}
    }

    console.log("Mac Set Size (Unique MACs): " + macSetSize);

    //Convert Times to last seen compared to current time
    var currentTime = new Date().getTime() / 3600000;
    //var currentTime = new Date("2014-03-04 12:00:00") / 3600000

    var timeArray = [];
    for(var x = 0; x < stringTimeArray.length; x++) {
    	var newDate = new Date(stringTimeArray[x]);
    	var secTime = newDate.getTime() / 3600000;
    	var fromTime = (currentTime - secTime);
    	timeArray.push(fromTime);
    }

    for (var i = 0; i < columnArray.length; i++) {
    	for(var j = 0; j < macArray.length; j++) {
    		if (timeArray[j] < 24 && columnArray[i] == macArray[j]) {
    			var newRow = [];
    			newRow.push(timeArray[j]);
    			var m = 0;
    			for(m = 0; m < i; m++) {
    				newRow.push(null);
    			}
    			newRow.push(piArray[j]);
    			for(var p = 0; p < columnArray.length - m - 1; p++) {
    				newRow.push(null);
    			}
    			data.addRow(newRow);
    		}
    	}
    }

    /*var data = google.visualization.arrayToDataTable([
        ['Time', 'piNum'],
        [ 8,      1],
        [ 4,      3],
        [ 11,     2],
        [ 4,      5],
        [ 3,      4],
        [ 6.5,    2]
        ]);*/

    var options = {
        title: 'Time vs. Location Found',
       	hAxis: {title: 'Hours Passed', minValue: 24, maxValue: 0, direction: -1},
        vAxis: {title: 'Pi Found On', minValue: 0, maxValue: 4},
        legend: 'none',
    };

    var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
