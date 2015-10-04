var map;
var map_marker;
var lat = null;
var lng = null;
var lastLat = null; var lastLng = null;
var currentDistance = 0; var totalDistance = 0;
var lat_array = [];
var lng_array = [];
var accuracy = null;
var accuracy_array = [];
var lineCoordinatesArray = [];
var distance=[];
var sum_distance = 0;
var average_speed = 0;

var choose_counter = 0;
var start = 0;
var record = 0;
var stop = 0;
var finish = 0;
var start_status;
var record_status;
var stop_status;
var finish_status;
var outString = "";
var t;
var sec = 0, minutes = 0, hours = 0;
var seconds = 0, total_seconds = 0;

var run = 0, walk = 0, cycling = 0, sprint = 0;
var Met = 0;
var weight = 0;
var calorie = 0;

var threshold = 10000;

var accuracy_wait; var accuracy_wait_counter; var watchID_wait; var geoLocation_wait;
/*************************************************************************************/
//Mapping Route//*********************************************************************/
var path = [];
var watchID;
var geoLocation;

function showLocation (position){
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    accuracy = position.coords.accuracy;
    
    location_accuracy(accuracy,threshold);
    
    google.maps.event.addDomListener(window, 'load', initialize());
    //alert("Latitude: "+ lat + "<br/>"+"Longitude: "+ lng)
    path.push(new google.maps.LatLng(lat,lng));
    //lat_array.push(lat);
    //lng_array.push(lng);
    
    if ((lastLat != null) && (lastLng != null)){
        currentDistance = distance_calculation(lat, lng, lastLat, lastLng);
        totalDistance += currentDistance;
    }
    lastLat = lat;
    lastLng = lng;
    
    //if (accuracy > threshold){
    //    alert("The GPS location obtained is currently inaccurate. No recording can be done.");
    //    Finish();
    //}
    
    //document.getElementById("distance-area").innerHTML = "Distance: "+totalDistance.toFixed(3);
    
    document.getElementById("empty-area").innerHTML = "Current GPS accuracy is: "+ accuracy+ "m" + "<br/>"+ "Current latitude: "+lat.toFixed(4) + " "+"<br/>"+" Current longitude: "+ lng.toFixed(4) + "<br/>"+"Distance: " + totalDistance + "m";
    //document.getElementById("empty-area").innerHTML = accuracy;
    
    //for (i = 0; i<path.length; i++){
    //document.getElementById("empty-area").innerHTML = lat_array[i].toFixed(5) +" , " + lng_array[i].toFixed(5)+"<br/>";
    //}
    /*
    var len_path_counter = path.length;
    while (len_path_counter != 0){
         document.getElementById("empty-area").innerHTML = path[len_path_counter-1];
    }
    */
    /*
    //Uncomment this block if you want to set a path

    // Create the polyline's points
    for(var i = 0; i < 5; i++) {
    // Create a random point using the user current position and a random generated number.
    // The number will be once positive and once negative using based on the parity of i
    // and to reduce the range the number is divided by 10
    path.push(
        new google.maps.LatLng(
            position.coords.latitude + (Math.random() / 10 * ((i % 2) ? 1 : -1)),
            position.coords.longitude + (Math.random() / 10 * ((i % 2) ? 1 : -1))
        )
    );
    }
     */
    
    //Create array that will be used to fit the view to the point range
    //place the marker to the polyline's points
    
    var latLngBounds = new google.maps.LatLngBounds();
    for (var i = 0; i<path.length; i++){
        latLngBounds.extend(path[i]);
        //Place the marker
        if (i == 0){
             new google.maps.Marker({
                 map:map,
                 position:path[i],
                 //title: "Point"+(i+1)
             });
        }else if (i == (path.length-1)){
            new google.maps.Marker({
                map:map,
                position:path[i],
                //title: "Point"+(i+1),
                icon: 'darkgreen_Marker.gif'
            });
        }
        //new google.maps.Marker({
        //    map:map,
        //    position:path[i],
        //    title: "Point"+(i+1)
        //});
        //document.getElementById("empty-area").innerHTML = path.length;
        //distance_calculation(lat_array[i],lng_array[i],lat_array[i+1],lng_array[i+1]);
    }
    
    //Create the polyline object
    var polyline = new google.maps.Polyline({
        map:map,
        path:path,
        strokeColor: "#0000FF",
        strokeOpacity: 0.7,
        strokeWeight: 1
    });
    //Fit the bounds of the generated points
    map.fitBounds(latLngBounds);
    
}

function showLocation_wait(position_wait){
    accuracy_wait = position_wait.coords.accuracy;
    
    if (accuracy_wait > threshold){
        accuracy_wait_counter++;
        if (accuracy_wait_counter == 10){
            if (navigator.geolocation) {
                navigator.geolocation.clearWatch(watchID_wait);
            }; 
            var accuracy_response_wait = parseInt(prompt("The GPS location is still inaccurate. Do you want to continue to wait or cancel recording?\r\n 1.Wait\r\n2.Cancel recording"));
            
            if (accuracy_response_wait == 1){
                wait_accuracy();
            }else if (accuracy_response_wait == 2){
                Finish();
            }
        }
    }else{
        alert("The GPS location accuracy is now stable. You can start recording now.");
        Start();
    }
}

function location_accuracy(accuracy,threshold){
    if (accuracy > threshold){
        alert("The GPS location obtained is currently inaccurate. No recording can be done.\r\n Try again later." );
        var accuracy_response = parseInt(prompt("Do you want to wait until location accuracy lower than threshold value or cancel recording?\r\n 1.Wait \r\n 2.Cancel recording"));
        
        if (accuracy_response == 1){
            wait_accuracy();
            //var try_again = setInterval(function(){Start()},10000);
        }else if (accuracy_response == 2){
            Finish();
        }
    }
}

function wait_accuracy(){
    if (navigator.geolocation){
        var options_wait = {timeout : 2000};
        geoLocation_wait = navigator.geolocation;
                
        watchID_wait = geoLocation.watchPosition(showLocation_wait,errorHandler,options_wait);
    }else{
        alert("Sorry, browser does not support geolocation.");
    }
}

function initialize(){
    //initialize a map in html page
    var mapCanvas  = document.getElementById("map-canvas");
    var mapOptions = {
        center: {lat: lat, lng : lng, alt: 0},
        zoom: 15
    }
    map = new google.maps.Map(mapCanvas,mapOptions);
    
    map_marker = new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});
    map_marker.setMap(map);
}

function errorHandler(err){
    
    switch(err.code){
        case err.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case err.POSITION_UNAVAILABLE:
            alert("Location information is unavailable");
            break;
        case err.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case err.UNKNOWN_ERROR:
            alert("An unknown error occured.");
            break;
    }
    //if (err.code == 1){
    //    alert("Error: Access is denied");
    //}
    //else if (err.code == 2){
    //    alert("Error: Position is uavailable");
    //}
}

/*
    if (navigator.geolocation){
        var options = {timeout : 5000};
        geoLocation = navigator.geolocation;
        
        //Create map
        //var myOption = {
        //zoom: 15,
        //center: path[0],
        //mapTypeId: google.maps.MapTypeId.ROADMAP
        
        //map = new google.maps.Map(document.getElementById('map-canvas'),myOption);
        
        watchID = geoLocation.watchPosition(showLocation,errorHandler,options);
    }else{
        alert("Sorry, browser does not support geolocation.");
    }
*/

/*********************************************************************************************/
// Distance Calculation//******************************************************************
function distance_calculation(lat1,lon1,lat2,lon2){
    var r = 6371000;
    var dLat = (lat2-lat1)*Math.PI/180;
    var dLon = (lon1-lon2)*Math.PI/180;
    var a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    var c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    distance = r*c;
    return distance;
}

Number.prototype.toRad = function(){
    return this*Math.PI/180;
}


/*********************************************************************************************/
// Start, Stop, Finish, Choose Mode //*******************************************************//


    function Start(){
        var output = document.getElementById("status-area");
        //var output2 = document.getElementById("distance-area");
        //var output3 = document.getElementById("speed-area");
        var change = document.getElementById("start");
        record+=1;
        start+=1;
        
        if (start>stop && start>finish && choose_counter>0){
            outString = "Status: Start Recording...";
            output.innerHTML = outString;
            add();
            //redraw();
            
            if (navigator.geolocation && start > 0){
                var options = {timeout : 3000};
                geoLocation = navigator.geolocation;
                
                watchID = geoLocation.watchPosition(showLocation,errorHandler,options);
            }else{
                alert("Sorry, browser does not support geolocation.");
            }
            
            //output2.innerHTML = "Distance: "+distance+" m ";
            //output3.innerHTML = "Speed: "+speed + "m/s";
            //change.innerHTML = "Stop";
        }else{
            alert("You should choose a mode of running and provide information of your body weight first.");
            start = 0;
            choose_counter = 0;
            stop = 0;
            finish = 0;
        }
        
    }

    function add(){
            sec++;
            if (sec >= 60){
                sec = 0;
                minutes++;
                if (minutes >= 60){
                    minutes = 0;
                    hours++;
                }
            }
            sec = checkTime(sec);
            document.getElementById("timer-area").innerHTML = "0"+hours+ ":" + "0"+minutes + ":" +sec;
            t = setTimeout(add,1000);
        }

    function checkTime(i){
            if (i<10){
                i = "0"+i;
            }
            return i;
        }

    function Stop(){
        var output = document.getElementById("status-area");
        var change = document.getElementById("start");
        stop_counter = 1;
        
        if (stop<start){
            stop+=1;
            clearTimeout(t);
            outString = "Status: Stop Recording...";
            //output.innerHTML = outString;
        }else{
            outString = "Status: You haven't start a recording...";
            stop = 0;
        }
        /*
        if (stop>finish && stop<=start){
            outString = "Status: Stop Recording...";
            output.innerHTML = outString;
        }else if (stop>start){
            alert("You haven't start the recording!!");
        }
        */
        if (stop===start && start != 0){
            change.innerHTML = "Cont";
        }else{
            change.innerHTML = "Start";
        }
        output.innerHTML = outString;
        
    }
    
    function Continue(){
        if (document.getElementById("start").value =="Cont"){
            sec = sec;
            minutes = minutes;
            hours = hours;
            add();
        }
    }
    
    function Finish(){
        var output = document.getElementById("status-area");
        var time_consumed = [0,0,0];
        document.getElementById("timer-area").innerHTML = "00:00:00";
        
        if (finish<=stop && finish<start) {
            finish+=1;
            clearTimeout(t);
            outString = "Status: Finish Recording.";
            output.innerHTML = outString;
            
            time_consumed[0] = hours;
            time_consumed[1] = minutes;
            time_consumed[2] = sec;
            
            if (time_consumed[1]>0){
                seconds = time_consumed[1]*60;
            }
            if (time_consumed[0]>0){
                seconds = time_consumed[0]*3600;
            }
            /*
            for (var j=0; j<path.length; j++){
                sum_distance = distance[j]+distance[j+1];
            }
            */
            total_seconds = time_consumed[2]+seconds;
            //average_speed = sum_distance/total_seconds;
            
            //average_speed = totalDistance/total_seconds;
            if (totalDistance > 0){
                calorie = (Met*weight*(total_seconds/60)*3.5/200).toFixed(3);
            }else{
                calorie = 0;
            }
            start = 0; stop = 0; finish = 0; choose_counter = 0;
            
            alert("The total time consumption for the run is: "+time_consumed[0]+" hours "+time_consumed[1]+ " minutes " +time_consumed[2] + " seconds."+ "\r\n"+"The total distance: "+totalDistance.toFixed(3)+" m. "+"\r\n" + "The average speed: "+average_speed.toFixed(3)+" m/s."+"\r\n"+"The total calorie burnt during the run: "+calorie + " kcal");
            
        }else{
            output.innerHTML = "Status: You haven't start the recording yet!!";
            finish = 0;
        }
        document.getElementById("start").innerHTML = "Start";
        sec = 0;minutes = 0; hours = 0;
        start = 0; stop = 0;choose_counter = 0;
        
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchID);
            document.getElementById("empty-area").innerHTML = "Finish."

            }; 
        //document.getElementById("empty-area").innerHTML = path;
        
    }

function chooseMode(){
    choose_counter+=1;
    var choiceMode = parseInt(prompt("Please choose a mode of running: "+ "\r\n"+" 1. Walking"+"\r\n"+" 2. Running"+"\r\n"+" 3. Cycling"+"\r\n"+" 4. Sprint"));
    
    if (choiceMode == 1){
        Met = 3.8;
        weight = prompt("Please enter your weight in kg: ");
    }else if (choiceMode == 2){
        Met = 7.5;
        weight = prompt("Please enter your weight in kg: ");
    }else if (choiceMode == 3){
        Met = 8;
        weight = prompt("Please enter your weight in kg: ");
    }else if(choiceMode == 4){
        Met = 10;
        weight = prompt("Please enter your weight in kg: ");
    }else{
        alert("There is no such choice of running mode.");
    }
}
