/**
 * @module game/tutorialController
 * @description result dialog control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController',
    'game/TextMatchToImage'
], function(msgBus, audio, gr, loader, gladButton, SKBeInstant, gameUtils, config, TextMatchToImage) {
    var buttonInfo, buttonClose;
    var left, right;
    var index = 0,
        minIndex = 0,
        maxIndex;
    var shouldShowTutorialWhenReinitial = false;
    var iconOnImage, iconOffImage, buttonCloseImage;
    var showTutorialAtBeginning = true;
    var resultIsShown = false;
    var textStyle = ({ fontFamily: 'Oswald,arial,helvetica,sans-serif', fontWeight: "600", fill: "#ffffff", padding: 2, dropShadow: true, dropShadowDistance: 2.5, fontSize: 20 });
    var showButtonInfoTimer = null;

    function showTutorial() {
        gr.lib._BG_dim.off('click');
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        if (gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible) {
            resultIsShown = true;
        }
        gr.animMap._tutorialAnim.play();
        msgBus.publish('tutorialIsShown');
        if (config.audio.HelpPageOpen) {
            audio.play(config.audio.HelpPageOpen.name, config.audio.HelpPageOpen.channel);
        }
    }

    function initTutorial() {
        // for page2
        for (var i = 0; i < 3; i++) {
            gr.lib["tutorialBasket_text_0" + i].autoFontFitText = true;
            gr.lib["tutorialBasket_text_0" + i].setText(SKBeInstant.formatCurrency(1000 * (i + 1)).formattedAmount);
        }
        var textMatchToImage = new TextMatchToImage(gr.lib._tutorialPage_02_Text_00, loader.i18n.Game.tutorial_02, textStyle);
        textMatchToImage.updateStyle();
    }

    function onTicketCostChanged(prizePoint) {
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        for (var i = 0; i < rc.length; i++) {
            if (Number(prizePoint) === Number(rc[i].price)) {
                var ps = rc[i].prizeStructure;
                var pt = rc[i].prizeTable;
                var maxPrize = 0;
                for (var j = 0; j < ps.length; j++) {
                    var prize = Number(ps[j].prize);
                    if (maxPrize < prize) {
                        maxPrize = prize;
                    }
                }
                for (i = 1; i < 5; i++) {
                    gr.lib["_baseGameSymbolBG_text_0" + i].autoFontFitText = true;
                    gr.lib["_baseGameSymbolBG_text_0" + i].setText(SKBeInstant.formatCurrency(maxPrize).formattedAmount);
                }
                for (var k = 14, m = 0; m < 5; m++, k--) {
                    gr.lib["_tutorialTrophy_text_0" + m].autoFontFitText = true;
                    gr.lib["_tutorialTrophy_text_0" + m].setText(SKBeInstant.formatCurrency(pt[k].prize).formattedAmount);
                }
                break;
            }
        }
    }

    function hideTutorial() {
        index = minIndex;
        gr.animMap._tutorialUP._onComplete = function() {
            gr.lib._tutorial.show(false);
            for (var i = minIndex; i <= maxIndex; i++) {
                if (i === minIndex) {
                    gr.lib['_tutorialPage_0' + i].show(true);
                    gr.lib['_tutorialPage_0' + i + '_Text_00'].show(true);
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                } else {
                    gr.lib['_tutorialPage_0' + i].show(false);
                    gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
                }
            }
            buttonInfo.show(true);

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

            if (!resultIsShown) {
                gr.lib._BG_dim.show(false);
            } else {
                resultIsShown = false;
            }
            msgBus.publish('tutorialIsHide');
        };
        gr.animMap._tutorialUP.play();
        if (config.audio.HelpPageClose) {
            audio.play(config.audio.HelpPageClose.name, config.audio.HelpPageClose.channel);
        }
    }

    function onGameParametersUpdated() {
        if (config.textAutoFit.versionText) {
            gr.lib._versionText.autoFontFitText = config.textAutoFit.versionText.isAutoFit;
        }
        gr.lib._versionText.setText(window._cacheFlag.gameVersion);

        // Prevent click the symbols when tutorial is shown
        gr.lib._BG_dim.on('click', function(event) {
            event.stopPropagation();
        });

        iconOnImage = config.gladButtonImgName.iconOn;
        iconOffImage = config.gladButtonImgName.iconOff;
        buttonCloseImage = config.gladButtonImgName.tutorialButtonClose || "buttonClose";
        maxIndex = Number(config.gameParam.pageNum) - 1;

        var scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
        buttonInfo = new gladButton(gr.lib._buttonInfo, "buttonInfo", scaleType);
        buttonClose = new gladButton(gr.lib._buttonCloseTutorial, buttonCloseImage, scaleType);
        left = new gladButton(gr.lib._buttonTutorialArrowLeft, "buttonTutorialArrow", scaleType);
        right = new gladButton(gr.lib._buttonTutorialArrowRight, "buttonTutorialArrow", { 'scaleXWhenClick': -0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        initTutorial();
        buttonInfo.show(false);
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.showTutorialAtBeginning === false) {
                showTutorialAtBeginning = false;
                buttonInfo.show(true);
                gr.lib._BG_dim.show(false);
                gr.lib._tutorial.show(false);

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

        buttonInfo.click(function() {
            showTutorial();
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        });

        buttonClose.click(function() {
            hideTutorial();
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        });

        left.click(function() {
            index--;
            if (index < minIndex) {
                index = maxIndex;
            }
            showTutorialPageByIndex(index);
            audio.play(config.audio.ButtonBetDown.name, config.audio.ButtonBetDown.channel);
        });
        right.click(function() {
            index++;
            if (index > maxIndex) {
                index = minIndex;
            }

            showTutorialPageByIndex(index);
            audio.play(config.audio.ButtonBetUp.name, config.audio.ButtonBetUp.channel);
        });

        for (var i = minIndex; i <= maxIndex; i++) {
            if (i !== 0) {
                gr.lib['_tutorialPage_0' + i].show(false);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
            } else {
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
            }
            var obj = gr.lib['_tutorialPage_0' + i + '_Text_00'];
            if (config.dropShadow) {
                gameUtils.setTextStyle(obj, {
                    padding: config.dropShadow.padding,
                    dropShadow: config.dropShadow.dropShadow,
                    dropShadowDistance: config.dropShadow.dropShadowDistance
                });
            }
            gameUtils.setTextStyle(obj, config.style.textStyle);
            if (loader.i18n.Game['tutorial_0' + i + '_landscape'] || loader.i18n.Game['tutorial_0' + i + '_portrait']) {
                if (SKBeInstant.getGameOrientation() === "landscape") {
                    obj.setText(loader.i18n.Game['tutorial_0' + i + '_landscape']);
                } else {
                    obj.setText(loader.i18n.Game['tutorial_0' + i + '_portrait']);
                }
            } else {
                if (i !== maxIndex) {
                    obj.setText(loader.i18n.Game['tutorial_0' + i]);
                }
            }
        }

        gameUtils.setTextStyle(gr.lib._tutorialTitleText, config.style.tutorialTitleText);
        if (config.textAutoFit.tutorialTitleText) {
            gr.lib._tutorialTitleText.autoFontFitText = config.textAutoFit.tutorialTitleText.isAutoFit;
        }
        gr.lib._tutorialTitleText.setText(loader.i18n.Game.tutorial_title);
        gameUtils.setTextStyle(gr.lib._closeTutorialText, config.style.closeTutorialText);
        if (config.textAutoFit.closeTutorialText) {
            gr.lib._closeTutorialText.autoFontFitText = config.textAutoFit.closeTutorialText.isAutoFit;
        }
        gr.lib._closeTutorialText.setText(loader.i18n.Game.message_close);
        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._closeTutorialText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
            gameUtils.setTextStyle(gr.lib._tutorialTitleText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }
    }

    function showTutorialPageByIndex(index) {
        hideAllTutorialPages();
        gr.lib['_tutorialPage_0' + index].show(true);
        gr.lib['_tutorialPage_0' + index + '_Text_00'].show(true);
        gr.lib['_tutorialPageIcon_0' + index].setImage(iconOnImage);
    }

    function hideAllTutorialPages() {
        for (var i = 0; i <= maxIndex; i++) {
            gr.lib['_tutorialPage_0' + i].show(false);
            gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
            gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
        }
    }

    function onReInitialize() {
        if (shouldShowTutorialWhenReinitial) {
            shouldShowTutorialWhenReinitial = false;
            if (showTutorialAtBeginning) {
                showTutorial();
            } else {
                msgBus.publish('tutorialIsHide');
            }
        } else {
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);

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

    function onDisableUI() {
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

    function onEnableUI() {
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

    function showTutorialOnInitial() {
        for (var i = minIndex; i <= maxIndex; i++) {
            if (i === minIndex) {
                gr.lib['_tutorialPage_0' + i].show(true);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(true);
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
            } else {
                gr.lib['_tutorialPage_0' + i].show(false);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
            }
        }
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        msgBus.publish('tutorialIsShown');
    }

    function onInitialize() {
        if (showTutorialAtBeginning) {
            showTutorialOnInitial();
        } else {
            msgBus.publish('tutorialIsHide');
        }
    }

    function onReStartUserInteraction() {
        if (showButtonInfoTimer) {
            gr.getTimer().clearTimeout(showButtonInfoTimer);
            showButtonInfoTimer = null;
        }
        buttonInfo.show(true);

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

    function onStartUserInteraction() {
        if (SKBeInstant.config.gameType === 'ticketReady') {
            if (showTutorialAtBeginning) {
                showTutorialOnInitial();
            } else {
                msgBus.publish('tutorialIsHide');
            }
        } else {
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);


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

    function onEnterResultScreenState() {
        showButtonInfoTimer = gr.getTimer().setTimeout(function() {
            gr.getTimer().clearTimeout(showButtonInfoTimer);
            showButtonInfoTimer = null;
            if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
                buttonInfo.show(true);

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
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
    }

    function onPlayerWantsToMoveToMoneyGame() {
        if (showButtonInfoTimer) {
            gr.getTimer().clearTimeout(showButtonInfoTimer);
            showButtonInfoTimer = null;
        }
        shouldShowTutorialWhenReinitial = true;

        onDisableUI();



    }


    function onTutorialIsHide() {
        if (!showButtonInfoTimer) {
            buttonInfo.show(true);
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

    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('jLotterySKB.reset', function() { onEnableUI(); });
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    return {};
});