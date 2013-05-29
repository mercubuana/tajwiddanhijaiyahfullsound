function playAudio(src) {
            if (device.platform == 'Android') {
                src = '/android_asset/www/' + src;
            }

            var media = new Media(src, success, error_error);

            media.play();
        }

        function success() {
            // ignore
        }

        function error_error(e) {
            alert('mmmm, salah!');
            alert(e.message);
        }


$(function() {

    var tileSize,   // Tile size in pixels.
        numTiles,   // Number of tiles, e.g. 4 = 4 by 4 grid.
        tilesArray, // An array of tile objects.
        emptyGx,    // X position of empty tile space.
        emptyGy,    // Y position of empty tile space.
        imageUrl;   // Url of image to tile.

    var phoneObject = function() {
        var	ready = false;
        document.addEventListener("deviceready", function(){
            ready = true;
        }, false);
        return {
            beep: function(n) {
                if(ready) {
                    navigator.notification.beep(n);
                }
            },
            vibrate: function(n) {
                if(ready) {
                    navigator.notification.vibrate(n);
                }
            }
        }
    }();

    // tileObj represents a single tile in the puzzle.
    // gx and gy are the grid position of the tile.
    var tileObj = function (gx, gy) {
        // solvedGx and solvedGy are the grid coordinates
        // of the tile in its 'solved' position.
        var solvedGx = gx,
            solvedGy = gy,
            // Left and top represent the equivalent css pixel positions.
            left = gx * tileSize,
            top = gy * tileSize,
            $tile = $("<div class='tile'></div>"),

            that = {
                $element: $tile,
                gx: gx,
                gy: gy,
                
                // The move() method makes a tile move to a new grid position.
                // The use of animation is optional.
                move: function (ngx, ngy, animate) {
                    that.gx = ngx;
                    that.gy = ngy;
                    tilesArray[ngy][ngx] = that;
                    if (animate) {
                        $tile.animate({
                            left: ngx * tileSize,
                            top: ngy * tileSize
                        }, 250);
                    } else {
                        $tile.css({
                            left: ngx * tileSize,
                            top: ngy * tileSize
                        });
                    }
                },
                // The checkSolved() method returns true if the tile
                // is in the correct 'solved' position.
                checkSolved: function () {
                    if (that.gx !== solvedGx || that.gy !== solvedGy) {
                        return false;
                    }
                    return true;
                }
            };
        // Set up the tile element's css properties.
        $tile.css({
            left: gx * tileSize + 'px',
            top: gy * tileSize + 'px',
            width: tileSize - 2 + 'px',
            height: tileSize - 2 + 'px',
            backgroundPosition: -left + 'px ' + -top + 'px',
            backgroundImage: 'url(' + imageUrl + ')'
        });
        // Store a reference to the tileObj instance
        // in the jQuery DOM tile element.
        $tile.data('tileObj', that);
        // Return a reference to the tile object.
        return that;
    };

    // The checkSolved() function iterates throught all the tile objects
    // and checks if all the tiles in the puzzle are solved.
    var checkSolved = function () {
        var gy, gx;
        for (gy = 0; gy < numTiles; gy++) {
            for (gx = 0; gx < numTiles; gx++) {
                if (!tilesArray[gy][gx].checkSolved()) {
                    return false;
                }
            }
        }
        return true;
    };

    // When a tile is clicked on, the moveTiles() function will
    // move one or more tiles into the empty space. This can be done
    // with or without animation.
    var moveTiles = function (tile, animate) {
        var clickPos, x, y, dir, t;
        // If empty space is on same vertical level as clicked tile,
        // move tile(s) horizontally.
        if (tile.gy === emptyGy) {
            clickPos = tile.gx;
            dir = tile.gx < emptyGx ? 1 : -1;
            for (x = emptyGx - dir; x !== clickPos - dir; x -= dir) {
                t = tilesArray[tile.gy][x];
                t.move(x + dir, tile.gy, animate);
            }
            // Update position of empty tile.
            emptyGx = clickPos;
        }
        // If empty space is on same horizontal level as clicked tile,
        // move tile(s) vertically.
        if (tile.gx === emptyGx) {
            clickPos = tile.gy;
            dir = tile.gy < emptyGy ? 1 : -1;
            for (y = emptyGy - dir; y !== clickPos - dir; y -= dir) {
                t = tilesArray[y][tile.gx];
                t.move(tile.gx, y + dir, animate);
            }
            // Update position of empty tile.
            emptyGy = clickPos;
        }
    };
	

    // Randomly shuffles the tiles, ensuring that the puzzle
    // is solvable. moveTiles() is called with no animation.
    var shuffle = function () {
        var randIndex = Math.floor(Math.random() * (numTiles - 1));
        if (Math.floor(Math.random() * 2)) {
            moveTiles(tilesArray[emptyGx][(emptyGy + 1 + randIndex) % numTiles], false);
        } else {
            moveTiles(tilesArray[(emptyGx + 1 + randIndex) % numTiles][emptyGy], false);
        }
    };

    // Initial setup. Clears picture frame of old tiles,
    // creates new tiles and shuffles them.
    var setup = function () {
        var x, y, i;
        imageUrl = $("input[name='pic-choice']:checked").val();
        // Create a subtle watermark 'guide' image to make the puzzle
        // a little easier.
        $('#pic-guide').css({
            opacity: 0.2,
            backgroundImage: 'url(' + imageUrl + ')'
        });
        // Prepare the completed 'solved' image.
        $('#well-done-image').attr("src", imageUrl);
        // Remove all old tiles.
        $('.tile', $('#pic-frame')).remove();
        // Create new tiles.
        numTiles = $('#difficulty').val();
        tileSize = Math.ceil(280 / numTiles);
        emptyGx = emptyGy = numTiles - 1;
        tilesArray = [];
        for (y = 0; y < numTiles; y++) {
            tilesArray[y] = [];
            for (x = 0; x < numTiles; x++) {
                if (x === numTiles - 1 && y === numTiles - 1) {
                    break;
                }
                var tile = tileObj(x, y);
                tilesArray[y][x] = tile;
                $('#pic-frame').append(tile.$element);
            }
        }
        // Shuffle the new tiles randomly.
        for (i = 0; i < 100; i++) {
            shuffle();
        }
    };

    var bindEvents = function () {
        // Trap 'tap' events on the picture frame.
        $('#pic-frame').bind('tap',function(evt) {
            var $targ = $(evt.target);
            // Has a tile been tapped?
            if (!$targ.hasClass('tile')) return;
            // If a tile has been tapped, then move the appropriate tile(s).
            moveTiles($targ.data('tileObj'),true);
            // Check if the puzzle is solved.
            if (checkSolved()) {
            	// If puzzle solve, beep and vibrate.
            	phoneObject.beep(1);
            	phoneObject.vibrate(500);
            	// Pop up the well done screen.
                $.mobile.changePage("#well-done","pop");
            }
        });

        $('#play-button').bind('click',setup);
    };
    bindEvents();
    setup();

});



function checkkuis() {
    var ans = $('input:radio[name=kuis]:checked').val();

   if (ans == "b") {
        $('#kuischeck').attr("href", "#kuiscorrect");
    } else {
        $('#kuischeck').attr("href", "#kuisincorrect");
    }
 }

     function checkkuis2() {
    var ans = $('input:radio[name=kuis2]:checked').val();

   if (ans == "b") {
        $('#kuis2check').attr("href", "#kuis2correct");
    } else {
        $('#kuis2check').attr("href", "#kuis2incorrect");
    }
 }

     function checkkuis3() {
    var ans = $('input:radio[name=kuis3]:checked').val();

   if (ans == "b") {
        $('#kuis3check').attr("href", "#kuis3correct");
    } else {
        $('#kuis3check').attr("href", "#kuis3incorrect");
    }
 }


     function checkkuis4() {
    var ans = $('input:radio[name=kuis4]:checked').val();

   if (ans == "b") {
        $('#kuis4check').attr("href", "#kuis4correct");
    } else {
        $('#kuis4check').attr("href", "#kuis4incorrect");
    }
 }

     function checkkuis5() {
    var ans = $('input:radio[name=kuis5]:checked').val();

   if (ans == "a") {
        $('#kuis5check').attr("href", "#kuis5correct");
    } else {
        $('#kuis5check').attr("href", "#kuis5incorrect");
    }
 }

     function checkkuis6() {
    var ans = $('input:radio[name=kuis6]:checked').val();

   if (ans == "a") {
        $('#kuis6check').attr("href", "#kuis6correct");
    } else {
        $('#kuis6check').attr("href", "#kuis6incorrect");
    }
 }

     function checkkuis7() {
    var ans = $('input:radio[name=kuis7]:checked').val();

   if (ans == "b") {
        $('#kuis7check').attr("href", "#kuis7correct");
    } else {
        $('#kuis7check').attr("href", "#kuis7incorrect");
    }
 }
         function checkkuis8() {
    var ans = $('input:radio[name=kuis8]:checked').val();

   if (ans == "b") {
        $('#kuis8check').attr("href", "#kuis8correct");
    } else {
        $('#kuis8check').attr("href", "#kuis8incorrect");
    }
 }

     function checkkuis9() {
    var ans = $('input:radio[name=kuis9]:checked').val();

   if (ans == "a") {
        $('#kuis9check').attr("href", "#kuis9correct");
    } else {
        $('#kuis9check').attr("href", "#kuis9incorrect");
    }
 }

     function checkkuis10() {
    var ans = $('input:radio[name=kuis10]:checked').val();

   if (ans == "b") {
        $('#kuis10check').attr("href", "#kuis10correct");
    } else {
        $('#kuis10check').attr("href", "#kuis10incorrect");
    }
 }




 function checkmad() {
    var ans = $('input:radio[name=mad]:checked').val();

   if (ans == "b") {
        $('#madcheck').attr("href", "#madcorrect");
    } else {
        $('#madcheck').attr("href", "#madincorrect");
    }
 }


 function checkmad2() {
    var ans = $('input:radio[name=mad2]:checked').val();

   if (ans == "c") {
        $('#mad2check').attr("href", "#mad2correct");
    } else {
        $('#mad2check').attr("href", "#mad2incorrect");
    }
 }


 function checkmad3() {
    var ans = $('input:radio[name=mad3]:checked').val();

   if (ans == "a") {
        $('#mad3check').attr("href", "#mad3correct");
    } else {
        $('#mad3check').attr("href", "#mad3incorrect");
    }
 }




 function checkkal() {
    var ans = $('input:radio[name=kal]:checked').val();

   if (ans == "a") {
        $('#kalcheck').attr("href", "#kalcorrect");
    } else {
        $('#kalcheck').attr("href", "#kalincorrect");
    }
 }



 function checkkal2() {
    var ans = $('input:radio[name=kal2]:checked').val();

   if (ans == "c") {
        $('#kal2check').attr("href", "#kal2correct");
    } else {
        $('#kal2check').attr("href", "#kal2incorrect");
    }
 }


 function checkkal3() {
    var ans = $('input:radio[name=kal3]:checked').val();

   if (ans == "b") {
        $('#kal3check').attr("href", "#kal3correct");
    } else {
        $('#kal3check').attr("href", "#kal3incorrect");
    }
 }


 function checktanwin() {
    var ans = $('input:radio[name=tanwin]:checked').val();

   if (ans == "b") {
        $('#tanwincheck').attr("href", "#tanwincorrect");
    } else {
        $('#tanwincheck').attr("href", "#tanwinincorrect");
    }
 }


 function checktanwin2() {
    var ans = $('input:radio[name=tanwin2]:checked').val();

   if (ans == "c") {
        $('#tanwin2check').attr("href", "#tanwin2correct");
    } else {
        $('#tanwin2check').attr("href", "#tanwin2incorrect");
    }
 }


 function checktanwin3() {
    var ans = $('input:radio[name=tanwin3]:checked').val();

   if (ans == "c") {
        $('#tanwin3check').attr("href", "#tanwin3correct");
    } else {
        $('#tanwin3check').attr("href", "#tanwin3incorrect");
    }
 }


 function checklam() {
    var ans = $('input:radio[name=lam]:checked').val();

   if (ans == "a") {
        $('#lamcheck').attr("href", "#lamcorrect");
    } else {
        $('#lamcheck').attr("href", "#lamincorrect");
    }
 }


 function checklam2() {
    var ans = $('input:radio[name=lam2]:checked').val();

   if (ans == "b") {
        $('#lam2check').attr("href", "#lam2correct");
    } else {
        $('#lam2check').attr("href", "#lam2incorrect");
    }
 }


 function checklam3() {
    var ans = $('input:radio[name=lam3]:checked').val();

   if (ans == "a") {
        $('#lam3check').attr("href", "#lam3correct");
    } else {
        $('#lam3check').attr("href", "#lam3incorrect");
    }
 }


 function checkmim() {
    var ans = $('input:radio[name=mim]:checked').val();

   if (ans == "c") {
        $('#mimcheck').attr("href", "#mimcorrect");
    } else {
        $('#mimcheck').attr("href", "#mimincorrect");
    }
 }


 function checkmim2() {
    var ans = $('input:radio[name=mim2]:checked').val();

   if (ans == "c") {
        $('#mim2check').attr("href", "#mim2correct");
    } else {
        $('#mim2check').attr("href", "#mim2incorrect");
    }
 }


 function checkmim3() {
    var ans = $('input:radio[name=mim3]:checked').val();

   if (ans == "a") {
        $('#mim3check').attr("href", "#mim3correct");
    } else {
        $('#mim3check').attr("href", "#mim3incorrect");
    }
 }

 