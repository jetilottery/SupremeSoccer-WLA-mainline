/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
    style: {
        "ticketCostLevelIcon": {
            "_width": "22",
            "_height": "4",
            "_top": "82"
        }
    },
    textAutoFit: {
        "autoPlayText": {
            "isAutoFit": true
        },
        "autoPlayMTMText": {
            "isAutoFit": true
        },
        "buyText": {
            "isAutoFit": true
        },
        "tryText": {
            "isAutoFit": true
        },
        "warningExitText": {
            "isAutoFit": true
        },
        "warningContinueText": {
            "isAutoFit": true
        },
        "errorExitText": {
            "isAutoFit": true
        },
        "errorTitle": {
            "isAutoFit": true
        },
        "exitText": {
            "isAutoFit": true
        },
        "playAgainText": {
            "isAutoFit": true
        },
        "playAgainMTMText": {
            "isAutoFit": true
        },
        "MTMText": {
            "isAutoFit": true
        },
        "win_Text": {
            "isAutoFit": true
        },
        "win_Try_Text": {
            "isAutoFit": true
        },
        "win_Value": {
            "isAutoFit": true
        },
        "closeWinText": {
            "isAutoFit": true
        },
        "nonWin_Text": {
            "isAutoFit": true
        },
        "closeNonWinText": {
            "isAutoFit": true
        },
        "win_Value_color": {
            "isAutoFit": true
        },
        "ticketCostText": {
            "isAutoFit": true
        },
        "ticketCostValue": {
            "isAutoFit": true
        },
        "tutorialTitleText": {
            "isAutoFit": true
        },
        "closeTutorialText": {
            "isAutoFit": true
        },
        "winUpToText": {
            "isAutoFit": true
        },
        "winUpToValue": {
            "isAutoFit": true
        },
        "MTMText": {
            "isAutoFit": true
        }
    },
    audio: {
        "gameInit": {
            "name": "GameInit",
            "channel": "0"
        },
        "gameLoop": {
            "name": "BaseMusicLoop",
            "channel": "0"
        },
        "gameWin": {
            "name": "BaseMusicLoopTermWin",
            "channel": "0"
        },
        "gameNoWin": {
            "name": "BaseMusicLoopTermLose",
            "channel": "0"
        },
        "ButtonGeneric": {
            "name": "ButtonGeneric",
            "channel": "5"
        },
        "HelpPageOpen": {
            "name": "HelpPageOpen",
            "channel": "4"
        },
        "HelpPageClose": {
            "name": "HelpPageClose",
            "channel": "7"
        },
        "ButtonBetMax": {
            "name": "ButtonBetMax",
            "channel": "3"
        },
        "ButtonBetUp": {
            "name": "ButtonBetUp",
            "channel": "2"
        },
        "ButtonBetDown": {
            "name": "ButtonBetDown",
            "channel": "1"
        },
		"PaytableOpen": {
            "name": "ButtonGeneric",
            "channel": "5"
		},
		"PaytableClose": {
            "name": "ButtonGeneric",
            "channel": "5"
		}
    },
    gladButtonImgName: {
        //audioController
        "buttonAudioOn": "buttonAudioOn",
        "buttonAudioOff": "buttonAudioOff",
        //buyAndTryController
        "buttonTry": "buttonCommon",
        "buttonBuy": "buttonCommon",
        //errorWarningController
        "warningContinueButton": "messageButton",
        "warningExitButton": "messageButton",
        "errorExitButton": "messageButton",
        //exitAndHomeController
        "buttonExit": "buttonCommon",
        "buttonHome": "buttonHome",
        //playAgainController
        "buttonPlayAgain": "buttonCommon",
        "buttonPlayAgainMTM": "buttonCommon",
        //playWithMoneyController
        "buttonMTM": "buttonCommon",
        //resultController
        "buttonWinClose": "messageButton",
        "buttonNonWinClose": "messageButton",
        //ticketCostController
        "ticketCostPlus": "arrowPlus",
        "ticketCostMinus": "arrowMinus",
        //tutorialController
        "iconOff": "tutorialPageIconOff",
        "iconOn": "tutorialPageIconOn",
        "tutorialButtonClose": "messageButton",
        //revealAllController
        "buttonAutoPlay": "buttonCommon",
        "buttonAutoPlayMTM": "buttonCommon"
    },
    gameParam: {
        //tutorialController
        "pageNum": 3,
        //ticketCostController
        "arrowPlusSpecial": true 
    },
    dropShadow: {
        padding: 2,
        dropShadow: true,
        dropShadowDistance: 2.5
    },
	predefinedStyle: {
		landscape:{
			loadDiv:{
				width:960,
				height:600,
				position:'absolute',
				left: "50%",
				top: "50%"
			},
			gameLogoDiv:{
				width:414,
				height:256,
				top: 87,
				left: 273,
				position:'absolute'
			},
			progressBarDiv:{
				top: 480,
				left: 186,
				width:588,
				height:68,
				padding:0,
				position:'absolute'
			},
			progressDiv:{
				height:68,
				width:"0%",
				position:'absolute'
			},
			copyRightDiv:{
				width:'100%',
				textAlign : 'center',
				bottom:20,
				fontSize:20,
				fontFamily: '"Roboto Condenced"',
				position:'absolute'
			}
		},
		portrait:{
			loadDiv:{
				width:600,
				height:818,
				position:'absolute',
				left: "50%",
				top: "50%"
			},
			gameLogoDiv:{
				width:414,
				height:256,
				top: 160,
				left: 93,
				position:'absolute'
			},
			progressBarDiv:{
				top:680,
				left:6,
				width:588,
				height:68,
				padding:0,
				position:'absolute'
			},
			progressDiv:{
				height:68,
				width:"0%",
				position:'absolute'
			},
			copyRightDiv:{
				width:'100%',
				textAlign : 'center',
				bottom:20,
				fontSize:20,
				fontFamily: '"Roboto Condenced"',
				position:'absolute'
			}
		}
	}
});