define(function (require) {
    var PIXI = require('com/pixijs/pixi');
    var currentTextStyle = ({
        fontFamily: 'Oswald,arial,helvetica,sans-serif',
        fontWeight: "600",
        fill: "#ffffff",
        padding: 2,
        dropShadow: true,
        dropShadowDistance: 2.5,
        fontSize: 20
    });
    var count = 0;
    var textHeight=0;

    function TextMatchToImage(textContainer, textValue, textStyle) {
        this.textContainer = textContainer;
        this.textValue = textValue;
        if (textStyle) {
            currentTextStyle = textStyle;
        }
    }

    function setVerticalCenterTxt(textContainer, textValue) {
        textContainer.setText(textValue);
        var fontSize = parseInt(textContainer._currentStyle._font._size);
        var txtWidth = Number(textContainer.pixiContainer.$text.width);
        var boxWidth = Number(textContainer._currentStyle._width);
        while (txtWidth > boxWidth) {
            fontSize--;
            if (fontSize < 10) {
                break;
            }
            textContainer.updateCurrentStyle({
                '_font': {
                    '_size': fontSize
                }
            });
            txtWidth = Number(textContainer.pixiContainer.$text.width);
        }
        var txtHeight = Number(textContainer.pixiContainer.$text.height);
        var boxHeight = Number(textContainer._currentStyle._height);
        while (txtHeight > boxHeight) {
            fontSize--;
            if (fontSize < 10) {
                break;
            }
            textContainer.updateCurrentStyle({
                '_font': {
                    '_size': fontSize
                }
            });
            txtHeight = Number(textContainer.pixiContainer.$text.height);
        }
    }

    function cutOriginTxt2Array(marketingMsgData) {
        var arr = [ /*{"text":"word"},{"image":"b01"}*/ ];
        var tmpArr = marketingMsgData.split(" "); //the image name must have no space inside, ie "bonusB01", other that "bonus b01"
        var currentMatch = null;
        for (var i = 0; i < tmpArr.length; i++) {
            currentMatch = tmpArr[i].match(/\{\w+\d+\}/);
            if (currentMatch) {
                arr.push({
                    type: 'image',
                    value: currentMatch[0]
                });
            } else {
                arr.push({
                    type: 'text',
                    value: tmpArr[i]
                });
            }
        }
        return arr;
    }

    function groupSprites(msgArray, textContainer) {
        var multiLineArray = [ /*[textSprite,imageSprite],[],[]*/ ];
        var tmpX = 0,
            tmpY = 0,
            curLine = [],
            margin = 5;
        for (var i = 0; i < msgArray.length; i++) {
            var curSprite = initialToSprite(msgArray[i], tmpX, tmpY);
            curLine.push(msgArray[i]);
            if (i < msgArray.length - 1) {
                tmpX += curSprite.width + margin;
                var nextSpriteWidth = getSpriteWidth(msgArray[i + 1]);
                if (msgArray[i].value === "{n}" || textContainer._currentStyle._width - tmpX < nextSpriteWidth) {
                    if (msgArray[i].value === "{n}") {
                        msgArray[i].value = "";
                    }
                    if(curLine[0].value!==""){
                        multiLineArray.push(curLine);
                    }
                    curLine = [];
                    tmpX = 0;
                }
            } else {
                multiLineArray.push(curLine);
            }
        }
        return multiLineArray;
    }

    function initialToSprite(item, tmpX, tmpY) {
        var curSprite = null;
        if (item.type === "image") {
            var imgName = "";
            if(item.value === "{S01}"){ imgName = "basketBox";}
            if(item.value === "{B01}"){ imgName = "yellowBox"; }
            if(item.value === "{X01}"){ imgName = "redForkedBox"; }
            if(count === 3 ){ count = 0; }
            var tmpTexture = PIXI.utils.TextureCache[imgName];
            curSprite = new PIXI.Sprite(tmpTexture);
            var orignRatio = Number(tmpTexture.orig.width) / Number(tmpTexture.orig.height);
            curSprite.height = 50;
            curSprite.width = Math.ceil(curSprite.height * orignRatio);
			curSprite.y = tmpY - (50-textHeight)/2;
        } else {
            curSprite = new PIXI.Text();
            curSprite.text = item.value;
            curSprite.style = currentTextStyle;
            curSprite.y = tmpY;
        }
        curSprite.x = tmpX;
        return curSprite;
    }

    function getVerticalSpacing(item){
        var verticalSpacing=0;
        var curSprite=null;
        var iamgeHeight=50;
        if(item.type!=='iamge'){
            curSprite = new PIXI.Text();
            curSprite.text = item.value;
            curSprite.style = currentTextStyle;
            verticalSpacing=(iamgeHeight-curSprite.height)/2+curSprite.height;
            textHeight=curSprite.height;
        }
        return verticalSpacing;
    }

    function getSpriteWidth(data) {
        var sprite = initialToSprite(data, 0, 0);
        return sprite.width;
    }

    function centeredPerLine(multiLineArray, textContainer) {
        var tmpX = 0,
            tmpY = 0,
            margin = 5,
            resultArray = [];
        var verticalSpacing=0;
        for (var i = 0; i < multiLineArray.length; i++) {
            var curLineArray = multiLineArray[i];
            var contentWidth = 0;
            for (var j = 0; j < curLineArray.length; j++) {
                contentWidth += getSpriteWidth(curLineArray[j]);
            }
            var totalWidth = contentWidth + margin * curLineArray.length;
            var curLineInitialX = (textContainer._currentStyle._width - totalWidth) / 2;
            tmpX = curLineInitialX;
            if(verticalSpacing===0){
                for(j = 0; j < curLineArray.length; j++){
                    verticalSpacing=getVerticalSpacing(curLineArray[j]);
                    if(verticalSpacing>0){
                        break;
                    }
                }
            }
            for (j = 0; j < curLineArray.length; j++) {
                var curSprite = initialToSprite(curLineArray[j], tmpX, tmpY, verticalSpacing);
                resultArray.push(curSprite);
                tmpX += curSprite.width + margin;
                if (j === curLineArray.length - 1) {
					tmpY += verticalSpacing;
                }
            }
        }
        return resultArray;
    }

    TextMatchToImage.prototype.updateStyle = function () {
        setVerticalCenterTxt(this.textContainer, this.textValue.replace(/\{\w+\d+\}/g, 'INSS'));
        var msgCutArray = cutOriginTxt2Array(this.textValue);
        var multiLineArray = groupSprites(msgCutArray, this.textContainer);
        var msgSpriteArray = centeredPerLine(multiLineArray, this.textContainer);
        var groupContainer = new PIXI.Container();
        groupContainer.width = this.textContainer._currentStyle._width;
        groupContainer.height = this.textContainer._currentStyle._height;
        for (var i = 0; i < msgSpriteArray.length; i++) {
            groupContainer.addChild(msgSpriteArray[i]);
        }
        this.textContainer.setText('');
        this.textContainer.pixiContainer.addChild(groupContainer);
        this.textContainer.show(true);

    };

    return TextMatchToImage;
});