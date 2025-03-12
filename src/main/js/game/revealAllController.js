/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/playAnimationController'
], function(msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, playAnimationController) {

    var BASE_SYMBOL_LENGTH = 12;
    var allNeedToReveal = [];
    var playButton;
    var symbolRevealDelay;
    var symbolWhileReveal = false;
    var clearTimeoutArray = [];
    var revealFlag = false;
    var stopWhileBonusWin = false;
    var autoPlayText;

    function setAutoPlayTest() {
        if (SKBeInstant.isWLA()) {
            autoPlayText = loader.i18n.MenuCommand.WLA.button_autoPlay;
        } else {
            autoPlayText = loader.i18n.MenuCommand.Commercial.button_autoPlay;
        }
        gr.lib._autoPlayText.setText(autoPlayText);
    }

    function onGameParametersUpdated() {
        var scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
        if (SKBeInstant.config.customBehavior) {
            symbolRevealDelay = SKBeInstant.config.customBehavior.symbolInterval || 500;
        } else {
            symbolRevealDelay = 500;
        }
        gr.lib._autoPlayText.autoFontFitText = true;
        setAutoPlayTest();
        playButton = new gladButton(gr.lib._buttonAutoPlay, "buttonCommon", scaleType);
        gameUtils.setTextStyle(gr.lib._autoPlayText, { padding: 2, dropShadow: true, dropShadowDistance: 2.5 });
        playButton.show(false);
        for (var i = 0; i < BASE_SYMBOL_LENGTH; i++) {
            i = i < 10 ? "0" + i : i;
            allNeedToReveal.push(i);
        }
    }


    function resetAll() {
        revealFlag = false;
        setAutoPlayTest();
        if (!gr.lib._buttonAutoPlay.pixiContainer.interactive) {
            gr.lib._buttonAutoPlay.setImage("buttonCommon");
            gr.lib._buttonAutoPlay.pixiContainer.interactive = true;
        }
        for (var i = 0; i < allNeedToReveal.length; i++) {
            if (allNeedToReveal[i] !== null) {
                gr.lib["_coverBG_" + allNeedToReveal[i]].off("click", this.clickListner);
            }
            var j = i < 10 ? "0" + i : i;
            allNeedToReveal[i] = j;
        }
        playButton.click(null);
    }

    function autoPlayFunc() {
        autoPlay();
        audio.play('ButtonGeneric', 5);
    }

    function revealAll() {

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

        var symbolRevealInterval = 0;
        for (var i = 0; i < allNeedToReveal.length; i++) {
            if (allNeedToReveal[i] === null) { continue; }
            var _THIS = gr.lib["_coverBG_" + allNeedToReveal[i]];
            if (!_THIS.revealFlag) {
                var currentTimer = gr.getTimer().setTimeout(_THIS.reveal, symbolRevealInterval);
                clearTimeoutArray.push(currentTimer);
                symbolRevealInterval += symbolRevealDelay;
            }
        }
    }

    function autoPlay() {
        if (!revealFlag) {
            revealFlag = true;
            msgBus.publish("gameAutoPlaying", true);
            if (gr.lib._buttonInfo.pixiContainer.visible) { gr.lib._buttonInfo.show(false); }
            if (gr.lib._buttonMTM.pixiContainer.visible) { gr.lib._buttonMTM.show(false); }
            playAnimationController.banOrOpenInteractive(allNeedToReveal, "_coverBG_", false);
            revealAll();
        } else {
            revealFlag = false;
            msgBus.publish("gameAutoPlaying", false);
            clearAutoPlay();
            playAnimationController.banOrOpenInteractive(allNeedToReveal, "_coverBG_", true);
        }
        var currentText = revealFlag ? loader.i18n.Game.button_stop : autoPlayText;
        gr.lib._autoPlayText.setText(currentText);
    }

    function clearAutoPlay() {
        clearTimeoutArray.forEach(function(item) {
            gr.getTimer().clearTimeout(item);
            item = null;
        });
    }

    function onStartUserInteraction(data) {
        var enable = SKBeInstant.config.autoRevealEnabled === false ? false : true;
        if (enable) {
            if (data.scenario) {
                gr.lib._buttonAutoPlay.show(true);
            }
        } else {
            gr.lib._buttonAutoPlay.show(false);
        }
        playButton.click(autoPlayFunc);
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        resetAll();
        onDisableUI();
    }

    function onReset() {
        onReInitialize();
    }

    function onDisableUI() {
        playButton.show(false);
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

    function onEnableUI() {
        playButton.show(true);
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

    function onPlayerWantsPlayAgain() {
        resetAll();
    }
    msgBus.subscribe('reset', onReset);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('revealAll', revealAll);
    msgBus.subscribe("deletedRevealSymbol", function(symbolIndex) { allNeedToReveal[symbolIndex] = null; });
    msgBus.subscribe("symbolIsReveal", function(revealFlag) { symbolWhileReveal = revealFlag; });
    msgBus.subscribe('clearAutoPlay', function() {
        stopWhileBonusWin = true;
        clearAutoPlay();
    });
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('allRevealed', onDisableUI);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {};
});