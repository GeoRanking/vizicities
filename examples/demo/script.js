// Globals
var dataNames = [];
var choroplethColours = [];
var jsondata;

var persona = {
    criteria : {
        "price" : {
            "importance" : 9,
            "range" : [300000,600000],
            "inverse" : true
        },
        "distance to station" : {
            "importance" : 6
        },
        "bedrooms" : {
            "importance" : 3
        },
        "garden size" : {
            "importance" : 1
        }
    }
};

// Area Data
function AreaData (data)  {
    var parser = new DOMParser();
    var parsed = parser.parseFromString(data,"text/xml");

    // Ie. CT1 1, CT1 2 etc.
    //var placemarks = parsed.querySelectorAll('Placemark');
    var results = [];
    var geojson = '{ "type": "FeatureCollection", "features": [';

    $.each($('Placemark', data), function(d, ele)  {
        var obj = {};
        obj.name = $('name', ele).text();
        obj.coord = $.trim($('coordinates', ele).text());

        dataNames[d] = obj.name;

        // TODO remove random ranks
        var randomrank = Math.floor(Math.random() * (7 + 1)) + 0;

        geojson += ' { "type": "Feature", "properties": { "ranking": ' + randomrank + ', "name": "' + obj.name + '" }, "geometry": { "type": "Polygon", "coordinates": [ [';

        var indivcoords = obj.coord.split(" ");

        for ( var i = 0; i < indivcoords.length; i++ ) {
            var coord = indivcoords[i].split(",");
            if ( coord[0] != "undefined" || coord[1] != "undefined" ){
                geojson += " [" + coord[0] + "," + coord[1] + "]";
                if ( i < indivcoords.length-1 ) {
                    geojson += ',';
                }
            }
        }

        geojson += ' ] ] } },';

    });

    geojson = geojson.slice(0,-1);

    return geojson + ' ] }';
};
function getGeoJSON(){
    var kmldata = document.getElementById("areakml").value;
    jsondata = AreaData(kmldata);
    document.getElementById("areakml").value = jsondata;

    document.getElementById("areakmlbutton").style.display = 'none';
    document.getElementById("colour").style.display = 'block';

    document.getElementById("dataNames").innerHTML = dataNames;

    var newFile = "./data/data.geojson";
    var file = new File([""], newFile);

    file.open("w");
    file.write(jsondata);
    file.close();
}

// Colours
function ColourChange(hex, brightness) {

    // remove the hash symbol
    hex = String(hex).replace(/#/, '');

    if (hex.length < 6) {
        //split hex into red, green and blue components
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }

    var newcolour = "#"; // begin new colour string

    // iterate through red, green and blue
    for (var i = 0; i < 3; i++) {
        // get the two characters for the colour from the hex and convert to deanery
        var colour = parseInt(hex.substr(i*2,2), 16);
        // find the max of 0 or (colour + (colour * luminosity)), then the min of that or 255
        // then round to remove decimal place and convert back to a hexadecimal number
        // the min and max safeguard that the result is valid a rgb value
        colour = Math.round(Math.min(Math.max(0, colour + (colour * brightness)), 255)).toString(16);
        // add the updated colour code to the end of the new colour hex string
        newcolour += ("00"+colour).substr(colour.length);
    }

    return newcolour;
}

function getColours(){
    var colour = document.getElementById("basecolour").value; // Green - #FF69B4 || Pink - FF69B4
    var brightness = -0.1; // i.e. 0.1 = 10%, negative to go darker

    // for each rank - i.e. i = 0 to number of ranks
    for (var i = 0; i <= 6; i++) {
        // create array of colours
        choroplethColours[i] = ColourChange(colour, i*brightness);

        //output demo colours - not needed in project
        var output = document.getElementById("colours");
        var newelement = output.appendChild(document.createElement("div"));
        newelement.style.backgroundColor = choroplethColours[i];
        newelement.innerHTML = "Grade " + i + " -  " + choroplethColours[i];
    }

    document.getElementById("basecolour").style.display = 'none';
    document.getElementById("basecolourbutton").style.display = 'none';
    document.getElementById("data").style.display = 'block';
}

// Ranking
var rank = function(data, persona)  {
    // For each criterion
    data = JSON.parse(data);
    var options = {};
    for (var i = 0; i < Object.keys(data).length; i++)  {
        var criterion = Object.keys(data)[i];
        var range = getRange(criterion, data[criterion]);
        var rankBoundaries = getRankBoundaries(range[0], range[1]);
        options[criterion] = {
            "range" : range,
            "rankBoundaries" : rankBoundaries
        };
    }
    var finalRanks = finalRankings(data, options);
    return finalRanks;
};

var getRange = function(criterion, values)  {
    var min, max = null;
    if (persona.criteria[criterion].range)  {
        min = persona.criteria[criterion].range[0];
        max = persona.criteria[criterion].range[1];
    }
    else {
        // Find the smallest and largest numbers of the alternatives for the criterion
        min = Array.min(values); // find values.min;
        max = Array.max(values); // find values.max;
    }
    return [min,max];
};

var getRankBoundaries = function(min, max)  {
    var ranks = [];
    for (var i = 0; i < 6; i++)  {
        ranks[i] = min + (max - min) * (Math.pow(2, i)/64);
    }
    return ranks;
};

var getRank = function(criterion, value, data, options)  {
    var min = options[criterion].range[0];
    var max = options[criterion].range[1];
    if (value < min || value > max) {
        for (var j = 0; j < Object.keys(data); j++)  {
            data[Object.keys(data)[j]].splice(i, 1); // Remove the ith index from each criterion
        }
        return -1;
    }
    else  {
        if (value === min) return 0;
        var currentRank = Math.log2((value - min)/(max-min)*64);
        if (persona.criteria[criterion].inverse)  {
            currentRank = options[criterion].rankBoundaries.length - currentRank;
        }

        // Avoid rank 0 due to 0 * n = 0
        return currentRank;
    }
}

var totalImportance = function(data)  {
    // Find total importance/weight
    var totalImportance = 0;
    for (criterion in data) {
        totalImportance += Math.pow(Math.sqrt(2), persona.criteria[criterion].importance);
    }
    return totalImportance;
};

var normaliseWeights = function(data)  {
    // Normalise weights
    var criteria = [];
    for (criterion in data) {
        criteria[criterion] = {};
        criteria[criterion].weight = persona.criteria[criterion].importance || 5; // Out of 10
        criteria[criterion].normalisedWeight = Math.pow(Math.sqrt(2), persona.criteria[criterion].importance) / totalImportance(data);
    }
    return criteria;
};

var finalRankings = function(data, options)  {
    // Final ranking using weights
    // For each alternative
    var criteriaKeys = Object.keys(data);
    var finalRanks = {};
    var weights = normaliseWeights(data);
    for (var i = 0; i < data[criteriaKeys[0]].length; i++)  {
        var finalRank = 0;
        for (var j = 0; j < criteriaKeys.length; j++) {
            var criterion = criteriaKeys[j];
            var value = data[criterion][i];
            options[criterion].criterionRank = getRank(criterion, value, data, options);
            if (options[criterion].criterionRank >= 0 && finalRank !== null)   {
                options[criterion].normalisedWeight = weights[criterion].normalisedWeight;
                finalRank += options[criterion].normalisedWeight * options[criterion].criterionRank;
            }
            else  {
                finalRank = null;
            }
        }

        if (finalRank !== null)  finalRanks[dataNames[i]] = Math.round(finalRank);
    }
    return finalRanks;
}

Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

function getranks() {

    var catndata = document.getElementById("catndata").value;

    document.getElementById("output").value = JSON.stringify(rank(catndata, persona));
    document.getElementById("output").style.display = 'block';

    document.getElementById("catndatabutton").style.display = 'none';

    document.getElementById("viewvizibutton").style.display = "block";
}

function viewVizi() {
    document.getElementById("vizicities-viewport").style.display = "block";
    document.getElementById("viewvizibutton").style.display = "none";
    runVizi();
}