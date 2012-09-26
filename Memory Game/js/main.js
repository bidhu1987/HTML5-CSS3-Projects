/*************************************************************************************/
/************* Memory Game **********************************************************/
/************* Javascript Logic Section ******************************************************/


//Global Variable Code Block Start
var definitions = {
    "header": "Defines a header for a section or page",
    "section": "Defines a section",
    "footer": "Defines a footer for a section or page",
    "figure": "Defines a group of media content, and their caption",
    "canvas": "Defines graphics",
    "video": "Defines a video",
    "audio": "Defines an audio",
    "article": "Defines an article"
};
var tags = ["header", "section", "footer", "figure", "canvas", "video", "audio", "article"];
var card1 = 0;
var bothPicked = 0;
var points = 0;
//Global Variable Code Block Ends

tags = tags.concat(tags);

// Make 16 objects - Example "header" and "/header" are same.
for (i = 0; i < 16; i++) { if (i > 7) { tags[i] = "/" + tags[i];} }

function reset() {
// Reset the complete division, If something is already done it will empty the HTML and will call the reset function again.
    setDetails("Go!");
    if ($("#table").html() != "") {
        $("#table").fadeOut(function () { $(this).html(""); reset(); });
        return true;
    }

    // Initialize P in Display
    $("#display p").html("Points: <em>0</em>");

    //Initialize parameters
    card1 = 0;
    bothPicked = 0;
    points = 0;

// To draw spade shape in 16 Blocks
    var keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    //Randomize the keys into the grid
    for (i = 0; i < 16; i++) {
        k = Math.floor(Math.random() * keys.length);
        $("#table").append("<div><figure class='" + keys[k] + "'><p>&hearts;</p></figure></div>");
        keys.splice(k, 1);
    }

    $("#table").fadeIn();
    $("#table figure").click(function () {
        if (bothPicked == 0 && !$(this).hasClass("open")) {
            $(this).animate({ "width": 0, "left": "50%" }, 200, 'swing', function () {
                var tTag = tags[$(this).attr("class")];
                // Regex will replace the "/" sign with '' - Non word Character
                var tTagC = tTag.replace(/\W/g, '')
                // Class it attached to once opened Card, so that next time it shows the same option
                $(this).html("<p>&lt;" + tTag + "&gt;</p>").addClass("open").parent().addClass(tTagC);
                $(this).animate({ "width": "2.15em", "left": 0 }, 200, 'swing', function () {
                    if (card1 == 0) {
                        card1 = tTag;
                    } else {
                        //2 cards is opened and this bit is set to 1
                        bothPicked = 1;
                        var ok = 0;
                        if (card1.replace(/\W/g, '') == tTagC) {
                            if (card1.indexOf("http://codescape.in") != -1) {
                                points -= 5;
                                setDetails("That's not really valid, is it? (Hint: <strong>&lt;open&gt;&lt;/close&gt;</strong>)")
                            } else {
                                ok = 1;
                                points += 50;
                                setDetails("<strong>&lt;" + tTagC + "&gt;</strong> " + definitions[tTagC]);
                                $(".open").unbind("click").fadeOut(function () {
                                    $(this).removeClass("open").addClass("done").fadeIn();
                                    if ($(".done").size() == 16) {
                                        var pnts = $("#display em").text();
                                        $("#display p").html("Congratulations! Your score is: <em>" + pnts + "</em>");
                                        alert("Hurray!!! You have solved it, Your score is: " + pnts + "\n Bomb Squad team THANK YOU for showing your interest");
                                    } else {
                                        // If your attempt is wrong it will reset the cards back
                                        closeOpen();
                                    }
                                });
                            }
                        }
                        //If the card type does not match then it will close the cards again
                        else {
                            points -= 10;
                            setDetails("Wrong Match")
                        }
                        if (ok != 1) {
                            var tid = setTimeout('closeOpen()', 1000);
                        }
                    }
                    $("#display em").html(points);
                });
            });
        }
    });
}
$(document).ready(function () {
    reset();
});

// If your attempt is wrong it will reset the cards back
function closeOpen() {
    bothPicked = 0;
    card1 = 0;
    if ($(".open").size() == 2) {
        $(".open").fadeOut(function () {
            $(this).removeClass("open").html("<p>&clubs;</p>").fadeIn().parent().removeClass();
        });
    }
}

/*Set message in Details h3*/
function setDetails(newval) {
    $("details h3").fadeOut(function () { $(this).html(newval).fadeIn(); });
}