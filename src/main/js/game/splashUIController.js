/**
 * @module splashUIController
 * @description control UI in splash page.
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/splashUtil',
    'com/pixijs/pixi',
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'game/bkSplashUtil'
], function (msgBus, SKBeInstant, splashUtil, PIXI, resLib, pixiResourceLoader, bkSplashUtil) {
    var gameImgDiv;

    var featureTextDiv;
    var copyRightDiv, copyRightText = '';
    var scaleRate = 1;
    var type = 'slot';

    var predefinedData;
    var styleData;
    var logoSprite, swirlAnim, progressText;
    var spriteSheetAnimationMap;
    var showCopyRight = true;
    var orientation = 'landscape';
    function updateDataByDisplayMode() {
        var winW = Math.floor(Number(window.innerWidth));
        var winH = Math.floor(Number(window.innerHeight));
        if (winW >= winH) {
            orientation = 'landscape';
            styleData = predefinedData.landscape;
        } else {
            orientation = 'portrait';
            styleData = predefinedData.portrait;
        }
    }

    function initDom() {
        gameImgDiv = document.createElement('div');
        gameImgDiv.id = 'gameImgDiv';
        document.body.appendChild(gameImgDiv);
        gameImgDiv.style.position = 'absolute';
        gameImgDiv.style.backgroundSize = 'contain';
        gameImgDiv.style.backgroundRepeat = 'no-repeat';
        gameImgDiv.style.left = 0;

        featureTextDiv = document.createElement('div');
        featureTextDiv.id = 'featureTextDiv';
        document.body.appendChild(featureTextDiv);
        featureTextDiv.style.position = 'absolute';
        featureTextDiv.style.textAlign = 'center';

        /*copyRightDiv = document.createElement('div');
         copyRightDiv.id = 'copyRightDiv';
         document.body.appendChild(copyRightDiv);
         copyRightDiv.style.position = 'absolute';
         copyRightDiv.style.width = '100%';
         copyRightDiv.style.textAlign = 'center';*/
    }

    function updateBackground() {
        try {
            var imgUrl = orientation + 'BG';
            if (resLib && resLib.splash && resLib.splash[imgUrl]) {
                var bgImgUrl = resLib.splash[imgUrl].src;
                if (bgImgUrl) {
                    console.log(resLib);
                    document.body.style.backgroundImage = 'url(' + bgImgUrl + ')';
                }
            }
            document.body.style.backgroundSize = predefinedData.backgroundSize;
        } catch (e) {
            console.warn('Splash: There are no background images in the /splash folder');
            console.warn(e.message);
        }
    }

    function scale(defaultValue) {
        return Math.round(defaultValue * scaleRate) + 'px';
    }

    function onWindowResized() {
        updateDataByDisplayMode();
        updateBackground();

        setCanvasElements();
        var pdd = styleData;

        var winW = Math.floor(Number(window.innerWidth));
        var winH = Math.floor(Number(window.innerHeight));
        document.documentElement.style.width = winW + 'px';
        document.documentElement.style.height = winH + 'px';
        document.body.style.width = winW + 'px';
        document.body.style.height = winH + 'px';

        var ele = document.getElementById('changeBK');
        if (ele) {
            try {
                if (!resLib.splash.landscapeLoading && !resLib.splash.portraitLoading) { //didn't differentiate landscape or portrait
                    ele.style.backgroundImage = 'url(' + resLib.splash.loading.src + ')';
                } else {
                    // If you require background images - place one for each orientation in assetPacks/{pack}/splash/
                    // with the names landscapeLoading & portraitLoading
                    if (orientation === 'landscape') {
                        ele.style.backgroundImage = 'url(' + resLib.splash.landscapeLoading.src + ')';
                    } else {
                        ele.style.backgroundImage = 'url(' + resLib.splash.portraitLoading.src + ')';
                    }
                }

                //ele.style.backgroundSize = predefinedData.backgroundSize;
            } catch (e) {
                console.warn('Splash: There are no background images in the /splash folder');
                console.warn(e.message);
            }
            ele.width = winW + 'px';
            ele.height = winH + 'px';
            ele.style.width = winW + 'px';
            ele.style.height = winH + 'px';
        }
        bkSplashUtil.fitSize(winW, winH);

        splashUtil.fitSize(winW, winH);
        var ele2 = document.getElementById('loadDiv');
        if (ele2) {
            ele2.width = winW + 'px';
            ele2.height = winH + 'px';
            ele2.style.width = winW + 'px';
            ele2.style.height = winH + 'px';
        }
        var defaultW = pdd.canvas.width + (winW > winH ? (2 * pdd.canvas.landscapeMargin) : 0);//winW > winH?1920:1040;
        var defaultH = pdd.canvas.height;//winW > winH?1080:760;
        var whRate = defaultW / defaultH;//'landscape' : 'portrait'
        var canvasWidth;
        if (winW / winH > whRate) {
            canvasWidth = Math.floor(winH * whRate);
        } else {
            canvasWidth = winW;
        }

        scaleRate = canvasWidth / defaultW;

        gameImgDiv.style.top = scale(pdd.gameImgDiv.top);
        gameImgDiv.style.width = scale(pdd.gameImgDiv.width);
        gameImgDiv.style.height = scale(pdd.gameImgDiv.height);

        if (pdd.featureTextDiv) {
            featureTextDiv.style.top = scale(pdd.gameImgDiv.top + pdd.gameImgDiv.height);
            featureTextDiv.style.width = scale(pdd.canvas.width);
            featureTextDiv.style.height = scale(pdd.featureTextDiv.height);
            featureTextDiv.style.padding = scale(pdd.featureTextDiv.padding);
            featureTextDiv.style.fontSize = scale(pdd.featureTextDiv.fontSize);
        }

        if (!copyRightDiv) {
            copyRightDiv = document.createElement('div');
            copyRightDiv.id = 'copyRightDiv';
            document.body.appendChild(copyRightDiv);
            copyRightDiv.style.position = 'absolute';
            copyRightDiv.style.width = '100%';
            copyRightDiv.style.textAlign = 'center';
            copyRightDiv.innerHTML = copyRightText;
        }
        splashUtil.applyDomStyle(copyRightDiv, styleData.copyRightDiv);
        copyRightDiv.style.bottom = scale(pdd.copyRightDiv.bottom);
        copyRightDiv.style.fontSize = scale(pdd.copyRightDiv.fontSize);
    }

    function onMessage(e) {
        var percentLoadedStr = e.data.loaded || null;
        if (percentLoadedStr === 100) {
            msgBus.publish('updateBKOpacity');
        }
        if (percentLoadedStr !== null) {
            if (progressText) {
                progressText.text = percentLoadedStr + '%';
                progressText.pivot.x = progressText.width / 2;
                progressText.pivot.y = progressText.height / 2;
            }
        }

    }

    initDom();

    function applyLogoStyle() {
        if (!logoSprite) {
            logoSprite = new PIXI.Sprite();
            splashUtil.getSplashPixiContainer().addChild(logoSprite);
        }
        if (predefinedData.splashLogoName) {//to support single logo for landscape&portrait
            logoSprite.texture = PIXI.Texture.fromFrame(predefinedData.splashLogoName);
        } else {
            logoSprite.texture = PIXI.Texture.fromFrame(predefinedData[orientation].splashLogoName);
        }
        //logoSprite.texture = PIXI.Texture.fromFrame(predefinedData[orientation].splashLogoName);
        splashUtil.applyStyle(logoSprite, styleData.gameLogoDiv);
        logoSprite.pivot.x = Number(styleData.gameLogoDiv.width / 2);
        logoSprite.pivot.y = Number(styleData.gameLogoDiv.height / 2);
        logoSprite.x = Math.round(Number(styleData.canvas.width) / 2);

        window.logoSprite = logoSprite;
    }
    function applySwirlStyle() {
        if (!swirlAnim) {
            if (!spriteSheetAnimationMap) {
                spriteSheetAnimationMap = splashUtil.searchSplashSpriteSheetAnimationFromTextureCache();
            }
            swirlAnim = PIXI.extras.AnimatedSprite.fromFrames(spriteSheetAnimationMap[predefinedData.swirlName]);
            swirlAnim.animName = predefinedData.swirlName;
            splashUtil.getSplashPixiContainer().addChild(swirlAnim);
        }
        splashUtil.applyStyle(swirlAnim, styleData.progressSwirl);
        swirlAnim.pivot.x = Number(styleData.progressSwirl.width / 2);
        swirlAnim.pivot.y = Number(styleData.progressSwirl.height / 2);
        swirlAnim.x = Math.round(Number(styleData.canvas.width) / 2);
        swirlAnim.gotoAndPlay(0);
        window.swirlAnim = swirlAnim;
    }

    function applyProgressStyle() {
        if (!progressText) {
            progressText = new PIXI.Text();
            splashUtil.applyStyle(progressText, styleData.progressTextDiv);
            progressText.style.align = 'center';
            progressText.text = '1%';
            progressText.pivot.x = progressText.width / 2;
            progressText.pivot.y = progressText.height / 2;
            splashUtil.getSplashPixiContainer().addChild(progressText);
        }
        progressText.x = Math.round(Number(styleData.canvas.width) / 2);

        splashUtil.applyStyle(progressText, styleData.progressTextDiv);
        progressText.style.align = 'center';
        window.progressText = progressText;
    }

    function applyCanvas() {
        splashUtil.getSplashRender().resize(styleData.canvas.width, styleData.canvas.height);
    }

    function setCanvasElements() {
        applyCanvas();
        applyLogoStyle();
        applySwirlStyle();
        applyProgressStyle();
    }

    msgBus.subscribe('updateBKOpacity', function () {
        var imgUrl = orientation + 'BG';
        if (resLib && resLib.splash && resLib.splash[imgUrl]) {
            var bgImgUrl = resLib.splash[imgUrl].src;
            if (bgImgUrl) {
                console.log(resLib);
                document.body.style.backgroundImage = 'url(' + bgImgUrl + ')';
            }
        }
        var ele = document.getElementById('changeBK');
        var interval = setInterval(function () {
            if (ele && ele.style.opacity >= 0.1) {
                ele.style.opacity -= 0.1;
            } else {
                clearInterval(interval);
            }
        }, 50);

    });

    return {
        onSplashLoadDone: function () {
            updateDataByDisplayMode();
            updateBackground();
            var str = "";
            if (resLib.i18n.splash.splashScreen.brand) {
                str = resLib.i18n.splash.splashScreen.brand;
            }
            if (showCopyRight) {
                if (str === "") {
                    str += resLib.i18n.splash.splashScreen.footer.shortVersion;
                } else {
                    str += '<br>' + resLib.i18n.splash.splashScreen.footer.shortVersion;
                }
            }
            //copyRightDiv.innerHTML = str;
            copyRightText = str;
            onWindowResized();
            window.addEventListener('message', onMessage, false);
            window.addEventListener('resize', onWindowResized);
            bkSplashUtil.getTicker().start();
            splashUtil.getTicker().start();
        },
        /**
         * @function init
         * @desc Init load parameters.
         * @param options. "options" contains layoutType - IW or slot, predefinedData - asstes info, showCopyRight - default is true.
         */
        init: function (options) {
            if (options && options.layoutType) {
                type = options.layoutType;
            } else {
                type = 'slot';
            }
            console.log(type);
            predefinedData = options.predefinedData; //example refer to //streams_skateboard_jet/studio-artifacts-CRDC-main/components/splash/splashLoadController/README.md
            if (options.showCopyRight === false) {
                showCopyRight = options.showCopyRight;
            }
            updateDataByDisplayMode();
            var gameWidth = Math.floor(Number(window.innerWidth));
            var gameHeight = Math.floor(Number(window.innerHeight));
            bkSplashUtil.addCanvas(gameWidth, gameHeight, document.body);
            splashUtil.addCanvas(styleData.canvas.width, styleData.canvas.height, document.body);
        },
        scale: scale
    };
});