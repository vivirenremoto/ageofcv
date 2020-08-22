// iniciar variables
var buildings = ['blacksmith', 'house', 'barracks', 'university'];
var village_walking = false;
var final_x = 0;
var final_y = 0;
var current_x = 0;
var current_y = 0;
var trees_desktop = 20;
var trees_mobile = 10;
var is_car = false;

var walking_speed = 1;

var eagle_speed = 10000;
var music_start = false;

var screen_width = $(window).width();
var screen_height = $(window).height();

var villager_walking_class = 'villager_walking';
var eagle_flying_class = '';

var pressed_keys = [];
var latest_key = [];

var user_agent = navigator.userAgent.toLowerCase();
if (user_agent.indexOf('chrome') > -1 || user_agent.indexOf('firefox') > - 1) {
    villager_walking_class = 'villager_walking_webp';
    eagle_flying_class = 'eagle_flying_webp';
}


// delimitar zonas para que los edificios no se sobrepongan
if (screen_width < 480) {
    var zones = [
        {
            start_x: 0,
            end_x: screen_width,
            start_y: 0,
            end_y: (screen_height / 4) * 1
        },

        {
            start_x: 0,
            end_x: screen_width,
            start_y: (screen_height / 4) * 1,
            end_y: (screen_height / 4) * 2
        },

        {
            start_x: 0,
            end_x: screen_width,
            start_y: (screen_height / 4) * 2,
            end_y: (screen_height / 4) * 3
        },

        {
            start_x: 0,
            end_x: screen_width,
            start_y: (screen_height / 4) * 3,
            end_y: (screen_height / 4) * 4
        },

    ];

} else {
    var zones = [
        {
            start_x: 0,
            end_x: screen_width / 2,
            start_y: 0,
            end_y: screen_height / 2
        },

        {
            start_x: screen_width / 2,
            end_x: screen_width,
            start_y: 0,
            end_y: screen_height / 2
        },

        {
            start_x: 0,
            end_x: screen_width / 2,
            start_y: screen_height / 2,
            end_y: screen_height
        },

        {
            start_x: screen_width / 2,
            end_x: screen_width,
            start_y: screen_height / 2,
            end_y: screen_height
        },

    ];
}


// precargar imagenes
(new Image()).src = 'img/villager_walking.gif';
(new Image()).src = 'img/paper.png';

$(function () {
    init();
});

function init() {

    // arrow controls
    document.onkeydown = function (e) {


        if (e.which == 13) {
            if ($('#paper').is(':visible') == false) return;

            latest_key = [13];
            return;
        }


        if ($('#paper').is(':visible')) return;


        pressed_keys.push(e.which);

        pressed_keys = pressed_keys.filter(onlyUnique);



        if (pressed_keys.length == 1) {
            final_x = current_x;
            final_y = current_y;
        }


        // left
        if (pressed_keys.includes(37)) {
            final_x = 0;
        }

        // right
        if (pressed_keys.includes(39)) {
            final_x = screen_width;
        }

        // up
        if (pressed_keys.includes(38)) {
            final_y = 0;
        }

        // down
        if (pressed_keys.includes(40)) {
            final_y = screen_height;
        }

        latest_key = pressed_keys;


        startWalking();

    };

    document.onkeyup = function (e) {

        if (latest_key.includes(13)) {
            $('#close').click();
        } else {
            endWalking();
        }
        pressed_keys = [];

    };

    $('#eagle').addClass(eagle_flying_class);

    // botón cerrar ventana
    $('#close').click(function () {

        $('#paper').hide();
        $('#special').show();
        $('#land').removeClass('blur');
        document.getElementById('click').play();
    });

    // mover aldeano
    $('#canvas').click(function (e) {



        if ($('#paper').is(':visible')) return;

        final_x = e.offsetX;
        final_y = e.offsetY;

        startWalking();


        if (!is_car) {
            var talk_random = Math.floor(Math.random() * 2);
            if (talk_random == 1) {
                document.getElementById('villager_talk1').play();
            } else {
                document.getElementById('villager_talk2').play();
            }
        } else {
            document.getElementById('sound_car').play();

        }



        //}
    });


    // centrar aldeano
    current_x = screen_width / 2;
    current_y = screen_height / 2;

    $("#villager")
        .css('left', current_x + 'px')
        .css('top', current_y + 'px');


    // mostrar edificios aleatoriamente
    shuffle(buildings);

    for (var i = 0; i < buildings.length; i++) {
        $('#land').append('<div id="' + buildings[i] + '">&nbsp;</div>');

        var current_zone = zones[i];

        var building_width = parseInt($('#' + buildings[i]).css('width'));
        var building_height = parseInt($('#' + buildings[i]).css('height'));

        zone_x = (current_zone.end_x + current_zone.start_x - (building_width)) / 2;
        zone_y = (current_zone.end_y + current_zone.start_y - (building_height)) / 2;

        $('#' + buildings[i])
            .css('left', zone_x)
            .css('top', zone_y);
    }

    // mostrar arboles
    var tree_total;
    if (screen_width < 480) {
        tree_total = trees_mobile;
    } else {
        tree_total = trees_desktop;
    }

    for (var i = 1; i < tree_total; i++) {

        $('#land').append('<div id="tree' + i + '" class="tree">&nbsp;</div>');

        $("#tree" + i)
            .css('left', Math.floor(Math.random() * (screen_width - parseInt($('#tree' + i).css('width')))))
            .css('top', Math.floor(Math.random() * (screen_height - parseInt($('#tree' + i).css('height')))));
    }

    // terreno aleatorio
    var lands_images = ['grass.jpg', 'sand.jpg'];


    if (document.location.href.indexOf('wololo') == -1) {
        lands_images.push('snow.jpg');
    }

    var land_rand = Math.floor(Math.random() * lands_images.length);
    var land_image = lands_images[land_rand];
    $('#land').css('background-image', "url('img/" + land_image + "'");

    if (land_image.indexOf('sand') > -1) {
        $('.tree').addClass('palm');

    } else if (land_image.indexOf('snow') > -1) {
        $('.tree').addClass('tree_snow');

        $.getScript('js/snow.js');
    }

    // mostrar aguila de forma aleatoria
    if (screen_width < 480 || document.location.href.indexOf('wololo') > -1) {
        $('#eagle').remove();
    } else {
        flyEagle();
        setInterval(function () {
            flyEagle();
        }, eagle_speed * 2);
    }

}

function flyEagle() {
    var eagle_rand = Math.floor(Math.random() * 2);
    var eagle_final_x;
    var eagle_final_y;

    if (eagle_rand == 1) {
        eagle_start_x = 0;
        eagle_start_y = 0;
        eagle_final_x = screen_width;
        eagle_final_y = screen_height;
        $('#eagle').removeClass('eagle_flip_x');
    } else {
        eagle_start_x = screen_width - parseInt($("#eagle").css('width'));
        eagle_start_y = 0;
        eagle_final_x = 0;
        eagle_final_y = screen_height;
        $('#eagle').addClass('eagle_flip_x');
    }

    $("#eagle").css('left', eagle_start_x).css('top', eagle_start_y).show();

    $("#eagle").animate({
        left: eagle_final_x + 'px',
        top: eagle_final_y + 'px'
    },
        eagle_speed, 'linear', function () {
            $("#eagle").css('top', 0).css('left', 0).hide();
        });
}

function startWalking() {



    if (music_start == false) {

        music_start = true;




        if ($('#wololo').length == 0) {




            var music_random = Math.floor(Math.random() * 2);
            if (music_random == 1) {

                document.getElementById('bg_music1').volume = 0.6;
                document.getElementById('bg_music1').play();
            } else {

                document.getElementById('bg_music2').volume = 0.6;
                document.getElementById('bg_music2').play();
            }


        } else {

            wololo_start();

        }




    }



    if (!is_car) {
        $('#villager').addClass(villager_walking_class);
    }

    clearInterval(village_walking);

    // girar aldeano si se mueve a la izquierda o derecha
    village_walking = setInterval(function () {



        current_x = parseInt($('#villager').css('left'));
        current_y = parseInt($('#villager').css('top'));
        if (current_x > final_x) {
            $('#villager').removeClass('villager_flip_x');
        } else if (current_x < final_x) {
            $('#villager').addClass('villager_flip_x');
        }



        if (current_x == final_x && current_y == final_y) {
            endWalking();
        } else {
            var next_x = current_x;
            var next_y = current_y;

            if (current_x < final_x) {
                next_x += walking_speed;
            } else if (current_x > final_x) {
                next_x -= walking_speed;
            }

            if (current_y < final_y) {
                next_y += walking_speed;
            } else if (current_y > final_y) {
                next_y -= walking_speed;
            }

            $('#villager').css({
                'left': next_x + 'px',
                'top': next_y + 'px',
            });
        }


    }, 5);

}

function endWalking() {


    clearInterval(village_walking);

    if (!is_car) {
        $('#villager').removeClass(villager_walking_class);
    }

    // comprobar si estamos encima de un edificio
    var i = 0;
    var building_found;
    var current_building = false;
    var building_x, building_x2, building_y, building_y2;

    while (!building_found && i < buildings.length) {
        current_building = buildings[i];

        building_x = parseInt($('#' + current_building).css('left'));
        building_x2 = building_x + parseInt($('#' + current_building).css('width'));


        building_y = parseInt($('#' + current_building).css('top'));
        building_y2 = building_y + parseInt($('#' + current_building).css('height'));


        building_found = (current_x > building_x && current_x < building_x2)
            && (current_y > building_y && current_y < building_y2);


        i++;
    }

    if (building_found) {
        village_walking = true;
        $('#paper').show();
        $('#special').hide();
        $('#paper .pages').hide();
        $('#content_' + current_building).show();
        $('#land').addClass('blur');
        document.getElementById('sound_' + current_building).play();
    }

}

// https://www.kirupa.com/html5/using_the_pythagorean_theorem_to_measure_distance.htm
function getDistance(xA, yA, xB, yB) {
    var xDiff = xA - xB;
    var yDiff = yA - yB;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array?noredirect=1&lq=1
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;

}

// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}






//////////////////////////////////////////////

var wololo_move_x = 'right';
var wololo_move_y = 'down';
var wololo_speed;

if (screen_width < 480) {
    wololo_speed = 5;
} else {
    wololo_speed = 1;
}

function wololo_start() {


    //$('body').append('<img style="position: fixed; bottom: -40px; z-index: 3; left: -160px;" src="img/wololo.png" id="wololo">');


    document.getElementById('bg_music1').pause();
    document.getElementById('bg_music2').pause();
    document.getElementById('bg_wololo').play();



    setInterval(function () {

        var wololo_x = parseInt($('#wololo').css('left'));
        var wololo_y = parseInt($('#wololo').css('bottom'));

        if (wololo_x >= screen_width) {
            wololo_move_x = 'left';
            $('#wololo').removeClass('eagle_flip_x');
        } else if (wololo_x <= -160) {
            wololo_move_x = 'right';
            $('#wololo').addClass('eagle_flip_x');
        }

        if (wololo_move_x == 'right') {
            wololo_x += wololo_speed;
        } else {
            wololo_x -= wololo_speed;
        }

        $('#wololo').css('left', wololo_x + 'px');

        $('#land').css('opacity', 0.8);


        var random_color = "rgb("
            + Math.floor(Math.random() * 255) + ","
            + Math.floor(Math.random() * 255) + ","
            + Math.floor(Math.random() * 255) + ")";

        $('body').css('background', random_color);



    }, 1);

}

if (document.location.href.indexOf('wololo') > -1) {

    $('body').append('<img style="position: fixed; bottom: -40px; z-index: 3; left: -160px;" src="img/wololo.png" id="wololo">');

}


function car_start() {

    is_car = true;
    walking_speed = 2.5;
    $('#villager').addClass('car');



}

if (document.location.href.indexOf('howtoturnthison') > -1) {
    car_start();
}


