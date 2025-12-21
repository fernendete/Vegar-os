let PlaceSelectorArrow = document.querySelector("#place-selector-arrow");
let PlaceSelector = document.querySelector("#place-selector");
let position = [1, 1]
let Level = 1
let ingame = false
let mainmenuEls = [
    "adventure",
    "more-ways",
    "extras #btn"
]
let LevelData = {
    seeds: ["peashooter", "sunflower"],
    zombies: [
        {
            row: 3,
            type: "regular"
        },
        [{ row: 3, type: "regular" }, { row: 3, type: "regular" }]
    ]
}
currentIndex = 0
let plants = {
    peashooter: {
        price: 100,
        animation: {
            width: 100,
            height: 107.5,
            size: 450,
            offset: [-10, 0],
            "frames": [
                { "pos": [0, 0] },
                { "pos": [-112, 0] },
                { "pos": [-224, 0] },
                { "pos": [-336, 0] },
                { "pos": [0, -110.5] },
                { "pos": [-112, -110.5] },
                { "pos": [-224, -110.5] },
                { "pos": [-336, -110.5] },
                { "pos": [0, -221] },
                { "pos": [-112, -221] },
                { "pos": [-224, -221] },
                { "pos": [-336, -221] },
                { "pos": [0, -331.5] },
                { "pos": [-112, -331.5] },
                { "pos": [-224, -331.5] },
                { "pos": [-336, -331.5] },
                { "pos": [0, -442] },
                { "pos": [-112, -442] },
                { "pos": [-224, -442] },
                { "pos": [-336, -442] },
                { "pos": [0, -552.5] },
                { "pos": [-112, -552.5] },
                { "pos": [-224, -552.5] },
                { "pos": [-336, -552.5] },
                { "pos": [0, -663] },
                { "pos": [-112, -663] },
                { "pos": [-224, -663] },
                { "pos": [-336, -663] },
            ]
        },
        code(x, y, pos) {
            setInterval(() => {
                console.log(pos, pos[1], pos[1] - 1)
                if (zombiesOnLines[pos[1] - 1] > 0) {
                    let pea = $("<div>", { class: "pea" })
                    pea.css("top", ((y - 1) * 116) + 10 + "px")
                    pea.css("left", (x - 1) * 90 + 60 + "px")
                    $("#projectiles").append(pea)
                    function goRight() {
                        let px = $(pea).position().left;
                        if (px < 800) {
                            pea.css("left", px + 4 + "px")
                            requestAnimationFrame(goRight)
                        } else {
                            console.log("COCHIEEEE")
                            pea.remove();
                        }
                    }
                    goRight()
                }
            }, 2000);
        }
    },
    sunflower: {
        price: 50,
        code(x, y) {
            setInterval(() => {
                makeSun(x, y)
            }, 7000);
        }
    }
}
let zombiesOnLines = [0, 0, 0, 0, 0]
let GamePadButtons = {
    lb: false,
    rb: false,
    a: false,
    leftStick: {
        right: false,
        left: false,
        up: false,
        down: false,
    }
}
function getSunCount() {
    return parseInt($("#suns").text());
}
$("#zombies").empty()
let CurrentSeedPacket = 1
let lastSeedPacket = 0
window.addEventListener("gamepadconnected", (event) => {
    console.log("Gamepad conectado:", event.gamepad);
});
function isColliding(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right ||
        rect1.right < rect2.left
    );
}
function makeZombie(line) {
    zombiesOnLines[line - 1] += 1
    console.log(zombiesOnLines)
    let zombie = $("<div>", { class: "zombie", health: "6" })
    zombie.css("top", (line - 1) * 106 + "px")
    $("#zombies").append(zombie)
    $(`#bush${line}`).css("animation", "bush-move .4s alternate 2")

    function goLeft() {
        let x = $(zombie).position().left;
        if (x + 106 > 0) {
            zombie.css("left", x - 0.3 + "px")
            requestAnimationFrame(goLeft)
        } else {
            zombie.remove();
        }
        $(".pea").each(function () {
            if (isColliding(zombie.get(0), this)) {
                zombie.attr("health", parseInt(zombie.attr("health")) - 1)
                $("#splat-sound")[0].play();
                if (zombie.attr("health") < 1) {
                    zombie.remove();
                    zombiesOnLines[line - 1] -= 1
                }
                $(this).remove();
            }
        })
    }
    goLeft()
}
function LevelPreview() {
    ingame = true
    $("#gameplay").show()
    $("#chooseyourseeds-music").get(0).play()
    $("#bck").css("background-image", "url('images/background1unsodded.png')")
    setTimeout(() => {
        $("#bck").css("translate", "-750px")
        setTimeout(() => {
            $("#bck").css("translate", "-250px")
            setTimeout(() => {
                $("#seed-bank").css("display", "block")
                addSeeds()
                $(".seed:nth-child(1)").addClass("current");
            }, 500)
            setTimeout(() => {
                $("#chooseyourseeds-music")[0].pause()
                StartGame()
            }, 1500);
        }, 3000);
    }, 3000);
}
function mainmenu() {

}
function StartGame() {
    ingame = true
    if (Level == 1) {
        let advice = makeAdvice("Press <div class='btn-a'></div> on the grass to plant your seed!")
        $(document).one("seedPlanted", () => {
            advice.remove();
        })
    }
    setInterval(makeSun, randomInt(5, 10) * 1000);
    $(PlaceSelector).show()
    $(PlaceSelectorArrow).show()
    $("#day-music")[0].play()
    loadZombies()
    makeGrid()
}
updateGamepad();
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getDistance(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    const cx1 = rect1.left + rect1.width / 2;
    const cy1 = rect1.top + rect1.height / 2;
    const cx2 = rect2.left + rect2.width / 2;
    const cy2 = rect2.top + rect2.height / 2;
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    return Math.sqrt(dx * dx + dy * dy);
}
function makeSun(x, y) {
    let sun = $("<div>", { class: "sun" })
    let reached = false
    $("#suns-container").append(sun)
    if (x && y) {
        sun.css({
            top: y + "px",
            left: x + "px"
        })
    }
    function goDown() {
        if (getDistance(sun.get(0), PlaceSelector) < 350) {
            let step = 1;

            function follow() {
                let x = $(sun).position().left;
                let y = $(sun).position().top;
                let tx = $(PlaceSelector).position().left - x;
                let ty = $(PlaceSelector).position().top - y;
                let dist = Math.sqrt(tx * tx + ty * ty);
                if (dist > 0) {
                    let dx = (tx / dist) * step;
                    let dy = (ty / dist) * step;
                    $(sun).css({
                        left: x + dx + "px",
                        top: y + dy + "px"
                    });
                    step += 0.2;
                }
                if (isColliding(sun.get(0), PlaceSelector)) {
                    reached = true
                    $(sun).remove();
                    $(sun).css({
                        top: "-20px",
                        left: "-50px",
                        transition: "all .5s"
                    })
                    $(sun).one("transitionend", function () {
                    });
                    $("#suns").text(getSunCount() + 25)
                    return
                }
                if (!reached) {
                    requestAnimationFrame(follow);
                }
            }
            follow();
        } else {
            let y = $(sun).position().top;
            if (y < 600) {
                sun.css("top", y + 1 + "px")
            }
        }
        requestAnimationFrame(goDown)
    }
    goDown()
}
function moveSelectorToArrow(x, y) {
    if (x < 81) {
        PlaceSelector.style.left = "0px"
        position[0] = 1
    } else if (x > 81 && x < 175) {
        PlaceSelector.style.left = "90px"
        position[0] = 2
    } else if (x > 175 && x < 280) {
        PlaceSelector.style.left = "190px"
        position[0] = 3
    } else if (x > 280 && x < 367) {
        PlaceSelector.style.left = "300px"
        position[0] = 4
    } else if (x > 367 && x < 470) {
        position[0] = 5
        PlaceSelector.style.left = "387px"
    } else if (x > 470 && x < 569) {
        position[0] = 6
        PlaceSelector.style.left = "490px"
    } else if (x > 569 && x < 664) {
        PlaceSelector.style.left = "589px"
        position[0] = 7
    } else if (x > 664 && x < 752) {
        PlaceSelector.style.left = "684px"
        position[0] = 8
    } else if (x > 752) {
        PlaceSelector.style.left = "772px"
        position[0] = 9
    }
    if (y < 117) {
        PlaceSelector.style.top = "0px"
        position[1] = 1
    } else if (y > 117 && y < 240) {
        PlaceSelector.style.top = "125px"
        position[1] = 2
    } else if (y > 240 && y < 355) {
        PlaceSelector.style.top = "250px"
        position[1] = 3
    } else if (y > 355 && y < 478) {
        PlaceSelector.style.top = "370px"
        position[1] = 4
    } else if (y > 478) {
        PlaceSelector.style.top = "490px"
        position[1] = 5
    }
}
function updateGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gp = gamepads[0];
        let x = $(PlaceSelectorArrow).position().left;
        let y = $(PlaceSelectorArrow).position().top;
        if (gp.buttons[4].pressed && !GamePadButtons.lb) {
            CurrentSeedPacket -= 1;
            if (CurrentSeedPacket < 0) { CurrentSeedPacket = 5; }
            console.log("Seed Packet seleccionado: " + CurrentSeedPacket);
        }
        if (gp.buttons[5].pressed && !GamePadButtons.rb && ingame) {
            CurrentSeedPacket += 1;
            if (CurrentSeedPacket > 5) { CurrentSeedPacket = 0; }
            console.log("Seed Packet seleccionado: " + CurrentSeedPacket);
        }
        if (gp.buttons[0].pressed && !GamePadButtons.a && ingame) {
            plant($(`.seed:nth-child(${CurrentSeedPacket})`).prop("id").replace("-seed", ""), position[0], position[1]);
        }

        if (CurrentSeedPacket != lastSeedPacket) {
            $(`.seed`).removeClass("current");
            $(`.seed:nth-child(${CurrentSeedPacket})`).addClass("current");
            let current = $(`.seed:nth-child(${CurrentSeedPacket})`);
            if (current.length) {
                $("#seed-bank #arrow").css({
                    left: `${current.position().left}px`
                })
            }
            lastSeedPacket = CurrentSeedPacket;
        }
        if (gp.axes[0] > 0.5 || gp.axes[0] < -0.5) {
            $("#place-selector-arrow").addClass("dragging");
            PlaceSelectorArrow.style.left = x + gp.axes[0] * 20 + "px";
            if ($(PlaceSelectorArrow).position().left < -17) {
                PlaceSelectorArrow.style.left = "-17px";
            }
            if ($(PlaceSelectorArrow).position().left > 785) {
                PlaceSelectorArrow.style.left = "785px";
            }
            $("#place-selector-arrow").removeClass("dragging");
        }
        if (!ingame) {
            if (gp.axes[0] > 0.5 && GamePadButtons.leftStick.right == false) {
                $("#select-sound")[0].play()
                $(`#${mainmenuEls[currentIndex]}`).removeClass("selected");
                currentIndex++
                $(`#${mainmenuEls[currentIndex]}`).addClass("selected");
            }
            if (gp.axes[0] < -0.5 && GamePadButtons.leftStick.left == false) {
                $("#select-sound")[0].play()
                $(`#${mainmenuEls[currentIndex]}`).removeClass("selected");
                currentIndex--
                $(`#${mainmenuEls[currentIndex]}`).addClass("selected");
            }
            if (gp.buttons[0].pressed && !GamePadButtons.a) {
                console.log("CHUCHI")
                $(`#${mainmenuEls[currentIndex]}`).trigger("click");
            }
        }
        if (gp.axes[0] > 0.5 && GamePadButtons.leftStick.right == false) {
            GamePadButtons.leftStick.right = true;
        } else if (gp.axes[0] < 0.5 || gp.axes[0] == 0) {
            GamePadButtons.leftStick.right = false;
        }
        if (gp.axes[0] < -0.5 && GamePadButtons.leftStick.left == false) {
            GamePadButtons.leftStick.left = true;
        } else if (gp.axes[0] > -0.5 || gp.axes[0] == 0) {
            GamePadButtons.leftStick.left = false;
        }
        if (gp.axes[1] > 0.5 || gp.axes[1] < -0.5) {
            PlaceSelectorArrow.style.top = y + gp.axes[1] * 20 + "px";
            $("#place-selector-arrow").addClass("dragging");
            if ($(PlaceSelectorArrow).position().top < 2) {
                PlaceSelectorArrow.style.top = "2px";
            }
            if ($(PlaceSelectorArrow).position().top > 593) {
                PlaceSelectorArrow.style.top = "593px";
            }
            $("#place-selector-arrow").removeClass("dragging");
        }
        if (gp.axes[1] < 0.5 || gp.axes[1] > -0.5 && gp.axes[0] < 0.5 || gp.axes[0] > -0.5) {
            $(PlaceSelectorArrow).css({
                left: `${$(PlaceSelector).position().left + ($(PlaceSelector).width() / 2) - 12.5}px`,
                top: `${$(PlaceSelector).position().top}px`
            })
        }
        GamePadButtons.lb = gp.buttons[4].pressed;
        GamePadButtons.rb = gp.buttons[5].pressed;
        GamePadButtons.a = gp.buttons[0].pressed;
        moveSelectorToArrow(x, y)
    }
    requestAnimationFrame(updateGamepad);
}
function makeGrid() {
    let grid = $(`#grid`)
    grid.empty()
    for (let i = 1; i <= 5; i++) {
        for (let j = 1; j <= 9; j++) {
            let cell = $(`<div class="cell" pos="${j}${i}"></div>`)
            grid.append(cell);
        }
    }
}
function makeAdvice(ad) {
    let advice = $("<div>", { class: "advice" })
    let text = $("<div>", { id: "text" })
    text.html(ad)
    advice.append(text)
    $("body").append(advice)
    return advice
}
function plant(ReqPlant, x, y) {
    let grid = $(`#grid .cell[pos='${x}${y}']`)
    if (grid.children().length > 0 || getSunCount() < plants[ReqPlant].price || Level == 1 && position[1] != 3) {
        $("#wrong-sound")[0].play();
        return;
    }
    $("#suns").text(getSunCount() - plants[ReqPlant].price)
    $(document).trigger("seedPlanted");

    $(`#${ReqPlant}-seed`).addClass("recharging")
    let $plant = $("<div>", { class: "plant", id: document.querySelectorAll(".plant").length + 1 }).css({
        width: `${plants[ReqPlant].animation.width}px`,
        height: `${plants[ReqPlant].animation.height}px`,
        "background-size": `${plants[ReqPlant].animation.size}px`,
        "background-image": `url('reanim/${ReqPlant}.png')`
    })
    $("#put-sound")[0].play();
    grid.append($plant);
    plants[ReqPlant].code((x - 1) * 90, (y - 1) * 116, [x, y])
    let frames = plants[ReqPlant].animation.frames
    let off = plants[ReqPlant].animation.offset
    setInterval(() => {
        for (let i of frames) {
            setTimeout(() => {
                $plant.css({
                    "background-position": `${i.pos[0] + (off[0] || 0)}px ${i.pos[1]}px`
                })
            }, 47 * frames.indexOf(i))
        }
    }, frames.length * 47);
}
function addSeeds() {
    let seedbank = $("#seed-bank #seeds #cont")
    seedbank.empty()
    for (let seed of LevelData.seeds) {
        let $seed = $("<div>", { class: "seed", id: `${seed}-seed` }).css("background-image", `url('images/${seed}.svg')`)
        let recharge = $("<div>", { class: "recharge" })
        $seed.append(recharge)
        seedpacket($seed)
        seedbank.append($seed)
    }
    function seedpacket($el) {
        function check() {
            if (getSunCount() < plants[$el.prop("id").replace("-seed", "")].price) {
                $el.addClass("disabled")
            } else {
                $el.removeClass("disabled")
            }
            requestAnimationFrame(check)
        }
        check()
    }
}
function loadZombies() {
    let zombies = LevelData.zombies
    setInterval(() => {
        for (let z of zombies) {
            if (Array.isArray(z)) {
                for (let zz of z) {
                    setTimeout(() => {
                        makeZombie(zz.row)
                    }, 1000 * z.indexOf(zz))
                }
            } else {
                makeZombie(z.row)
            }
        }
    }, 15000);
}
$("#adventure").on("click", function () {
    let btn = $(this)
    btn.css({
        backgroundImage: "url('reanim/mainmenu3/start adventure pressed.png')"
    })
    setTimeout(() => {
        btn.removeAttr("style");
        $("#mainmenu").hide()
        LevelPreview()
    }, 300)
})