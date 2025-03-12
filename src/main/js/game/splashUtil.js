define(['com/pixijs/pixi'], 
function(PIXI){
    var pixiRenderer;
    var splashPixiContainer;
    var gameSize = {width:0, height:0};
    var viewSize = {width:0, height:0};
    var lastSize = {w:-1, h:-1};
    var ticker;
    function searchSplashSpriteSheetAnimationFromTextureCache(){
		var animMap = {};
		for(var k in PIXI.utils.TextureCache){
			var sm = k.match(/^(\w+)_\d+$/);
			if(sm){
				var name = sm[1];
				if(!animMap[name]){
					animMap[name] = [];
				}
				animMap[name].push(k);
			}
		}
		for(var j in animMap){
			animMap[j].sort(function(a, b){
				return parseInt(a.match(/\d+$/)[0])-parseInt(b.match(/\d+$/)[0]);
			});
		}
		return animMap;
	}
    function setSize(width, height){
		if (width !== gameSize.width || height !== gameSize.height) {
			gameSize.width = width;
			gameSize.height = height;
			pixiRenderer.resize(gameSize.width, gameSize.height);
			fitSize(viewSize.width, viewSize.height);
		}
	}
    function fitSize(w, h){
        if(!pixiRenderer){
            return;
        }
		var gw = Number(pixiRenderer.view.width);
		var gh = Number(pixiRenderer.view.height);
		viewSize.width = w;
		viewSize.height = h;
		fit(w,h, gw, gh, pixiRenderer.view);        
	}
    
    function approximatelyEquals(num1, num2){
		var dn = num1-num2;
		dn = dn>0?dn:-dn;
		return dn<=1;
	}
    
        /**
         * @function fit
         * @description scale game to fit the specified size. Please note that it will not change the game aspect ratio.
         * @instance
         * @param w {number} - target width
         * @param h {number} - target height
         * @param gw {number} - game width
         * @param gh {number} - game height
         * @param gameCanvas {number} - game canvas
         */
        function fit(w, h, gw, gh, gameCanvas) {
            if (gw === 0 || gh === 0 || w === 0 || h === 0) {
                return;
            }
            //avoid resize when size not changed.
            if (approximatelyEquals(w, lastSize.w) && approximatelyEquals(h, lastSize.h)) {
                return;
            }
            lastSize.w = w;
            lastSize.h = h;

            var gp = gh / gw;
            var rw, rh;
            if (h / w > gp) {
                rw = Math.round(w);
                rh = Math.round(w * gp);
                gameCanvas.style.transform = 'translate(0px,' + (h - rh) / 2 + 'px)';
            } else {
                rh = Math.round(h);
                rw = Math.round(h / gp);
                gameCanvas.style.transform = 'translate(' + (w - rw) / 2 + 'px,0px)';
            }
            gameCanvas.style.width = rw + 'px';
            gameCanvas.style.height = rh + 'px';
        }
    
    function addCanvas(width, height, container){
        if(!container){
            container = document.getElementById('loadDiv');
        }
        pixiRenderer = new PIXI.CanvasRenderer(width, height, {transparent:true, resolution:1, antialias:true});
        pixiRenderer.view.id = 'loadingEle';
        pixiRenderer.view.style.position = 'absolute';
        pixiRenderer.view.style.top = '0px';
        pixiRenderer.view.style.left = '0px';
        
        container.appendChild(pixiRenderer.view);
        viewSize.width = width;
		viewSize.height = height;
        setSize(width, height);
        splashPixiContainer = new PIXI.Container();  
        
        ticker =  new PIXI.ticker.Ticker();
		ticker.add(function(){
			pixiRenderer.render(splashPixiContainer);
		});
    }
    
    function getSplashRender(){
        return pixiRenderer;
    }
    function getSplashPixiContainer(){
        return splashPixiContainer;
    }
    
    function getTicker(){
        return ticker;
    }
    
    function applyStyle(elem, styleData){
		for(var s in styleData){
            if(typeof styleData[s] === 'object' && !Array.isArray(styleData[s])){
                applyStyle(elem[s], styleData[s]);
            } else {
                elem[s] = styleData[s];
            }
		}
	}
    function applyDomStyle(elem, styleData){
		for(var s in styleData){
			if(typeof styleData[s] === 'number'){
				elem.style[s] = styleData[s]+'px';
			}else{
				elem.style[s] = styleData[s];
			}
		}
	}
    
    
    return{
        searchSplashSpriteSheetAnimationFromTextureCache: searchSplashSpriteSheetAnimationFromTextureCache,
        addCanvas:addCanvas,
        getSplashRender: getSplashRender,
        getSplashPixiContainer:getSplashPixiContainer,
        getTicker: getTicker,
        fitSize:fitSize,
        applyStyle:applyStyle,
        applyDomStyle:applyDomStyle
    };
});

