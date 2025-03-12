define([
    'skbJet/componentCRDC/splash/splashLoadController',
    'game/splashUIController'
], function(splashLoadController, splashUIController) {
    var predefinedData = {
        "swirlName": "swirl",
        "splashLogoName": "loadLogo",
        "backgroundSize": "100% 100%",
        landscape: {
            canvas: {
                width: 1440,
                height: 810,
                landscapeMargin: 0
            },
            gameImgDiv: {
                width: 1440,
                height: 810,
                top: 0
            },
            gameLogoDiv: {
                width: 750,
                height: 469,
                y: 280,
                scale: {
                    x: 1.3,
                    y: 1.3
                }
            },
            progressSwirl: {
                width: 160,
                height: 160,
                animationSpeed: 0.5,
                loop: true,
                y: 600,
                scale: {
                    x: 1,
                    y: 1
                }
            },
            progressTextDiv: {
                y: 600,
                style: {
                    fontSize: 25,
                    fill: "#ffffff",
                    fontWeight: 800,
                    fontFamily: "Oswald",
                    stroke: "#0901da",
                    strokeThickness: 4,
                    dropShadow: true,
                    dropShadowAlpha: 0.25,
                    dropShadowAngle: Math.PI / 3,
                    dropShadowBlur: 5,
                    dropShadowColor: "#0901da",
                    dropShadowDistance: 3
                }
            },
            copyRightDiv: {
                bottom: 20,
                fontSize: 20,
                color: "#70410b",
                fontFamily: '"Oswald"'
            }
        },
        portrait: {
            canvas: {
                width: 810,
                height: 1228,
                landscapeMargin: 0
            },
            gameImgDiv: {
                width: 810,
                height: 1228,
                top: 0
            },
            gameLogoDiv: {
                width: 750,
                height: 469,
                y: 400,
                scale: {
                    x: 1.3,
                    y: 1.3
                }
            },
            progressSwirl: {
                width: 160,
                height: 160,
                animationSpeed: 0.5,
                loop: true,
                y: 850,
                scale: {
                    x: 1,
                    y: 1
                }
            },
            progressTextDiv: {
                y: 850,
                style: {
                    fontSize: 25,
                    fill: "#ffffff",
                    fontWeight: 800,
                    fontFamily: "Oswald",
                    stroke: "#0901da",
                    strokeThickness: 4,
                    dropShadow: true,
                    dropShadowAlpha: 0.25,
                    dropShadowAngle: Math.PI / 3,
                    dropShadowBlur: 5,
                    dropShadowColor: "#0901da",
                    dropShadowDistance: 3
                }
            },
            copyRightDiv: {
                bottom: 20,
                fontSize: 20,
                color: "#70410b",
                fontFamily: '"Oswald"'
            }
        }
        //        }
    };

    var softId = window.location.search.match(/&?softwareid=(\d+.\d+.\d+)?/);
    var showCopyRight = false;
    if (softId) {
        if (softId[1].split('-')[2].charAt(0) !== '0') {
            showCopyRight = true;
        }
    }

    function onLoadDone() {
        splashUIController.onSplashLoadDone();
        window.postMessage('splashLoaded', window.location.origin);
    }

    function init() {
        splashUIController.init({ layoutType: 'IW', predefinedData: predefinedData, showCopyRight: showCopyRight });
        splashLoadController.load(onLoadDone);
    }
    init();
    return {};
});