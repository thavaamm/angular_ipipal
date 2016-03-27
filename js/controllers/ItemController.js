'use strict';

ipipalApp.controller('ItemController',
    function ItemController($scope, Items, $location) {


        var items = Items.get(showResult);

        // holds all our rectangles
        $scope.boxes = [];
        $scope.selectedIndex = 0;

        var canvas;
        var ctx;
        var WIDTH;
        var HEIGHT;
        var INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed
        var isDrag = false;
        var mx, my; // mouse coordinates
        var isResizeDrag = false;
        var expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.


        function showResult(){
          $scope.items = items.items;
          init();
         // $scope.bizzes = allBizzess.organizations;  //ajax request to fetch data into $scope.data
        }


	//Box object to hold data for all drawn rects
	function Box() {
	  this.x = 0;
	  this.y = 0;
	  this.w = 1; // default width and height?
	  this.h = 1;
	  this.fill = '#444444';
          this.content = 'box test';
	}

	//Initialize a new Box, add it, and invalidate the canvas
	function addRect(x, y, w, h, fill,content) {
	  var rect = new Box;
	  rect.x = x;
	  rect.y = y;
	  rect.w = w
	  rect.h = h;
	  rect.fill = fill;
          rect.content = content;
	  $scope.boxes.push(rect);
	  invalidate();
	}


        $scope.delete = function(){

            if(mySel != null){
             $scope.boxes.splice(mySel.index,1);
             $scope.selectedIndex =0;
             invalidate();
             var mouseMoveEvent = document.createEvent("MouseEvents");
              mouseMoveEvent.initMouseEvent(
                "mousemove", //event type : click, mousedown, mouseup, mouseover, mousemove, mouseout.  
                true, //canBubble
                false, //cancelable
                window, //event's AbstractView : should be window 
                1, // detail : Event's mouse click count 
                50, // screenX
                50, // screenY
                50, // clientX
                50, // clientY
                false, // ctrlKey
                false, // altKey
                false, // shiftKey
                false, // metaKey 
                0, // button : 0 = click, 1 = middle button, 2 = right button  
                null // relatedTarget : Only used with some event types (e.g. mouseover and mouseout). In other cases, pass null.
              );
              myDown(mouseMoveEvent);
              if($scope.boxes.length==0 || mySel== null){
                $scope.mySwitch=true;
              } 
            }else{
              alert('Please select any one of the box to delete.')
            }

        }


        $scope.refresh = function(){
             if($scope.boxes.length>0){
             var mouseMoveEvent = document.createEvent("MouseEvents");
              mouseMoveEvent.initMouseEvent(
                "mousemove", //event type : click, mousedown, mouseup, mouseover, mousemove, mouseout.
                true, //canBubble
                false, //cancelable
                window, //event's AbstractView : should be window
                1, // detail : Event's mouse click count
                50, // screenX
                50, // screenY
                50, // clientX
                50, // clientY
                false, // ctrlKey
                false, // altKey
                false, // shiftKey
                false, // metaKey
                0, // button : 0 = click, 1 = middle button, 2 = right button
                null // relatedTarget : Only used with some event types (e.g. mouseover and mouseout). In other cases, pass null.
              );
              myDown(mouseMoveEvent);
             }

        }


	 // when set to true, the canvas will redraw everything
	 // invalidate() just sets this to false right now
	 // we want to call invalidate() whenever we make a change
	var canvasValid = false;

	// The node (if any) being selected.
	// If in the future we want to select multiple objects, this will get turned into an array
	var mySel; 

	// The selection color and width. Right now we have a red selection with a small width
	var mySelColor = '#CC0000';
	var mySelWidth = 2;

        var mySelBoxColor = 'darkred'; // New for selection boxes
        var mySelBoxSize = 6;

	// New, holds the 8 tiny boxes that will be our selection handles
	// the selection handles will be in this order:
	// 0  1  2
	// 3     4
	// 5  6  7
	var selectionHandles = [];

	// we use a fake canvas to draw individual shapes for selection testing
	var ghostcanvas;
	var gctx; // fake canvas context

	// since we can drag from anywhere in a node
	// instead of just its x/y corner, we need to save
	// the offset of the mouse when we start dragging.
	var offsetx, offsety;

	// Padding and border style widths for mouse offsets
	var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

	// initialize our canvas, add a ghost canvas, set draw loop
	// then add everything we want to intially exist on the canvas
	function init() {
	  canvas = document.getElementById('canvas');
	  HEIGHT = canvas.height;
	  WIDTH = canvas.width;
	  ctx = canvas.getContext('2d');
	  ghostcanvas = document.createElement('canvas');
	  ghostcanvas.height = HEIGHT;
	  ghostcanvas.width = WIDTH;
	  gctx = ghostcanvas.getContext('2d');
	  
	  //fixes a problem where double clicking causes text to get selected on the canvas
	  canvas.onselectstart = function () { return false; }
	  
	  // fixes mouse co-ordinate problems when there's a border or padding
	  // see getMouse for more detail
	  if (document.defaultView && document.defaultView.getComputedStyle) {
	    stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
	    stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
	    styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
	    styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
	  }
	  
          /*  
	  // make draw() fire every INTERVAL milliseconds
	  setInterval(draw, INTERVAL);
          */

	  // make mainDraw() fire every INTERVAL milliseconds
	  setInterval(mainDraw, INTERVAL);

	  
	  // set our events. Up and down are for dragging,
	  // double click is for making new boxes
	  canvas.onmousedown = myDown;
	  canvas.onmouseup = myUp;
	  canvas.ondblclick = myDblClick;
	  canvas.onmousemove = myMove;
	 

	  // set up the selection handle boxes
	  for (var i = 0; i < 8; i ++) {
		var rect = new Box;
		selectionHandles.push(rect);
	  }
 
	  // add custom initialization here:
	  
	  // add rectangle from input json , it could be from api 
          for(var i=0;i<$scope.items.length;i++){
                addRect($scope.items[i].x, $scope.items[i].y, $scope.items[i].width, $scope.items[i].height,$scope.items[i].color,$scope.items[i].content);
          }


	}


	// Main draw loop.
	// While draw is called as often as the INTERVAL variable demands,
	// It only ever does something if the canvas gets invalidated by our code
	function mainDraw() {
	  if (canvasValid == false) {
	    clear(ctx);
	    
	    // Add stuff you want drawn in the background all the time here
	    
	    // draw all boxes
	    var l = $scope.boxes.length;
	    for (var i = 0; i < l; i++) {
	      $scope.boxes[i].draw(ctx,i); // we used to call drawshape, but now each box draws itself
	    }
	    
	    // Add stuff you want drawn on top all the time here
	    
	    canvasValid = true;
	  }
	}


	//wipes the canvas context
	function clear(c) {
	  c.clearRect(0, 0, WIDTH, HEIGHT);
	}


/*
	// While draw is called as often as the INTERVAL variable demands,
	// It only ever does something if the canvas gets invalidated by our code
	function draw() {
	  if (canvasValid == false) {
	    clear(ctx);
	    
	    // Add stuff you want drawn in the background all the time here
	    
	    // draw all boxes
	    var l = boxes.length;
	    for (var i = 0; i < l; i++) {
		drawshape(ctx, boxes[i], boxes[i].fill);
	    }
	    
	    // draw selection
	    // right now this is just a stroke along the edge of the selected box
	    if (mySel != null) {
console.log("test333");
	      ctx.strokeStyle = mySelColor;
	      ctx.lineWidth = mySelWidth;
	      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
	    }
	    
	    // Add stuff you want drawn on top all the time here
	    
	    
	    canvasValid = true;
	  }
	}
*/

	Box.prototype = {
	  // each box is responsible for its own drawing
	  // mainDraw() will call this with the normal canvas
	  // myDown will call this with the ghost canvas with 'black'
	  draw: function(context,boxIndex,optionalColor) {
	      if (context === gctx) {
		context.fillStyle = 'black'; // always want black for the ghost canvas
	      } else {
		context.fillStyle = this.fill;
	      }
	      
	      // We can skip the drawing of elements that have moved off the screen:
	      if (this.x > WIDTH || this.y > HEIGHT) return; 
	      if (this.x + this.w < 0 || this.y + this.h < 0) return;


	      context.fillRect(this.x,this.y,this.w,this.h);

              context.font='12pt Arial';
              context.fillStyle='Black';
              context.strokeStyle = 'DarkSlateGray';
              context.textBaseline = "middle";
              context.lineWidth =1;
              var fTx = this.x;
              var fTy = this.y;
              if(this.w<0 && this.x>0){
                fTx=parseInt(this.x+this.w);
              }
              if(this.h<0 && this.y>0){
                fTy=parseInt(this.y+this.h);
              }
// console.log("test331"+"--x:"+this.x+"--y"+this.y+"--fTx"+fTx+"--tTy"+fTy);
//              context.fillText("Box No."+parseInt(boxIndex+1),fTx,fTy+20);  

        // Paint text
        var spl=2,fh=12;


          textContent = "box test";
          if(boxIndex!='black'){
          var textContent = $scope.boxes[boxIndex].content;
          if($scope.boxes[boxIndex].content=='box test'){   
              textContent = "box "+parseInt(boxIndex+1);
              $scope.boxes[boxIndex].content = textContent;              
          }
          }

        var lines = splitLines(context, this.w, Paint.VALUE_FONT, textContent);
        // Block of text height
        var both = lines.length * (fh + spl);
        if (both >= this.h) {
            // We won't be able to wrap the text inside the area
            // the area is too small. We should inform the user 
            // about this in a meaningful way
        } else {
            // We determine the y of the first line
            var ly = (this.h - both)/2 + this.y + spl*lines.length;
            var lx = 0;
            for (var j = 0, ly; j < lines.length; ++j, ly+=fh+spl) {
                // We continue to centralize the lines
                lx = this.x+this.w/2-context.measureText(lines[j]).width/2;
                // DEBUG 
                context.fillText(lines[j], lx, ly);
            }
        }






	      
	    // draw selection
	    // this is a stroke along the box and also 8 new selection handles
	    if (mySel === this) {
	      context.strokeStyle = mySelColor;
	      context.lineWidth = mySelWidth;
	      context.strokeRect(this.x,this.y,this.w,this.h);
	      
	      // draw the boxes
	      
	      var half = mySelBoxSize / 2;
	      
	      // 0  1  2
	      // 3     4
	      // 5  6  7
	      
	      // top left, middle, right
	      selectionHandles[0].x = this.x-half;
	      selectionHandles[0].y = this.y-half;
	      
	      selectionHandles[1].x = this.x+this.w/2-half;
	      selectionHandles[1].y = this.y-half;
	      
	      selectionHandles[2].x = this.x+this.w-half;
	      selectionHandles[2].y = this.y-half;
	      
	      //middle left
	      selectionHandles[3].x = this.x-half;
	      selectionHandles[3].y = this.y+this.h/2-half;
	      
	      //middle right
	      selectionHandles[4].x = this.x+this.w-half;
	      selectionHandles[4].y = this.y+this.h/2-half;
	      
	      //bottom left, middle, right
	      selectionHandles[6].x = this.x+this.w/2-half;
	      selectionHandles[6].y = this.y+this.h-half;
	      
	      selectionHandles[5].x = this.x-half;
	      selectionHandles[5].y = this.y+this.h-half;
	      
	      selectionHandles[7].x = this.x+this.w-half;
	      selectionHandles[7].y = this.y+this.h-half;

	      
	      context.fillStyle = mySelBoxColor;
	      for (var i = 0; i < 8; i ++) {
		var cur = selectionHandles[i];
		context.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
	      }
	    }
	    
	  } // end draw

	}





	// Draws a single shape to a single context
	// draw() will call this with the normal canvas
	// myDown will call this with the ghost canvas
	function drawshape(context, shape, fill) {
	  context.fillStyle = fill;
	//context.fillText("Hello World");  
	  // We can skip the drawing of elements that have moved off the screen:
	  if (shape.x > WIDTH || shape.y > HEIGHT) return; 
	  if (shape.x + shape.w < 0 || shape.y + shape.h < 0) return;

	//	  context.fillText("1",shape.x+15,shape.y+10,shape.w,shape.h);
	  context.fillRect(shape.x,shape.y,shape.w,shape.h);


	}


/*
	// Happens when the mouse is moving inside the canvas
	function myMove(e){
	  if (isDrag){
	    getMouse(e);
	    
	    mySel.x = mx - offsetx;
	    mySel.y = my - offsety;   
	    
	    // something is changing position so we better invalidate the canvas!
	    invalidate();
	  }
	}
*/

	// Happens when the mouse is moving inside the canvas
	function myMove(e){

	  if (isDrag) {
	    getMouse(e);
	    
	    mySel.x = mx - offsetx;
	    mySel.y = my - offsety;   
	    
	    // something is changing position so we better invalidate the canvas!
	    invalidate();
	  } else if (isResizeDrag) {
	    // time ro resize!
	    var oldx = mySel.x;
	    var oldy = mySel.y;
	    
	    // 0  1  2
	    // 3     4
	    // 5  6  7
	    switch (expectResize) {
	      case 0:
		mySel.x = mx;
		mySel.y = my;
		mySel.w += oldx - mx;
		mySel.h += oldy - my;
		break;
	      case 1:
		mySel.y = my;
		mySel.h += oldy - my;
		break;
	      case 2:
		mySel.y = my;
		mySel.w = mx - oldx;
		mySel.h += oldy - my;
		break;
	      case 3:
		mySel.x = mx;
		mySel.w += oldx - mx;
		break;
	      case 4:
		mySel.w = mx - oldx;
		break;
	      case 5:
		mySel.x = mx;
		mySel.w += oldx - mx;
		mySel.h = my - oldy;
		break;
	      case 6:
		mySel.h = my - oldy;
		break;
	      case 7:
		mySel.w = mx - oldx;
		mySel.h = my - oldy;
		break;
	    }


            // don't allow minimum height of the box
            if(mySel.h<40){
               mySel.h=40
            }

            //don't allow minimum width of the box
            if(mySel.w<60){
               mySel.w=60
            }

	    
	    invalidate();
	  }
	  getMouse(e);


	  // if there's a selection see if we grabbed one of the selection handles
	  if (mySel !== null && !isResizeDrag) {
	    for (var i = 0; i < 8; i++) {
	      // 0  1  2
	      // 3     4
	      // 5  6  7
	      
	      var cur = selectionHandles[i];
	      
	      // we dont need to use the ghost context because
	      // selection handles will always be rectangles
	      if (mx >= cur.x && mx <= cur.x + mySelBoxSize &&
		  my >= cur.y && my <= cur.y + mySelBoxSize) {
		// we found one!
		expectResize = i;
		invalidate();
		
		switch (i) {
		  case 0:
		    this.style.cursor='nw-resize';
		    break;
		  case 1:
		    this.style.cursor='n-resize';
		    break;
		  case 2:
		    this.style.cursor='ne-resize';
		    break;
		  case 3:
		    this.style.cursor='w-resize';
		    break;
		  case 4:
		    this.style.cursor='e-resize';
		    break;
		  case 5:
		    this.style.cursor='sw-resize';
		    break;
		  case 6:
		    this.style.cursor='s-resize';
		    break;
		  case 7:
		    this.style.cursor='se-resize';
		    break;
		}
		return;
	      }
	      
	    }
	    // not over a selection box, return to normal
	    isResizeDrag = false;
	    expectResize = -1;
	    this.style.cursor='auto';
	  }
	  
	}

/*
	// Happens when the mouse is clicked in the canvas
	function myDown(e){
	  getMouse(e);
	  clear(gctx);
	  var l = boxes.length;
	  for (var i = l-1; i >= 0; i--) {
	    // draw shape onto ghost context
	    drawshape(gctx, boxes[i], 'black');
	    
	    // get image data at the mouse x,y pixel
	    var imageData = gctx.getImageData(mx, my, 1, 1);
	    var index = (mx + my * imageData.width) * 4;
	    
	    // if the mouse pixel exists, select and break
	    if (imageData.data[3] > 0) {
	      mySel = boxes[i];
              mySel.index = i;
	      offsetx = mx - mySel.x;
	      offsety = my - mySel.y;
	      mySel.x = mx - offsetx;
	      mySel.y = my - offsety;
	      isDrag = true;
	      canvas.onmousemove = myMove;
	      invalidate();
	      clear(gctx);
	      return;
	    }
	    
	  }
	  // havent returned means we have selected nothing
	  mySel = null;
	  // clear the ghost canvas for next time
	  clear(gctx);
	  // invalidate because we might need the selection border to disappear
	  invalidate();
	}
*/

	// Happens when the mouse is clicked in the canvas
	function myDown(e){
	  getMouse(e);

	  //we are over a selection box
	  if (expectResize !== -1) {
		isResizeDrag = true;
		return;
	  }
	  
	  clear(gctx);
	  var l = $scope.boxes.length;
	  for (var i = l-1; i >= 0; i--) {
		// draw shape onto ghost context
		$scope.boxes[i].draw(gctx, 'black');
		
		// get image data at the mouse x,y pixel
		var imageData = gctx.getImageData(mx, my, 1, 1);
		var index = (mx + my * imageData.width) * 4;
		
		// if the mouse pixel exists, select and break
		if (imageData.data[3] > 0) {
		  mySel = $scope.boxes[i];
                  mySel.index = i;
                  $scope.selectedIndex = mySel.index;
                  $scope.mySwitch=false;
                  $scope.$apply()
		  offsetx = mx - mySel.x;
		  offsety = my - mySel.y;
		  mySel.x = mx - offsetx;
		  mySel.y = my - offsety;
		  isDrag = true;
		  
		  invalidate();
		  clear(gctx);
		  return;
		}
		
	  }
	  // havent returned means we have selected nothing
	  mySel = null;
        
          $scope.mySwitch=false; 
	  // clear the ghost canvas for next time
	  clear(gctx);
	  // invalidate because we might need the selection border to disappear
	  invalidate();
	}


        /*
	function myUp(){
	  isDrag = false;
	  canvas.onmousemove = null;
	}
        */
	function myUp(){
	  isDrag = false;
	  isResizeDrag = false;
	  expectResize = -1;
	}

	// adds a new node
	function myDblClick(e) {
	  getMouse(e);
	  // for this method width and height determine the starting X and Y, too.
	  // so I left them as vars in case someone wanted to make them args for something and copy this code
	  var width = 60;
	  var height = 40;
	  addRect(mx - (width / 2), my - (height / 2), width, height, '#FFC02B','box test');
	}

	function invalidate() {
	  canvasValid = false;
	}

	// Sets mx,my to the mouse position relative to the canvas
	// unfortunately this can be tricky, we have to worry about padding and borders
	function getMouse(e) {
	      var element = canvas, offsetX = 0, offsetY = 0;

	      if (element.offsetParent) {
		do {
		  offsetX += element.offsetLeft;
		  offsetY += element.offsetTop;
		} while ((element = element.offsetParent));
	      }

	      // Add padding and border style widths to offset
	      offsetX += stylePaddingLeft;
	      offsetY += stylePaddingTop;

	      offsetX += styleBorderLeft;
	      offsetY += styleBorderTop;

	      mx = e.pageX - offsetX;
	      my = e.pageY - offsetY
	}


	// The painting properties 
	// Normally I would write this as an input parameter
	var Paint = {
			RECTANGLE_STROKE_STYLE : 'black',
			RECTANGLE_LINE_WIDTH : 1,
			VALUE_FONT : '12px Arial',
			VALUE_FILL_STYLE : 'red'
	}
	/*
	 * @param ctx   : The 2d context 
	 * @param mw    : The max width of the text accepted
	 * @param font  : The font used to draw the text
	 * @param text  : The text to be splitted   into 
	 */
	var splitLines = function(ctx, mw, font, text) {
			// We give a little "padding"
			// This should probably be an input param
			// but for the sake of simplicity we will keep it
			// this way
			mw = mw - 10;
			// We setup the text font to the context (if not already)
			var words = text.split(' ');
			var new_line = words[0];
			var lines = [];
			for(var i = 1; i < words.length; ++i) {
			   if (ctx.measureText(new_line + " " + words[i]).width < mw) {
				   new_line += " " + words[i];
			   } else {
				   lines.push(new_line);
				   new_line = words[i];
			   }
			}
			lines.push(new_line);
			// DEBUG 
			// for(var j = 0; j < lines.length; ++j) {
			//    console.log("line[" + j + "]=" + lines[j]);
			// }
			return lines;
	}



});
