/**
 * @module game/playAnimationController
 * @description 
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    "skbJet/component/gladPixiRenderer/Sprite",
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/TextMatchToImage',
    'skbJet/componentCRDC/gladRenderer/gladButton'
], function(msgBus, audio, gr, loader, SKBeInstant, Sprite, gameUtils, TextMatchToImage, GladButton) {
    var PIXI = require('com/pixijs/pixi');
    var SCREEN_STATE = Object.freeze({ BASE_GAME_STATE: 0, BONUS_GAME_STATE: 1 });
    var SYMBOL_NUM = Object.freeze({ BASE: 12, BONUS: 10 });
    var textStyle = ({ fontFamily: 'Oswald,arial,helvetica,sans-serif', fontWeight: "600", fill: "#ffffff", padding: 2, dropShadow: true, dropShadowDistance: 2.5, fontSize: 30 });
    var BASE_FOOTBALL_LEVEL = 3;
    var FIRE_SIGN;
    var winMap;
    var currentState;
    var symbolMatrix,
        scenarioDataMatrix;
    var soccerWinTotalCounter;
    var soccerCounterWhilePlaying;
    var bonusWinLevel;
    var bonus_X_Counter;
    var bonusPrizeLevelArray;
    var autoPlaying;
    var allNeedToReveal,
        bonusNeedToReveal;
    var footballPlayerFlashArray;
    var resultData,
        baseGameResultData,
        bonusGameResultData;
    var symbolRevealNum,
        symbolRealNum;
    var symbolAllRevealed = false;
    var baseGameRevealChannel = 0;
    //var addSoccerContainer = null;
    var addCupFlashContainer = null;
    var addCupFireContainer = null;
    var goldenFlashArray = [];
    var cupFireFlashArray = [];
    //var bonusSoccerArray = [];
    var cloneSoccer = 0;
    var cloneCupFlash = 0;
    var cloneCupFire = 0;
    var gameLogoFlashTimer = null;
    var flashLight;
    var flashTimeInterval = null;
    // cameraFlash
    var medianNuber = 0;
    var totalCountDownTime = 5;
    var bonusDimCloseTimer = null;
    var normalCameraPlay = true;
    var addCameraLightContainer = null;
    var addCameraLightContainerNext = null;
    var normalCameraLightTimer = null;
    var winCameraLightTimer = null;
    // footballFlashProgress
    var flashMaskResetFlag = 0;
    var flashMask,
        stepCount,
        maskWidth,
        maskHeight,
        progressCount = 0;
    var bonusTotalX = 0,
        bonusTotalPeople = 0;

    var enableAutoplay = false;
    var footballProgressKey = {
        updateStyleIfPlaying: function() {
            if (!this.footballProgressPlaying) {
                return;
            } else {
                if (progressCount >= this.stopSign) {
                    this.footballProgressPlaying = false;
                    return;
                }
                progressCount += stepCount;
                maskWidth -= stepCount;
                flashMask.clear();
                flashMask.beginFill();
                flashMask.drawRect(maskWidth, 0, progressCount, maskHeight);
                flashMask.endFill();
                gr.lib._footballFlashMask.pixiContainer.x += stepCount;
            }
        },
        footballProgressPlaying: false,
        totalTime: 850,
        stopSign: 0
    };
    gr.animMap.footballProgressKey = footballProgressKey;


    var prizeValue;
    var winBoxErrotIsShown = false;

    function addFootballFlashMask() {
        maskWidth = gr.lib._footballFlash._currentStyle._width;
        maskWidth += gr.lib._footballFlash._currentStyle._left;
        maskHeight = gr.lib._footballFlash._currentStyle._height;
        flashMask = new PIXI.Graphics();
        flashMask.beginFill();
        flashMask.drawRect(maskWidth, 0, 0, maskHeight);
        flashMask.endFill();
        gr.lib._footballFlashMask.pixiContainer.addChild(flashMask);
        gr.lib._footballFlash.pixiContainer.mask = flashMask;
    }

    function resetFootballFlashMask() {
        gr.lib._footballFlashMask.pixiContainer.x = flashMaskResetFlag;
        maskWidth = gr.lib._footballFlash._currentStyle._width;
        maskWidth += gr.lib._footballFlash._currentStyle._left;
        flashMask.clear();
        flashMask.beginFill();
        flashMask.drawRect(maskWidth, 0, 0, maskHeight);
        flashMask.endFill();
    }

    function generateTheMedian(max, min) {
        var middleRandom = Math.floor(Math.random() * (max - min) + min);
        return middleRandom;
    }

    function addAndPlayCameraLight() {
        var _left = generateTheMedian(gr.lib._cameraLightArea_00._currentStyle._width - gr.lib._cameraLight_00._currentStyle._width / 2, 0);
        var _top = generateTheMedian(gr.lib._cameraLightArea_00._currentStyle._height - gr.lib._cameraLight_00._currentStyle._height / 2, 0);
        var _leftNext = generateTheMedian(gr.lib._cameraLightArea_01._currentStyle._width - gr.lib._cameraLightNext_00._currentStyle._width / 2, 0);
        var _topNext = generateTheMedian(gr.lib._cameraLightArea_01._currentStyle._height - gr.lib._cameraLightNext_00._currentStyle._height / 2, 0);
        if (normalCameraPlay) {
            medianNuber = generateTheMedian(800, 400);
            if (winCameraLightTimer) { clearTimeout(winCameraLightTimer); }
            gr.lib._cameraLight_00.updateCurrentStyle({ _left: _left, _top: _top });
            gr.lib._cameraLightNext_00.updateCurrentStyle({ _left: _leftNext, _top: _topNext });
            gr.lib._cameraLight_00.show(true);
            gr.lib._cameraLightNext_00.show(true);
            gr.lib._cameraLight_00.gotoAndPlay('flash', 0.8, false);
            gr.lib._cameraLightNext_00.gotoAndPlay('flash', 0.8, false);
            normalCameraLightTimer = gr.getTimer().setTimeout(addAndPlayCameraLight, medianNuber);
        }
    }

    function clearTimeout(timeout) {
        if (timeout !== null) {
            gr.getTimer().clearTimeout(timeout);
            timeout = null;
        }
    }

    function clearGameTimer() {
        clearTimeout(gameLogoFlashTimer);
        clearTimeout(normalCameraLightTimer);
        clearTimeout(winCameraLightTimer);
        clearTimeout(flashTimeInterval);
    }

    function specialWinlineAnimation(num, rowNumber) {
        gr.animMap["_winScaleInOut_" + num]._onComplete = function() {
            symbolMatrix[rowNumber].forEach(function(item, index) {
                if (item) {
                    index = addZero(rowNumber * 3 + Number(index));
                    gr.animMap["_winScaleInOut_" + index].play();
                }
            });
            gr.animMap["_winScaleInOut_" + num].play();
            gr.animMap["_winScaleInOut_" + num]._onComplete = function() {
                gr.animMap["_winScaleInOut_" + num].play();
            };
        };
    }

    function winScaleInOutAnimation(num) {
        gr.animMap["_winScaleInOut_" + num]._onComplete = function() {
            gr.animMap["_winScaleInOut_" + num].play();
        };
    }


    function setGameAnimComplete() {
        gr.lib._gameLogoFlash.onComplete = function() { this.show(false); };
        gr.lib._cameraLight_00.onComplete = function() { this.show(false); };
        gr.lib._cameraLightNext_00.onComplete = function() { this.show(false); };
        gr.animMap._footballRotation._onComplete = function() { this.play(); };
        gr.animMap._bonusIntroCloseAnim._onComplete = function() { this.play(); };
        gr.lib._goldenFlash.onComplete = function() { this.show(false); };
        gr.lib._cupFireContainer.onComplete = function() { this.show(false); };
        for (var i = 0; i < SYMBOL_NUM.BASE; i++) {
            i = addZero(i);
            winScaleInOutAnimation(i);
        }
    }

    function gameLogoFlash() {
        var timer = generateTheMedian(7000, 3000);
        gr.lib._gameLogoFlash.show(true);
        gr.lib._gameLogoFlash.gotoAndPlay("logoHelpful", 0.5, false);
        gameLogoFlashTimer = gr.getTimer().setTimeout(gameLogoFlash, timer);
    }

    function baseGameBorderFlash() {
        gr.lib._baseGameBorder.gotoAndPlay("fourCorners", 0.15, true);
    }

    function baseGameLevelNumberFlash() {
        for (var i = 0; i < 4; i++) {
            gr.lib["_gameSymbolLevel_0" + i].gotoAndPlay("arrow", 0.15, true);
        }
    }

    function initOrResetGame() {
        currentState = SCREEN_STATE.BASE_GAME_STATE;
        scenarioDataMatrix = [
            [],
            [],
            [],
            []
        ];
        symbolMatrix = [
            [],
            [],
            [],
            []
        ];
        winMap = {};
        soccerWinTotalCounter = 0;
        soccerCounterWhilePlaying = 0;
        footballPlayerFlashArray = [];
        bonusWinLevel = 0;
        bonus_X_Counter = 0;
        autoPlaying = false;
        bonusPrizeLevelArray = [];
        allNeedToReveal = [];
        bonusNeedToReveal = [];
        flashLight = [];
        symbolRevealNum = 12;
        symbolRealNum = 12;
        if (SKBeInstant.config.customBehavior) {
            totalCountDownTime = SKBeInstant.config.customBehavior.totalCountDownTime || 5;
        } else {
            totalCountDownTime = 5;
        }
        //Reset coverBG.
        for (var i = 0; i < SYMBOL_NUM.BASE; i++) {
            i = addZero(i);
            if (gr.lib["_coverBG_" + i].pixiContainer.$sprite.playing) { gr.lib["_coverBG_" + i].stopPlay(); }
            if (Math.floor(i / 3) === 1 || Math.floor(i / 3) === 3) {
                gr.lib["_coverBG_" + i].setImage("blueClothes_0000");
            } else {
                gr.lib["_coverBG_" + i].setImage("greenClothes_0000");
            }
            gr.lib["_coverBG_" + i].show(true);
        }
        for (i = 0; i < SYMBOL_NUM.BASE; i++) {
            i = addZero(i);
            allNeedToReveal.push(i); // need to clear array
            flashLight.push(i);
            gr.lib["_footballReveal_" + i + "_00"].show(false);
            gr.lib["_footballReveal_" + i + "_01"].show(false);
            gr.lib["_footballReveal_" + i + "_00"].setImage("threeLittleFootballs_0000");
            gr.lib["_footballReveal_" + i + "_01"].setImage("threeLittleFootballs_0000");
            gr.lib["_winAward_" + i].setText("");
        }
        for (i = 0; i < BASE_FOOTBALL_LEVEL; i++) {
            gr.lib["_footballLevel_0" + i].show(false);
            gr.lib["_footballLevel_0" + i].updateCurrentStyle({ _width: 0 });
        }
        gr.lib._bonusWinShow.autoFontFitText = true;
        gr.lib._bonusWinShow.show(false);
        gr.lib._celebratePieces.show(false);
        gr.lib._gameLogoFlash.show(false);
        gr.lib._baseGame.show(true);
        gr.lib._bonusGame.show(false);
        gr.lib._bonusGame.updateCurrentStyle({ _opacity: 0 });
    }

    function resetBonusScene() {
        bonusTotalX = 0;
        bonusTotalPeople = 0;
        cloneSoccer = 0;
        cloneCupFlash = 0;
        cloneCupFire = 0;
        goldenFlashArray = [];
        cupFireFlashArray = [];
        //bonusSoccerArray = [];
        for (var i = 0; i < SYMBOL_NUM.BONUS; i++) {
            gr.lib["_symbolCoverBGFlash_0" + i].setImage("remakeBroken_0000");
            gr.lib["_symbolCoverBGFlash_0" + i].show(true);
            gr.lib["_symbolX_0" + i].setImage("redFork_0000");
            gr.lib["_symbolX_0" + i].show(false);
            gr.lib["_symbolWinResult_0" + i].setImage("");
            gr.lib["_symbolWinResult_0" + i].show(false);
            if (gr.lib["_symbolBWin_0" + i].pixiContainer.$sprite.playing) { gr.lib["_symbolBWin_0" + i].stopPlay(); }
            gr.lib["_symbolBWin_0" + i].setImage("");
            gr.lib["_symbolBWin_0" + i].show(false);
            if (gr.lib["_symbolCoverRound_0" + i].pixiContainer.$sprite.playing) { gr.lib["_symbolCoverRound_0" + i].stopPlay(); }
            gr.lib["_symbolCoverRound_0" + i].setImage("blueOutside_0000");
            gr.lib["_symbolCoverRound_0" + i].show(true);
            gr.lib["_symbolWinBase_0" + i].show(false);
        }
        //Reset golden level
        for (i = 0; i < 5; i++) {
            gr.lib["_goldenLevelDim_0" + i].setImage("yellowBar_0" + i + "_0000");
            gr.lib["_lastWinLevel_0" + i].show(false);
            gr.lib["_goldenLevelDim_0" + i].show(true);
            if (Number(gr.lib["_goldenLevel_0" + i + "_text"].pixiContainer.$text._style._strokeThickness) > 0) {
                gr.lib["_goldenLevel_0" + i + "_text"].updateCurrentStyle({
                    _top: gr.lib["_goldenLevel_0" + i + "_text"]._currentStyle._top + 1
                });
            }
            gr.lib["_goldenLevel_0" + i + "_text"].updateCurrentStyle({
                _text: {
                    _strokeWidth: 0,
                    _color: "FFFFFF",
                    _strokeColor: "2ed7be"
                },
                _opacity: 0.6
            });
            gameUtils.setTextStyle(gr.lib["_goldenLevel_0" + i + "_text"], {
                padding: 3,
                dropShadow: true,
                dropShadowDistance: 2,
                dropShadowColor: "#000000"
            });
        }
        //Reset golden footer X iamge.
        for (i = 0; i < 3; i++) {
            gr.lib["_goldenFooterX_0" + i].show(false);
        }
        //Reset bonus win text.
        gr.lib._winsValueBonus_text.setText("");
        //Reset soccer in image.
        gr.lib._soccerIn.setImage("inSoccer_0000");
        gr.lib._soccerIn.show(false);
        //Reset bonus intro alpha.
        gr.lib._bonusIntro.updateCurrentStyle({ _opacity: 1 });
        //When game trigger bonus, reset first golden flash onFrameChange function.
        gr.lib._goldenFlash.pixiContainer.$sprite.onFrameChange = null;
    }

    function flashingLight() {
        if (flashLight.length === 0) {
            clearTimeout(flashTimeInterval);
            return;
        }
        var randomNumber = Math.floor(Math.random() * flashLight.length);
        var currentNumber = flashLight[randomNumber];
        gr.lib["_ironLight_" + currentNumber].show(true);
        gr.lib["_ironLight_" + currentNumber].gotoAndPlay("sweepClothes", 0.8);
        gr.lib["_ironLight_" + currentNumber].onComplete = function() {
            this.show(false);
        };
        flashTimeInterval = gr.getTimer().setTimeout(flashingLight, 2000);
    }

    function cloneAnimationForSoccer() {
        var AnimationName, numberNameList;

        for (var i = 1; i < 12; i++) {
            i = addZero(i);
            AnimationName = '_winScaleInOut_' + i;
            numberNameList = ['_winAward_' + i];
            gr.animMap._winScaleInOut_00.clone(numberNameList, AnimationName);
            AnimationName = '_symbolDimAnim_' + i;
            numberNameList = ['_symbolDim_' + i];
            gr.animMap._symbolDimAnim_00.clone(numberNameList, AnimationName);
        }
        for (i = 1; i < 10; i++) {
            AnimationName = '_symbolWinBaseFeedIn_0' + i;
            numberNameList = ['_symbolWinBase_0' + i];
            gr.animMap._symbolWinBaseFeedIn_00.clone(numberNameList, AnimationName);
            AnimationName = '_symbolWinResultFeedOut_0' + i;
            numberNameList = ['_symbolWinResult_0' + i];
            gr.animMap._symbolWinResultFeedOut_00.clone(numberNameList, AnimationName);
        }
        for (i = 1; i < 12; i++) {
            i = addZero(i);
            AnimationName = '_footballRevealAnim_' + i + '_00';
            numberNameList = ['_footballReveal_' + i + '_00'];
            gr.animMap._footballRevealAnim_00_00.clone(numberNameList, AnimationName);
        }
        for (i = 0; i < 12; i++) {
            i = addZero(i);
            AnimationName = '_footballRevealAnim_' + i + '_01';
            numberNameList = ['_footballReveal_' + i + '_01'];
            gr.animMap._footballRevealAnim_00_00.clone(numberNameList, AnimationName);
        }
    }

    function cloneDataFromOriginData() {
        //addSoccerContainer = gr.lib._soccerContainer.data;
        addCupFlashContainer = gr.lib._goldenFlash.data;
        addCupFireContainer = gr.lib._cupFireContainer.data;
        addCameraLightContainer = gr.lib._cameraLight_00.data;
        addCameraLightContainerNext = gr.lib._cameraLightNext_00.data;
    }

    function onGameParametersUpdated() {
        initOrResetGame();
        cloneAnimationForSoccer();
        addFootballFlashMask();
        setGameAnimComplete();
        cloneDataFromOriginData();
        flashMaskResetFlag = gr.lib._footballFlashMask.pixiContainer.x;
        FIRE_SIGN = gr.lib._footballBG.pixiContainer.$sprite.width / 3;
        for (var i = 0; i < SYMBOL_NUM.BASE; i++) {
            i = addZero(i);
            gr.lib["_winAward_" + i].autoFontFitText = true;
        }
        gr.lib._footballFlash.gotoAndPlay("fire", 0.25, true);
        enableAutoplay = SKBeInstant.config.autoRevealEnabled === false ? false : true;
    }
    // resetAll function for reStart and moveToManey
    function resetAll() {
        initOrResetGame();
        resetBonusScene();
        resetFootballFlashMask();
        clearGameTimer();
        footballProgressKey.stopSign = 0;
        footballProgressKey.footballProgressPlaying = false;
        progressCount = 0;
        if (gr.lib._footballPlayer.pixiContainer.$sprite.playing) { gr.lib._footballPlayer.gotoAndStop("0"); }
        gr.lib._footballPlayer.pixiContainer.$sprite.onFrameChange = null;
        gr.lib._footballPlayer.onComplete = null;
        gr.lib._footballPlayer.setImage('run_0000');
        if (gr.lib._baseGameBorder.pixiContainer.$sprite.playing) { gr.lib._baseGameBorder.gotoAndStop("0"); }
        if (gr.animMap._footballRotation.isPlaying()) {
            gr.animMap._footballRotation.stop();
            gr.lib._football.updateCurrentStyle({ _transform: { Rotate: 0 } });
        }
        if (!gr.lib._buttonInfo.pixiContainer.interactive) {
            gr.lib._buttonInfo.setImage("buttonInfo");
            gr.lib._buttonInfo.pixiContainer.interactive = true;
            gr.lib._buttonInfo.pixiContainer.$sprite.cursor = "pointer";

            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "howToPlay", "event": "enable", "params": [1] }
            });
            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "paytable", "event": "enable", "params": [1] }
            });

        }
        for (var i = 0; i < SYMBOL_NUM.BASE; i++) {
            i = addZero(i);
            if (gr.lib["_symbolBG_" + i].pixiContainer.$sprite.playing) {
                gr.lib["_symbolBG_" + i].stopPlay();
                gr.lib["_symbolBG_" + i].setImage("winningAnimation_0000");
            }
            if (gr.animMap["_winScaleInOut_" + i].isPlaying()) {
                gr.animMap["_winScaleInOut_" + i].stop();
                gr.lib['_winAward_' + i].updateCurrentStyle({ _transform: { _scale: { _x: 1, _y: 1 } } });
            }
            if (gr.animMap["_footballRevealAnim_" + i + "_00"].isPlaying()) {
                gr.animMap["_footballRevealAnim_" + i + "_00"].stop();
                gr.lib["_footballReveal_" + i + "_00"].updateCurrentStyle({ _transform: { _rotate: 0 } });
            }
            if (gr.animMap["_footballRevealAnim_" + i + "_01"].isPlaying()) {
                gr.animMap["_footballRevealAnim_" + i + "_01"].stop();
                gr.lib["_footballReveal_" + i + "_01"].updateCurrentStyle({ _transform: { _rotate: 0 } });
            }
            if (gr.lib["_symbolDim_" + i].pixiContainer.visible) {
                gr.lib["_symbolDim_" + i].show(false);
                gr.lib["_symbolDim_" + i].updateCurrentStyle({ _opacity: 0 });
            }
        }
        for (i = 0; i < 4; i++) {
            if (gr.lib["_gameSymbolLevel_0" + i].pixiContainer.$sprite.playing) {
                gr.lib["_gameSymbolLevel_0" + i].gotoAndStop("0");
            }
        }
        if (gr.animMap._footballBGLineAnim.isPlaying()) {
            gr.animMap._footballBGLineAnim.stop();
            gr.lib._footballBGLine.updateCurrentStyle({ _opacity: 1 });
        }
    }

    function addZero(par) {
        par = par < 10 ? "0" + par : par;
        return par;
    }

    function banOrOpenInteractive(array, containerName, bool) {
        array.forEach(function(item) {
            if (item !== null) {
                gr.lib[containerName + item].pixiContainer.interactive = bool;
                if (bool) {
                    gr.lib[containerName + item].pixiContainer.$sprite.cursor = "pointer";
                } else {
                    gr.lib[containerName + item].pixiContainer.$sprite.cursor = "auto";
                }
            }
        });
    }

    function checkAllRevealed() {
        if (symbolRevealNum === 0) {
            var result = 0;
            for (var symbol in winMap) {
                result += Number(winMap[symbol]);
            }
            if (result !== prizeValue) {
                winBoxErrorHandler();
                return;
            }
            gr.lib._baseGameBorder.gotoAndStop(0);
            symbolAllRevealed = true;
            msgBus.publish("allSymbolRevealed", symbolAllRevealed);
        }
    }

    function winBoxErrorHandler() {
        banOrOpenInteractive(allNeedToReveal, "_coverBG_", false);
        banOrOpenInteractive(bonusNeedToReveal, "_bonusClickArea_", false);
        gr.lib._buttonInfo.show(false);

        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "howToPlay", "event": "enable", "params": [0] }
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "paytable", "event": "enable", "params": [0] }
        });


        winBoxErrotIsShown = true;
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        msgBus.publish('tutorialIsShown');
        msgBus.publish('onDisableUI');
        msgBus.publish('clearAutoPlay');
        gr.lib._winBoxError.show(true);
    }

    function updateWinValue() {
        var result = 0;
        for (var symbol in winMap) {
            result += Number(winMap[symbol]);
        }
        if (result > prizeValue) {
            winBoxErrorHandler();
            return;
        }
        gr.lib._winsValue.setText(SKBeInstant.formatCurrency(result).formattedAmount);
        gameUtils.fixMeter(gr);
    }

    function countDownTime(totalCountDownTime) {
        gr.lib._bonusIntroClose.setText(totalCountDownTime);
        gr.animMap._bonusIntroCloseAnim.play();
        gr.animMap._bonusIntroCloseAnim._onComplete = function() {
            totalCountDownTime--;
            if (totalCountDownTime > 0) {
                gr.lib._bonusIntroClose.setText(totalCountDownTime);
                gr.animMap._bonusIntroCloseAnim.play();
            } else {
                gr.lib._bonusIntroClose.setText(loader.i18n.Game.go);
                gr.lib._bonusIntroClose.updateCurrentStyle({ _transform: { _x: 0, _y: 0 }, _opacity: 1 });
                gr.animMap._bonusIntroCloseGo.play();
                gr.animMap._bonusIntroCloseAnim._onComplete = null;
                gr.animMap._bonusIntroCloseGo._onComplete = function() {
                    bonusDimCloseTimer = gr.getTimer().setTimeout(function() {
                        gr.animMap._bonusIntroFadeout.play();
                        gr.animMap._bonusIntroFadeout._onComplete = function() {
                            gr.lib._bonusIntro.show(false);
                        };
                    }, 500);
                };
            }
        };
    }

    function initBonusIntro() {
        var textMatchToImage = new TextMatchToImage(gr.lib._bonusIntro_text, loader.i18n.Game.bonusIntro, textStyle);
        textMatchToImage.updateStyle();
        gr.lib._bonusIntroClose.setText("");
        gr.lib._bonusIntro.show(true);
        gr.lib._bonusIntro.pixiContainer.$sprite.interactive = true;
        gr.lib._bonusIntro.pixiContainer.$sprite.cursor = "pointer";
        gr.lib._bonusIntro.on("click", function() {
            if (gr.animMap._bonusIntroCloseAnim.isPlaying()) { gr.animMap._bonusIntroCloseAnim.stop(); }
            if (gr.animMap._bonusIntroCloseGo.isPlaying()) { gr.animMap._bonusIntroCloseGo.stop(); }
            if (gr.animMap._bonusIntroFadeout.isPlaying()) { gr.animMap._bonusIntroFadeout.stop(); }
            if (bonusDimCloseTimer) { clearTimeout(bonusDimCloseTimer); }
            gr.lib._bonusIntro.show(false);
            gr.lib._bonusIntro.pixiContainer.$sprite.cursor = "auto";
        });

        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "howToPlay", "event": "enable", "params": [1] }
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "paytable", "event": "enable", "params": [1] }
        });
    }

    function initBonusScene() {
        bonusGameResultData = resultData.scenario.substr(resultData.scenario.indexOf("|")).match(/(\w{1})/g);
        resultData.prizeTable.forEach(function(item) {
            if (item.description.match(/\d/)) {
                bonusPrizeLevelArray.unshift(item.prize);
            }
        });
        bonusPrizeLevelArray.forEach(function(item, index) {
            gr.lib["_goldenLevel_0" + index + "_text"].autoFontFitText = true;
            gr.lib["_goldenLevel_0" + index + "_text"].setText(SKBeInstant.formatCurrency(item).formattedAmount);
            gameUtils.setTextStyle(gr.lib["_goldenLevel_0" + index + "_text"], {
                padding: 3,
                dropShadow: true,
                dropShadowDistance: 2
            });
        });
        for (var i = 0; i < 3; i++) {
            gr.lib["_goldenFooterX_0" + i].show(false);
        }
        for (i = 0; i < 5; i++) {
            gr.lib["_lastWinLevel_0" + i].show(false);
        }
        for (i = 0; i < 10; i++) {
            i = addZero(i);
            gr.lib["_noWinBonusSymbolDim_" + i].show(false);
            gr.lib["_symbolWinBase_" + i].show(false);
            gr.lib["_soccerContainer_" + i].show(false);
            bonusNeedToReveal.push(i); // need to clear array
        }
        initBonusIntro();
        gr.lib._winsTextBonus_text.autoFontFitText = true;
        gr.lib._winsTextBonus_text.setText(loader.i18n.Game.WINS);
        gr.lib._winsValueBonus_text.autoFontFitText = true;
        gr.lib._winsValueBonus_text.setText("");
        //gr.lib._soccerContainer.show(false);
        gr.lib._cupFireContainer.show(false);
        gr.lib._soccerIn.show(false);
    }

    function initBonusAction() {
        gr.lib._goldenFlash.show(true);
        gr.lib._soccerIn.show(true);
        gr.lib._soccerIn.gotoAndPlay("inSoccer", 0.4, false);
        gr.lib._goldenFlash.gotoAndPlay("trophyLamp", 0.5, false);
        for (var i = 0; i < 10; i++) {
            gr.lib["_symbolCoverRound_0" + i].gotoAndPlay("blueOutside", 0.25, true);
        }
        revealAction(SYMBOL_NUM.BONUS, "_bonusClickArea_");
    }

    function noWinDimShow(rowNumber) {
        var index;
        for (var i = 0; i < 3; i++) {
            index = addZero(rowNumber * 3 + i);
            gr.lib["_symbolDim_" + index].show(true);
            gr.animMap["_symbolDimAnim_" + index].play();
        }
    }

    function winLineFlash(rowNumber) {
        var spriteCurrentNumber = null;
        var haveScaled = false;
        var index;
        for (var i = 0; i < SYMBOL_NUM.BASE; i++) {
            i = addZero(i);
            if (gr.lib["_symbolBG_" + i] && gr.lib["_symbolBG_" + i].pixiContainer.$sprite.playing) {
                spriteCurrentNumber = gr.lib["_symbolBG_" + i].pixiContainer.$sprite.currentFrame;
                break;
            }
        }
        if (gr.lib["_symbolBG_" + addZero(rowNumber * 3)].onComplete === null) {
            gr.lib["_symbolBG_" + addZero(rowNumber * 3)].onComplete = function() {
                for (i = 0; i < 3; i++) {
                    index = addZero(rowNumber * 3 + i);
                    gr.lib["_symbolBG_" + index].stopPlay();
                    gr.lib["_symbolBG_" + index].gotoAndPlay('winningAnimation', 0.25, false);
                }
            };
        }
        for (i = 0; i < 3; i++) {
            index = addZero(rowNumber * 3 + i);
            if (spriteCurrentNumber) {
                gr.lib["_symbolBG_" + index].gotoAndPlay('winningAnimation', 0.25, false, spriteCurrentNumber);
            } else {
                gr.lib["_symbolBG_" + index].gotoAndPlay('winningAnimation', 0.25, false);
            }
            for (var j = 0; j < SYMBOL_NUM.BASE; j++) {
                j = addZero(j);
                if (gr.animMap["_winScaleInOut_" + j].isPlaying() && Math.floor(j / 3) !== Math.floor(index / 3)) {
                    haveScaled = true;
                    specialWinlineAnimation(j, rowNumber);
                    break;
                }
            }
            if (!haveScaled) { gr.animMap["_winScaleInOut_" + index].play(); }
        }
    }

    function setBGSymbolContent(prizeType, index) {
        index = addZero(index);
        for (var i = 0; i < resultData.prizeTable.length; i++) {
            if (prizeType === resultData.prizeTable[i].description) {
                gr.lib["_winAward_" + index].setText(SKBeInstant.formatCurrency(resultData.prizeTable[i].prize).formattedAmount);
                break;
            }
        }
    }

    function revealAction(symbolLength, symbolName) {
        for (var i = 0; i < symbolLength; i++) {
            i = addZero(i);
            symbolClickHandler(gr.lib[symbolName + i]);
        }
    }

    function symbolClickHandler(symbol) {
        var _THIS = symbol;
        _THIS.revealFlag = false;
        setRevealBehavior(_THIS);
        var gladSymbol = new GladButton(_THIS, null, { "avoidMultiTouch": true });
        _THIS.clickListener = gladSymbol.click(function(event) {
            event.stopPropagation();
            _THIS.reveal();
        });
        _THIS.pixiContainer.$sprite.interactive = true;
        _THIS.pixiContainer.$sprite.cursor = "pointer";
    }

    function setRevealBehavior(symbol) {
        symbol.reveal = function() {
            if (!symbol.revealFlag) {
                var index = Number(symbol.getName().match(/(\d+)/g).join());
                symbol.revealFlag = true;
                symbol.off("click", symbol.clickListner);
                symbol.pixiContainer.$sprite.interactive = false;
                if (currentState === SCREEN_STATE.BASE_GAME_STATE) {
                    var ironLightNumber = addZero(index);
                    gr.lib["_ironLight_" + ironLightNumber].show(false);
                    if (gr.lib["_ironLight_" + ironLightNumber].pixiContainer.playing) {
                        gr.lib["_ironLight_" + ironLightNumber].stopPlay();
                        gr.lib["_ironLight_" + ironLightNumber].setImage("sweepClothes_0000");
                    }
                    var clickCurrentData = scenarioDataMatrix[Math.floor(index / 3)].shift();
                    var bonusNum = Number(clickCurrentData.substr(1));
                    setBGSymbolContent(clickCurrentData.substr(0, 1), index);
                    if (baseGameRevealChannel >= 5) { baseGameRevealChannel = 0; }
                    baseGameRevealChannel++;
                    audio.play("Reveal1", baseGameRevealChannel);
                    symbolRealNum--;
                    if (symbolRealNum === 0) { msgBus.publish("disableUI"); }
                    var coverBG_Animation = symbol.getImage() === "blueClothes_0000" ? "blueClothes" : "greenClothes";
                    msgBus.publish("deletedRevealSymbol", index);
                    msgBus.publish("symbolIsReveal", true);
                    if (bonusNum > 0) {
                        soccerWinTotalCounter += bonusNum;
                        if (soccerWinTotalCounter === 3) {
                            if (autoPlaying) {
                                msgBus.publish("clearAutoPlay");
                            } else {
                                if (symbolRealNum !== 0) {
                                    gr.lib._buttonInfo.pixiContainer.interactive = false;
                                    gr.lib._buttonInfo.pixiContainer.$sprite.cursor = "auto";
                                    gr.lib._buttonInfo.setImage("buttonInfoInactive");


                                    msgBus.publish('toPlatform', {
                                        channel: "Game",
                                        topic: "Game.Control",
                                        data: { "name": "howToPlay", "event": "enable", "params": [0] }
                                    });
                                    msgBus.publish('toPlatform', {
                                        channel: "Game",
                                        topic: "Game.Control",
                                        data: { "name": "paytable", "event": "enable", "params": [0] }
                                    });


                                }
                            }
                            if (symbolRealNum !== 0) {
                                gr.lib._buttonAutoPlay.pixiContainer.interactive = false;
                                gr.lib._buttonAutoPlay.pixiContainer.$sprite.cursor = "auto";
                                gr.lib._buttonAutoPlay.setImage("buttonCommonInactive");

                                msgBus.publish('toPlatform', {
                                    channel: "Game",
                                    topic: "Game.Control",
                                    data: { "name": "howToPlay", "event": "enable", "params": [0] }
                                });
                                msgBus.publish('toPlatform', {
                                    channel: "Game",
                                    topic: "Game.Control",
                                    data: { "name": "paytable", "event": "enable", "params": [0] }
                                });


                                banOrOpenInteractive(allNeedToReveal, "_coverBG_", false);
                            }
                            clearTimeout(flashTimeInterval);
                        }
                    }
                    for (var i = 0; i < flashLight.length; i++) {
                        if (Number(ironLightNumber) === Number(flashLight[i])) {
                            flashLight.splice(i, 1);
                            break;
                        }
                    }
                    symbol.gotoAndPlay(coverBG_Animation, 0.35, false);
                    symbol.onComplete = function() {
                        msgBus.publish("symbolIsReveal", false);
                        if (!autoPlaying && symbolRealNum !== 0 && !gr.lib._tutorial.pixiContainer.visible) {
                            gr.lib._buttonInfo.show(true);
                            gr.lib._buttonMTM.show(true);

                            msgBus.publish('toPlatform', {
                                channel: "Game",
                                topic: "Game.Control",
                                data: { "name": "howToPlay", "event": "enable", "params": [1] }
                            });
                            msgBus.publish('toPlatform', {
                                channel: "Game",
                                topic: "Game.Control",
                                data: { "name": "paytable", "event": "enable", "params": [1] }
                            });


                        }
                        symbol.show(false);
                        baseGameLogic(index, bonusNum);
                    };
                } else {
                    audio.play("Select", 8);
                    bonusNeedToReveal[index] = null;
                    bonusGameLogic(index);
                }
            }
        };
    }

    function bonusGameLogic(nameNum) {
        var currentResult = bonusGameResultData.shift();
        var bonusSymbolRound = null;
        var currentAudio = null;
        if (currentResult === "X") {
            bonusTotalX++;
        } else {
            bonusTotalPeople++;
        }
        if (bonusTotalX === 3 || bonusTotalPeople === 5) {
            gr.lib._buttonInfo.pixiContainer.interactive = false;
            gr.lib._buttonInfo.pixiContainer.$sprite.cursor = "auto";
            gr.lib._buttonInfo.setImage("buttonInfoInactive");


            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "howToPlay", "event": "enable", "params": [0] }
            });
            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "paytable", "event": "enable", "params": [0] }
            });


            banOrOpenInteractive(bonusNeedToReveal, "_bonusClickArea_", false);
            for (var i = 0; i < bonusNeedToReveal.length; i++) {
                if (bonusNeedToReveal[i] !== null) {
                    gr.lib["_symbolCoverRound_" + bonusNeedToReveal[i]].stopPlay();
                    gr.lib["_symbolCoverRound_" + bonusNeedToReveal[i]].show(false);
                    gr.lib["_noWinBonusSymbolDim_" + bonusNeedToReveal[i]].show(true);
                }
            }
        }
        if (currentResult === "X") {
            currentAudio = "Miss";
            bonusSymbolRound = "purpleOutside_0000";
            gr.lib["_symbolWinResult_0" + nameNum].show(false);
            gr.lib["_symbolX_0" + nameNum].show(true);
            gr.lib["_symbolBWin_0" + nameNum].setImage("purpleInside");
        } else {
            currentAudio = "Hit";
            bonusSymbolRound = "yellowOutside_0000";
            gr.lib["_symbolX_0" + nameNum].show(false);
            gr.lib["_symbolWinResult_0" + nameNum].show(true);
            gr.lib["_symbolBWin_0" + nameNum].setImage("yellowInside");
        }
        gr.lib["_symbolBWin_0" + nameNum].show(true);
        gr.lib["_soccerContainer_0" + nameNum].show(true);
        gr.lib["_soccerContainer_0" + nameNum].gotoAndPlay("soccerAnim9", 0.8, false);
        gr.lib["_soccerContainer_0" + nameNum].onComplete = function() {
            this.show(false);
            bonusSoccerComplete(currentResult, bonusSymbolRound, nameNum, currentAudio);
        };
    }


    function bonusSoccerComplete(currentResult, bonusSymbolRound, nameNum, currentAudio) {
        gr.lib["_symbolCoverBGFlash_0" + nameNum].show(true);
        gr.lib["_symbolCoverBGFlash_0" + nameNum].gotoAndPlay("remakeBroken", 0.8, false);
        if (currentResult === "X") {
            audio.play(currentAudio + (bonus_X_Counter + 1), bonus_X_Counter + 6);
        } else {
            audio.play(currentAudio + (bonusWinLevel + 1), bonusWinLevel + 1);
        }
        gr.lib["_symbolCoverBGFlash_0" + nameNum].onComplete = function() {
            gr.lib["_symbolCoverBGFlash_0" + nameNum].show(false);
            var spriteCurrentNumber = gr.lib["_symbolCoverRound_0" + nameNum].pixiContainer.$sprite.currentFrame;
            if (currentResult === "X") {
                gr.lib["_symbolCoverRound_0" + nameNum].setImage(bonusSymbolRound);
                gr.lib["_symbolCoverRound_0" + nameNum].gotoAndPlay("purpleOutside", 0.25, true, spriteCurrentNumber);
                gr.lib["_symbolX_0" + nameNum].gotoAndPlay("redFork", 1, false);
                gr.lib["_goldenFooterX_0" + bonus_X_Counter].show(true);
                bonus_X_Counter++;
            } else {
                var lastLevel = bonusWinLevel - 1;
                var currentLevel = bonusWinLevel;
                var currentLevelFlash = "yellowBar_0" + bonusWinLevel;
                gr.lib["_symbolCoverRound_0" + nameNum].setImage(bonusSymbolRound);
                gr.lib["_symbolCoverRound_0" + nameNum].gotoAndPlay("yellowOutside", 0.25, true, spriteCurrentNumber);
                gr.lib["_symbolWinResult_0" + nameNum].gotoAndPlay("kickTheBall", 0.5, false);
                gr.lib["_symbolWinResult_0" + nameNum].onComplete = function() {
                    gr.lib["_symbolWinBase_0" + nameNum].show(true);
                    gr.animMap["_symbolWinResultFeedOut_0" + nameNum]._onComplete = function() {
                        gr.lib["_symbolWinResult_0" + nameNum].show(false);
                        gr.lib["_symbolWinResult_0" + nameNum].updateCurrentStyle({ _opacity: 1 });
                    };
                    gr.animMap["_symbolWinResultFeedOut_0" + nameNum].play();
                    gr.animMap["_symbolWinBaseFeedIn_0" + nameNum].play();
                };
                gr.lib["_goldenLevelDim_0" + currentLevel].gotoAndPlay(currentLevelFlash, 0.5, false);
                gr.lib["_goldenLevelDim_0" + currentLevel].onComplete = function() {
                    gr.lib["_goldenLevelDim_0" + currentLevel].setImage("brightYellow_0" + currentLevel);
                };
                if (goldenFlashArray.length > 0 && goldenFlashArray[goldenFlashArray.length - 1].pixiContainer.$sprite.playing) {
                    addCupFlashContainer._name = "_goldenFlash" + cloneCupFlash;
                    cloneCupFlash++;
                    var newGoldenFlash = gr.lib._goldenCup.addChildFromData(addCupFlashContainer);
                    goldenFlashArray.push(newGoldenFlash);
                    newGoldenFlash.gotoAndPlay("trophyLamp", 0.5, false);
                    newGoldenFlash.pixiContainer.$sprite.onFrameChange = function() {
                        if (this.currentFrame === 27) {
                            if (cupFireFlashArray.length > 0 && goldenFlashArray[goldenFlashArray.length - 1].pixiContainer.$sprite.playing) {
                                addCupFireContainer._name = "_cupFireContainer" + cloneCupFlash;
                                cloneCupFire++;
                                var newCupFire = gr.lib._cupFire.addChildFromData(addCupFireContainer);
                                cupFireFlashArray.push(newCupFire);
                                newCupFire.gotoAndPlay("fireworks", 0.5, false);
                                newCupFire.onComplete = function() {
                                    this.show(false);
                                    gr.lib._cupFire.pixiContainer.removeChild(newCupFire);
                                };
                            } else {
                                gr.lib._cupFireContainer.gotoAndPlay("fireworks", 0.5, false);
                            }
                        }
                    };
                    newGoldenFlash.onComplete = function() {
                        newGoldenFlash.show(false);
                        gr.lib._goldenCup.pixiContainer.removeChild(newGoldenFlash);
                    };
                } else {
                    gr.lib._goldenFlash.show(true);
                    gr.lib._goldenFlash.gotoAndPlay("trophyLamp", 0.5, false);
                    gr.lib._goldenFlash.pixiContainer.$sprite.onFrameChange = function() {
                        if (this.currentFrame === 27) {
                            gr.lib._cupFireContainer.show(true);
                            gr.lib._cupFireContainer.gotoAndPlay("fireworks", 0.5, false);
                        }
                    };
                    goldenFlashArray.push(gr.lib._goldenFlash);
                    cupFireFlashArray.push(gr.lib._cupFireContainer);
                }
                gr.lib["_goldenLevel_0" + bonusWinLevel + "_text"].updateCurrentStyle({
                    _text: {
                        _strokeWidth: 1.5,
                        _color: "FFFFFF",
                        _strokeColor: "01091b"
                    },
                    _opacity: 1,
                    _top: gr.lib["_goldenLevel_0" + bonusWinLevel + "_text"]._currentStyle._top - 1
                });
                gameUtils.setTextStyle(gr.lib["_goldenLevel_0" + bonusWinLevel + "_text"], { dropShadow: false });
                if (gr.lib["_lastWinLevel_0" + lastLevel]) {
                    gr.lib["_lastWinLevel_0" + lastLevel].show(true);
                    gr.lib["_goldenLevelDim_0" + lastLevel].show(false);
                    gr.lib["_goldenLevel_0" + lastLevel + "_text"].updateCurrentStyle({
                        _text: {
                            _strokeWidth: 0,
                            _color: "2C0202"
                        },
                        _top: gr.lib["_goldenLevel_0" + lastLevel + "_text"]._currentStyle._top + 1
                    });
                    gameUtils.setTextStyle(gr.lib["_goldenLevel_0" + lastLevel + "_text"], { dropShadow: false });
                }
                winMap.bonusLevel = bonusPrizeLevelArray[bonusWinLevel];
                if (gr.animMap._winsTextBonusFlash.isPlaying()) { gr.animMap._winsTextBonusFlash.stop(); }
                gr.animMap._winsTextBonusFlash.play();
                gr.lib._winsValueBonus_text.setText(SKBeInstant.formatCurrency(bonusPrizeLevelArray[bonusWinLevel]).formattedAmount);
                updateWinValue();
                bonusWinLevel++;
            }
            if (bonus_X_Counter === 3) {
                gr.lib["_symbolX_0" + nameNum].onComplete = function() {
                    gr.lib["_symbolX_0" + nameNum].onComplete = null;
                    if (bonusWinLevel > 0) {
                        audio.play("PlaqueWins", 9);
                        if (gr.animMap._winsTextBonusFlash.isPlaying()) {
                            gr.animMap._winsTextBonusFlash.stop();
                        }
                        gr.animMap._goldenFooterAnim_00.play(3);
                        gr.animMap._winsTextBonusFlash.play(3);
                        gr.animMap._winsTextBonusFlash._onComplete = function() {
                            gr.animMap._winsTextBonusFlash._onComplete = null;
                            if (winBoxErrotIsShown) {
                                return;
                            }
                            gr.getTimer().setTimeout(function() {
                                updateScene(SCREEN_STATE.BASE_GAME_STATE);
                            }, 2000);
                        };
                    } else {
                        gr.animMap._goldenFooterAnim_00.play(3);
                        gr.animMap._goldenFooterAnim_00._onComplete = function() {
                            gr.animMap._goldenFooterAnim_00._onComplete = null;
                            if (winBoxErrotIsShown) {
                                return;
                            }
                            gr.getTimer().setTimeout(function() {
                                updateScene(SCREEN_STATE.BASE_GAME_STATE);
                            }, 2000);
                        };
                    }
                };
            }
            if (bonusWinLevel === 5) {
                gr.animMap["_symbolWinBaseFeedIn_0" + nameNum]._onComplete = function() {
                    audio.play("PlaqueWins", 9);
                    gr.animMap["_symbolWinBaseFeedIn_0" + nameNum]._onComplete = null;
                    if (gr.animMap._winsTextBonusFlash.isPlaying()) {
                        gr.animMap._winsTextBonusFlash.stop();
                        gr.animMap._winsTextBonusFlash.play(3);
                    } else {
                        gr.animMap._winsTextBonusFlash.play(3);
                    }
                    gr.animMap._winsTextBonusFlash._onComplete = function() {
                        gr.animMap._winsTextBonusFlash._onComplete = null;
                        gr.getTimer().setTimeout(function() {
                            updateScene(SCREEN_STATE.BASE_GAME_STATE);
                        }, 2000);
                    };
                };
            }
        };
    }

    function footballPlayerFlash(bonusNum) {
        soccerCounterWhilePlaying += bonusNum;
        footballProgressKey.footballProgressPlaying = true;
        if (Number(bonusNum) === 1) {
            if (!gr.animMap._footballRotation.isPlaying()) { gr.animMap._footballRotation.play(); }
            if (gr.animMap._footballBGRotation.isPlaying()) { gr.animMap._footballBGRotation.stop(); }
            gr.animMap._footballBGRotation.play();
            gr.lib["_footballLevel_0" + (soccerCounterWhilePlaying - 1)].show(true);
            gr.animMap["_footballLevelAdd_0" + (soccerCounterWhilePlaying - 1)].play();
            if (soccerCounterWhilePlaying === 3) {
                audio.play("Match3", 3);
                footballProgressKey.stopSign = FIRE_SIGN * 3;
                gr.lib._footballPlayer.gotoAndPlay("run", 1 / 3, false, 36);
                gr.lib._footballPlayer.onComplete = function() {
                    gr.lib._footballPlayer.onComplete = null;
                    gr.animMap._footballBGLineAnim._onComplete = function() {
                        this.play();
                    };
                    gr.animMap._footballBGLineAnim.play();
                    normalCameraPlay = false;
                    addAndPlayCameraLight();
                    gr.getTimer().setTimeout(ribbonsFlash, 200);
                };
            } else {
                if (soccerCounterWhilePlaying === 1) {
                    audio.play("Match1", 1);
                    footballProgressKey.stopSign = FIRE_SIGN + 15;
                    gr.lib._footballPlayer.gotoAndPlay("run", 1 / 3, false);
                    gr.lib._footballPlayer.pixiContainer.$sprite.onFrameChange = function() {
                        if (this.currentFrame >= 20) {
                            gr.lib._footballPlayer.pixiContainer.$sprite.onFrameChange = null;
                            gr.lib._footballPlayer.stopPlay();
                            if (footballPlayerFlashArray.length >= 1) {
                                footballPlayerFlash(footballPlayerFlashArray[0].bonusNum);
                                footballPlayerFlashArray.shift();
                            }
                        }
                    };
                } else {
                    audio.play("Match2", 2);
                    footballProgressKey.stopSign = FIRE_SIGN * 2 + 5;
                    gr.lib._footballPlayer.gotoAndPlay("run", 1 / 3, false, 22);
                    gr.lib._footballPlayer.pixiContainer.$sprite.onFrameChange = function() {
                        if (this.currentFrame >= 36) {
                            gr.lib._footballPlayer.pixiContainer.$sprite.onFrameChange = null;
                            if (footballPlayerFlashArray.length >= 1) {
                                footballPlayerFlash(footballPlayerFlashArray[0].bonusNum);
                                footballPlayerFlashArray.shift();
                            } else {
                                gr.lib._footballPlayer.stopPlay();
                            }
                        }
                    };
                }
            }
        } else {
            if (!gr.animMap._footballRotation.isPlaying()) { gr.animMap._footballRotation.play(); }
            gr.lib["_footballLevel_0" + (soccerCounterWhilePlaying - 2)].show(true);
            gr.animMap["_footballLevelAdd_0" + (soccerCounterWhilePlaying - 2)].play();
            gr.animMap["_footballLevelAdd_0" + (soccerCounterWhilePlaying - 2)]._onComplete = function() {
                gr.lib["_footballLevel_0" + (soccerCounterWhilePlaying - 1)].show(true);
                gr.animMap["_footballLevelAdd_0" + (soccerCounterWhilePlaying - 1)].play();
                this._onComplete = null;
            };
            if (soccerCounterWhilePlaying === 2) {
                audio.play("Match2", 2);
                footballProgressKey.stopSign = FIRE_SIGN * 2 + 5;
                gr.lib._footballPlayer.gotoAndPlay("run", 1 / 3, false);
                gr.lib._footballPlayer.pixiContainer.$sprite.onFrameChange = function() {
                    if (this.currentFrame >= 35) {
                        gr.lib._footballPlayer.pixiContainer.$sprite.onFrameChange = null;
                        if (footballPlayerFlashArray.length >= 1) {
                            footballPlayerFlash(footballPlayerFlashArray[0].bonusNum);
                            footballPlayerFlashArray.shift();
                        } else {
                            gr.lib._footballPlayer.stopPlay();
                        }
                    }
                };
            } else {
                audio.play("Match3", 3);
                footballProgressKey.stopSign = FIRE_SIGN * 3;
                gr.lib._footballPlayer.gotoAndPlay("run", 1 / 3, false, 22);
                gr.lib._footballPlayer.onComplete = function() {
                    gr.lib._footballPlayer.onComplete = null;
                    gr.animMap._footballBGLineAnim._onComplete = function() {
                        this.play();
                    };
                    gr.animMap._footballBGLineAnim.play();
                    normalCameraPlay = false;
                    addAndPlayCameraLight();
                    gr.getTimer().setTimeout(ribbonsFlash, 200);
                };
            }
        }
    }

    function baseGameLogic(index, bonusNum) {
        var symbolRevealCount = 0;
        var rowNumber = Math.floor(index / 3);
        var rowIndex = index % 3;
        var winAward = false;
        symbolMatrix[rowNumber][rowIndex] = baseGameResultData[index];
        for (var i = 0; i < 3; i++) {
            if (symbolMatrix[rowNumber][i] !== undefined) {
                symbolRevealCount++;
            }
        }
        if (symbolRevealCount > 2) {
            gr.lib["_gameSymbolLevel_0" + rowNumber].stopPlay();
            gr.lib["_gameSymbolLevel_0" + rowNumber].setImage("arrow_0000");
            var flag = symbolMatrix[rowNumber][0].substr(0, 1);
            winAward = symbolMatrix[rowNumber].every(function(item) {
                return item.substr(0, 1) === flag;
            });
            if (winAward) {
                for (i = 0; i < resultData.prizeTable.length; i++) {
                    if (resultData.prizeTable[i].description === flag) {
                        winMap[rowNumber] = resultData.prizeTable[i].prize;
                        break;
                    }
                }
                updateWinValue();
                winLineFlash(rowNumber);
                audio.play("Win", 6);
            } else {
                noWinDimShow(rowNumber);
            }
        }
        if (bonusNum > 0) {
            index = addZero(index);
            var indicateFlag = gr.lib._footballPlayer.pixiContainer.$sprite.playing;
            footballScaleFlash(index, bonusNum);
            if (indicateFlag) {
                var suspendedObj = {};
                suspendedObj.bonusNum = bonusNum;
                footballPlayerFlashArray.push(suspendedObj);
            } else {
                footballPlayerFlash(bonusNum);
            }
        }
        symbolRevealNum--;
        if (bonusNum > 0 && soccerWinTotalCounter === 3) {
            return;
        }
        checkAllRevealed();
    }

    function footballScaleFlash(index, bonusNum) {
        gr.lib["_footballReveal_" + index + "_00"].show(true);
        gr.lib["_footballReveal_" + index + "_00"].gotoAndPlay("threeLittleFootballs", 0.3, false);
        gr.lib["_footballReveal_" + index + "_00"].onComplete = function() {
            gr.animMap["_footballRevealAnim_" + index + "_00"].play();
            gr.animMap["_footballRevealAnim_" + index + "_00"]._onComplete = function() {
                this.play();
            };
        };
        if (Number(bonusNum) === 2) {
            gr.lib["_footballReveal_" + index + "_01"].show(true);
            gr.lib["_footballReveal_" + index + "_01"].gotoAndPlay("threeLittleFootballs", 0.3, false);
            gr.lib["_footballReveal_" + index + "_01"].onComplete = function() {
                gr.animMap["_footballRevealAnim_" + index + "_01"].play();
                gr.animMap["_footballRevealAnim_" + index + "_01"]._onComplete = function() {
                    this.play();
                };
            };
        }
    }

    function ribbonsFlash() {
        gr.lib._celebratePieces.show(true);
        if (SKBeInstant.getGameOrientation() === "landscape") {
            gr.lib._celebratePieces.gotoAndPlay("horizontalRibbons", 0.15, false);
        } else {
            gr.lib._celebratePieces.gotoAndPlay("verticalRibbon", 0.15, false);
        }
        gr.lib._celebratePieces.onComplete = function() {
            updateScene(SCREEN_STATE.BONUS_GAME_STATE);
        };
    }

    function updateScene(stage) {
        currentState = stage;
        if (stage === 0) {
            normalCameraPlay = true;
            gr.lib._bonusWinShow.show(true);
            gr.lib._bonusWinShow.setText(SKBeInstant.formatCurrency(winMap.bonusLevel).formattedAmount);
            gr.lib._buttonInfo.show(false);


            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "howToPlay", "event": "enable", "params": [0] }
            });
            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "paytable", "event": "enable", "params": [0] }
            });


            gr.lib._baseGame.show(true);
            gr.lib._bonusGame.show(false);
            gr.animMap._baseGameTransitionIn.play();
            gr.animMap._bonusGameTransitionIn.play();
            gr.animMap._bonusGameTransitionIn._onComplete = function() {
                gr.lib._bonusGame.show(false);
            };
            gr.animMap._bonusGameTransitionIn._onComplete = function() {
                if (symbolRevealNum !== 0) {
                    if (enableAutoplay) {
                        gr.lib._buttonAutoPlay.show(true);
                    }
                    if (!autoPlaying) {
                        gr.lib._buttonInfo.show(true);
                        msgBus.publish('toPlatform', {
                            channel: "Game",
                            topic: "Game.Control",
                            data: { "name": "howToPlay", "event": "enable", "params": [1] }
                        });
                        msgBus.publish('toPlatform', {
                            channel: "Game",
                            topic: "Game.Control",
                            data: { "name": "paytable", "event": "enable", "params": [1] }
                        });
                    }



                } else {
                    if (gr.lib._buttonInfo.pixiContainer.visible) {
                        gr.lib._buttonInfo.show(false);
                        msgBus.publish('toPlatform', {
                            channel: "Game",
                            topic: "Game.Control",
                            data: { "name": "howToPlay", "event": "enable", "params": [0] }
                        });
                        msgBus.publish('toPlatform', {
                            channel: "Game",
                            topic: "Game.Control",
                            data: { "name": "paytable", "event": "enable", "params": [0] }
                        });

                    }
                }
                addAndPlayCameraLight();
                flashingLight();
                if (gr.lib._buttonAutoPlay.pixiContainer.visible) {
                    gr.lib._buttonAutoPlay.setImage("buttonCommon");
                    gr.lib._buttonAutoPlay.pixiContainer.interactive = true;
                    gr.lib._buttonAutoPlay.pixiContainer.$sprite.cursor = "pointer";
                }
                gr.lib._buttonInfo.setImage("buttonInfo");
                gr.lib._buttonInfo.pixiContainer.interactive = true;
                gr.lib._buttonInfo.pixiContainer.$sprite.cursor = "pointer";

                msgBus.publish('toPlatform', {
                    channel: "Game",
                    topic: "Game.Control",
                    data: { "name": "howToPlay", "event": "enable", "params": [1] }
                });
                msgBus.publish('toPlatform', {
                    channel: "Game",
                    topic: "Game.Control",
                    data: { "name": "paytable", "event": "enable", "params": [1] }
                });


                if (symbolRevealNum === 0) {
                    checkAllRevealed();
                } else {
                    if (autoPlaying) {
                        msgBus.publish("revealAll");
                    } else {
                        banOrOpenInteractive(allNeedToReveal, "_coverBG_", true);
                        if (gr.lib._buttonInfo.pixiContainer.visible) {
                            gr.lib._buttonInfo.setImage("buttonInfo");
                            gr.lib._buttonInfo.pixiContainer.interactive = true;
                            gr.lib._buttonInfo.pixiContainer.$sprite.cursor = "pointer";
                            msgBus.publish('toPlatform', {
                                channel: "Game",
                                topic: "Game.Control",
                                data: { "name": "howToPlay", "event": "enable", "params": [1] }
                            });
                            msgBus.publish('toPlatform', {
                                channel: "Game",
                                topic: "Game.Control",
                                data: { "name": "paytable", "event": "enable", "params": [1] }
                            });
                        }
                    }
                }
            };
        } else {
            initBonusScene();
            gr.lib._buttonAutoPlay.show(false);
            gr.lib._bonusGame.show(true);
            gr.animMap._baseGameTransition._onComplete = function() {
                gr.lib._baseGame.show(false);
            };
            gr.animMap._baseGameTransition.play();
            gr.animMap._bonusGameTransition.play();
            gr.animMap._bonusGameTransition._onComplete = function() {
                gr.lib._buttonInfo.setImage("buttonInfo");
                gr.lib._buttonInfo.pixiContainer.interactive = true;
                gr.lib._buttonInfo.pixiContainer.$sprite.cursor = "pointer";
                gr.lib._buttonInfo.show(true);
                msgBus.publish('toPlatform', {
                    channel: "Game",
                    topic: "Game.Control",
                    data: { "name": "howToPlay", "event": "enable", "params": [1] }
                });
                msgBus.publish('toPlatform', {
                    channel: "Game",
                    topic: "Game.Control",
                    data: { "name": "paytable", "event": "enable", "params": [1] }
                });
                initBonusAction();
                countDownTime(totalCountDownTime);
            };
        }
        if (stage === 0) {
            audio.fadeOut(0, 500, {
                completeCallback: function() {
                    audio.playAndFadeIn(0, "BaseMusicLoop", true);
                }
            });
        } else {
            audio.fadeOut(0, 500, {
                completeCallback: function() {
                    audio.playAndFadeIn(0, "CrowdLoop", true);
                }
            });
        }
    }

    function onStartUserInteraction(data) {


        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "howToPlay", "event": "enable", "params": [1] }
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "paytable", "event": "enable", "params": [1] }
        });

        if (!data.scenario) {
            return;
        } else {
            resultData = data;
            baseGameResultData = data.scenario.substr(0, data.scenario.indexOf("|")).match(/(\w{1}\d{1})/g);
            prizeValue = data.prizeValue;
            currentState = SCREEN_STATE.BASE_GAME_STATE;
            if (!stepCount) {
                stepCount = (function(totalTime, timeslot, width) {
                    return width * timeslot / totalTime;
                })(footballProgressKey.totalTime, 16.66, FIRE_SIGN);
            }
            baseGameResultDataHandler(baseGameResultData);
            flashingLight();
            gameLogoFlash();
            baseGameBorderFlash();
            baseGameLevelNumberFlash();
            addAndPlayCameraLight();
            revealAction(SYMBOL_NUM.BASE, "_coverBG_");



        }
    }

    function baseGameResultDataHandler(baseGameResultData) {
        baseGameResultData.forEach(function(item, index) {
            scenarioDataMatrix[Math.floor(index / 3)].push(item);
        });
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        resetAll();
    }

    function onEnterResultScreenState() {
        clearTimeout(flashTimeInterval);
    }

    function onReset() {
        resetAll();
    }

    function onPlayerWantsPlayAgain() {
        resetAll();
    }

    msgBus.subscribe('gameAutoPlaying', function(autoPlay) { autoPlaying = autoPlay; });
    msgBus.subscribe("deletedRevealSymbol", function(symbolIndex) { allNeedToReveal[symbolIndex] = null; });
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe('resetAll', resetAll);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);

    return {
        banOrOpenInteractive: banOrOpenInteractive
    };
});