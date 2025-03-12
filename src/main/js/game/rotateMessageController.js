define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/rotateReminder/rotateReminder'
], function(msgBus, SKBeInstant, rotateReminder) {
    'use strict';

    function onAssetsLoadedAndGameReady() {
        var orientation = SKBeInstant.getGameOrientation();
        if(SKBeInstant.config.assetPack !== 'desktop' && SKBeInstant.config.assetPack !== 'desktopmini') {
			if (orientation === "landscape") {
				rotateReminder.setLandscapeOnly();
			} else {
				rotateReminder.setPortraitOnly();
			}
			rotateReminder.init('', function(rotateMsgShowFlag) {
				if (rotateMsgShowFlag) {
					document.getElementById('game').style.visibility = 'hidden';
					document.body.style.backgroundColor = '#000000';
				} else {
					document.getElementById('game').style.visibility = 'visible';
					document.body.style.backgroundColor = '';
				}
			});
		}
    }
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);

});