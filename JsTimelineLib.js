(function() {
	if(typeof(JsTimelineLib) === 'undefined'){JsTimelineLib = {}};
	JsTimelineLib.anim = JsTimelineLib.anim || {};
  
	JsTimelineLib.anim.FrameCaller = function(callback, instance){
		this.callback = callback.bind(instance);
	
		JsTimelineLib.anim.FrameCaller.prototype._init();	
		this._running = false;
		JsTimelineLib.anim.FrameCaller.prototype._instances.push(this);
	}
	
	JsTimelineLib.anim.FrameCaller.prototype.start = function(){
		if(!this._running){
			this._running = true;
			if(JsTimelineLib.anim.FrameCaller.prototype._instancesRunning == 0){
				JsTimelineLib.anim.FrameCaller._requestNextFrame(JsTimelineLib.anim.FrameCaller.prototype._frameCallback);
			}
			JsTimelineLib.anim.FrameCaller.prototype._instancesRunning++;
		}
	}
	
	JsTimelineLib.anim.FrameCaller.prototype.stop = function(){
		if(this._running){
			this._running = false;
			JsTimelineLib.anim.FrameCaller.prototype._instancesRunning--;
		}
	}
	
	JsTimelineLib.anim.FrameCaller.prototype._instances = [];
	JsTimelineLib.anim.FrameCaller.prototype._initialized = false;
	JsTimelineLib.anim.FrameCaller.prototype._instancesRunning = 0;
	JsTimelineLib.anim.FrameCaller.prototype._MSPF = 1000/60;
	JsTimelineLib.anim.FrameCaller.prototype.FPS = 0;
	JsTimelineLib.anim.FrameCaller.prototype._MSPFConstant = 0.1;
	JsTimelineLib.anim.FrameCaller.prototype._forceTimeout = false;
	JsTimelineLib.anim.FrameCaller.prototype._usingAnimationFrame = false;
	JsTimelineLib.anim.FrameCaller.prototype._now = window.performance.now.bind(window.performance) || Date.now.bind(date);
	JsTimelineLib.anim.FrameCaller.prototype._lastFrameDate = 0;
	
	JsTimelineLib.anim.FrameCaller.prototype.forceTimeout = function(param){
		if(param){
			JsTimelineLib.anim.FrameCaller.prototype._forceTimeout = true;
		} else {
			JsTimelineLib.anim.FrameCaller.prototype._forceTimeout = false;
		}
	}
	
	JsTimelineLib.anim.FrameCaller.prototype._frameCallback = function(){
		if(JsTimelineLib.anim.FrameCaller.prototype._instancesRunning > 0){
			for(var i = 0; i < JsTimelineLib.anim.FrameCaller.prototype._instances.length; i++){
				if(JsTimelineLib.anim.FrameCaller.prototype._instances[i]._running){
					JsTimelineLib.anim.FrameCaller.prototype._instances[i].callback();
				}
			}
			var current_date = JsTimelineLib.anim.FrameCaller.prototype._now();
			JsTimelineLib.anim.FrameCaller.prototype._MSPF = (JsTimelineLib.anim.FrameCaller.prototype._MSPF * (1 - JsTimelineLib.anim.FrameCaller.prototype._MSPFConstant)) + (JsTimelineLib.anim.FrameCaller.prototype._MSPFConstant * (current_date - JsTimelineLib.anim.FrameCaller.prototype._lastFrameDate));
			JsTimelineLib.anim.FrameCaller.prototype.FPS = 1000 / JsTimelineLib.anim.FrameCaller.prototype._MSPF;
			JsTimelineLib.anim.FrameCaller.prototype._lastFrameDate = current_date;
			JsTimelineLib.anim.FrameCaller._requestNextFrame(JsTimelineLib.anim.FrameCaller.prototype._frameCallback);
		}
	}
	
	var requestAnimationFrame = (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame);
	if(typeof(requestAnimationFrame) != 'undefined'){
		JsTimelineLib.anim.FrameCaller._requestNextFrame = requestAnimationFrame.bind(window);
	} else {
		JsTimelineLib.anim.FrameCaller._requestNextFrame = function(callback){
			setTimeout(callback, 10);
		}
	}
	
	JsTimelineLib.anim.FrameCaller.prototype._init = function(){
		if(!JsTimelineLib.anim.FrameCaller.prototype._initialized){
			JsTimelineLib.anim.FrameCaller.prototype._initialized = true;
		}
	}
  
  JsTimelineLib.anim.timingFunctions = JsTimelineLib.anim.timingFunctions || {};
  
  JsTimelineLib.anim.timingFunctions.LINEAR = function(position){
    return position;
  }
  
  JsTimelineLib.anim.timingFunctions.EASEINQUADRATIC = function(position){
    return position*position; 
  }
  
  JsTimelineLib.anim.timingFunctions.EASEOUTQUADRATIC = function(position){
    return -position*(position-2); 
  }

  JsTimelineLib.anim.timingFunctions.EASEINOUTQUADRATIC = function(position){
    if(position <= 0.5){
      return (position*position*2);
    } else {
      return 1-((1-position)*(1-position)*2);
    }  
  }
  
  JsTimelineLib.anim.timingFunctions.EASEINCUBIC = function(position){
    return position*position*position; 
  }
  
  JsTimelineLib.anim.timingFunctions.EASEOUTCUBIC = function(position){
    return (position-1)*(position-1)*(position-1) + 1; 
  }

  JsTimelineLib.anim.timingFunctions.EASEINOUTCUBIC = function(position){
    if(position <= 0.5){
      return (position*position*position*4);
    } else {
      return 1+((position-1)*(position-1)*(position-1)*4);
    }  
  }
  
  JsTimelineLib.anim.timingFunctions.EASEINSINE = function(position){
    return (1 + Math.sin((Math.PI*(position-1)/2)));
  }
  
  JsTimelineLib.anim.timingFunctions.EASEOUTSINE = function(position){
    return Math.sin(Math.PI*position/2);
  }
  
  JsTimelineLib.anim.timingFunctions.EASEINOUTSINE = function(position){
    return (1-Math.sin(Math.PI*(position+0.5)))/2;
  }
  
  JsTimelineLib.anim.timingFunctions.EASEINEXP = function(position){
    return Math.pow(2, 10 * (position - 1));    
  }
  
  JsTimelineLib.anim.timingFunctions.EASEOUTEXP = function(position){
    return -Math.pow(2,-10*position)+1;
  }
  
  JsTimelineLib.anim.timingFunctions.EASEINOUTEXP = function(position){
    if(position <= 0.5){
      return 0.5 * Math.pow( 2, 10 * ((2*position) - 1) );
    } else {
      return 0.5 * ( -Math.pow( 2, -10 * (2*position - 1)) + 2 );
    }  
  }
  
  JsTimelineLib.anim.timingFunctions.EASEINCIRCULAR = function(position){
    return 1 - Math.sqrt(1 - position*position);
  }
  
  JsTimelineLib.anim.timingFunctions.EASEOUTCIRCULAR = function(position){
    return Math.sqrt(1 - ((position - 1)*(position - 1)));
  }
  
  JsTimelineLib.anim.timingFunctions.EASEINOUTCIRCULAR = function(position){
    if(position <= 0.5){
      return - 0.5 * (Math.sqrt(1 - 4*position*position) - 1);
    } else {
      return 0.5 * (Math.sqrt(1 - 4*(position-1)*(position-1)) + 1);
    }  
  }
  
  JsTimelineLib.anim.timingFunctions.EASEOUTBOUNCE = function (t) {
    var p = 0.3;
    return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
  }
  
  JsTimelineLib.errors = JsTimelineLib.errors || {};
  JsTimelineLib.utils = JsTimelineLib.utils || {};

  JsTimelineLib.utils.addEvent = function(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
  };

  if(typeof(Date.now) === 'function'){
    JsTimelineLib.utils.now = Date.now;
  } else {
    JsTimelineLib.utils.now = function(){return new Date().getTime();};
  }
  
  JsTimelineLib.errors.ARG_NOT_OBJ = {'message':"Argument not an object."};

  //rendering engine
  
  JsTimelineLib.rendering = JsTimelineLib.rendering || {};
  
  JsTimelineLib.rendering.SVGNamespace = 'http://www.w3.org/2000/svg';
  
  JsTimelineLib.rendering.RenderFrame = function(container_dom_element){
    this.pixelWidth;
    this.pixelHeight;
    
    this.timePerPixel;
    this.viewFrameStartDate;
    this.viewFrameEndDate;
    
    this.svgFrame = document.createElementNS(JsTimelineLib.rendering.SVGNamespace,'svg');
    this.svgFrame.setAttribute('style', 'border: 1px solid black;width:100%;height:100%;');
    this.svgFrame.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    
    container_dom_element.appendChild(this.svgFrame);
  };
  

  //drawing logic
  
  //TODO : add pixel adjustment at end of animations (round to lower integer)
  
  JsTimelineLib.rendering.Period = function(render_frame, period_obj, depth){
    this.renderFrame = render_frame;
    this.periodObj = period_obj;
    this.periodObj.graphicObjectCreated = true;
    this.periodObj.graphicObject = this;
    
    this.svg_group = document.createElementNS(JsTimelineLib.rendering.SVGNamespace,'g');
    this.svg_rect = document.createElementNS(JsTimelineLib.rendering.SVGNamespace,'rect');
     
    this.fill_color = "rgb(" + Math.round(255 * Math.random()) + "," + Math.round(255 * Math.random()) + "," + Math.round(255 * Math.random()) + ")";
 
    this.svg_rect.setAttributeNS(null,"fill",this.fill_color);
    this.svg_rect.setAttributeNS(null,"fill-opacity",0.7);
    this.svg_rect.setAttributeNS(null,"stroke","none");
    this.svg_rect.setAttributeNS(null,"stroke-opacity",0.7);

    this.resize(depth);
    
    this.svg_group.appendChild(this.svg_rect);
    this.renderFrame.svgFrame.appendChild(this.svg_group);
  }
  
  JsTimelineLib.rendering.Period.prototype.resize = function(depth){
    var period_x = (this.periodObj.startDate - this.renderFrame.viewFrameStartDate) / this.renderFrame.timePerPixel;
    var period_width = (this.periodObj.endDate - this.periodObj.startDate) / this.renderFrame.timePerPixel;
    
    this.svg_group.setAttributeNS(null,"transform","translate(" + period_x + " 0)");
    this.svg_rect.setAttributeNS(null,"x",0);
    this.svg_rect.setAttributeNS(null,"width",period_width);
    this.svg_rect.setAttributeNS(null,"y",depth * 50);
    this.svg_rect.setAttributeNS(null,"height",this.renderFrame.pixelHeight -(depth * 50));
    
  }
    
  JsTimelineLib.rendering.RenderFrame.prototype.redraw = function(period_tree_root){
    this.redraw_recursive(period_tree_root);
  };
  
  JsTimelineLib.rendering.RenderFrame.prototype.redraw_recursive_depth = 0;
  
  JsTimelineLib.rendering.RenderFrame.prototype.redraw_recursive = function(period_obj){
    if(!period_obj.graphicObjectCreated){
      new JsTimelineLib.rendering.Period(this, period_obj, this.redraw_recursive_depth);
    } else {
      period_obj.graphicObject.resize(this.redraw_recursive_depth);
    }
    if(period_obj.childPeriods.length > 0){
      this.redraw_recursive_depth++;
      for(var i=0; i < period_obj.childPeriods.length; i++){
        this.redraw_recursive(period_obj.childPeriods[i]);
      }
      this.redraw_recursive_depth--;
    }
  }
  
  JsTimelineLib.rendering.RenderFrame.prototype.resizeHandler = function(){
    var boundingRect = this.svgFrame.getBoundingClientRect();
    this.pixelWidth = boundingRect.width;
    this.pixelHeight = boundingRect.height;
  }
  
  //main class
  
  JsTimelineLib.JsTimeline = function(container_dom_element){
    this.init = false;
    
    this.renderFrame = new JsTimelineLib.rendering.RenderFrame(container_dom_element);
    
    this.minDate = null;
    this.maxDate = null;

    this.viewFrameStartDate = null;
    this.viewFrameEndDate = null;
    this.currentDate = null;
    this.timePerPixel = null;
    this.minPeriodWidth = 10;
    
    
    this.pixelWidth = 0;
    this.pixelHeight = 0;
    
    this._periodTreeRoot = null;
    this._periodCount = 0;
    this._periodIndex = new Object();
    this._mileStoneCount = 0;
    this._mileStoneIndex = new Object();

    window.addEventListener("resize", this.resizeHandler.bind(this), false);
    this.resizeHandler();
    
    this.frameCaller = new JsTimelineLib.anim.FrameCaller(this.animateHandler, this);
  };

  JsTimelineLib.JsTimeline.prototype.resizeHandler = function(){
    this.renderFrame.resizeHandler();
    
    if(this.init){

    }
  }
  
  /*
  Animation object
  destinationStartDate
  destinationEndDate
  timingfunction
  _startDate
  _endDate
  _startTime
  _endTime
  
  
  */
  
  JsTimelineLib.JsTimeline.prototype.panTo = function(destination_start_date, destination_end_date, timing_function, animation_duration){    
    if(typeof(this.animationObject) === 'undefined'){
      this.animationObject = {};
    }
    
    /*if(destination_start_date < this.minDate){
      this.animationObject.destinationStartDate = this.minDate;
    } else {*/
      this.animationObject.destinationStartDate = destination_start_date;
    //}
    /*if(destination_end_date > this.maxDate){
      this.animationObject.destinationEndDate = this.maxDate;
    } else {*/
      this.animationObject.destinationEndDate = destination_end_date;
    //}
    
    this.animationObject.originStartDate = this.renderFrame.viewFrameStartDate;
    this.animationObject.deltaStartDate = this.animationObject.destinationStartDate - this.animationObject.originStartDate;
    
    this.animationObject.originEndDate = this.renderFrame.viewFrameEndDate;
    this.animationObject.deltaEndDate = this.animationObject.destinationEndDate - this.animationObject.originEndDate;

    
    this.animationObject.timingFunction = timing_function;
    this.animationObject.animationDuration = animation_duration;
    
    this.animationObject.startTime = JsTimelineLib.utils.now();
    this.animationObject.endTime = this.animationObject.startTime + this.animationObject.animationDuration;
    
    this.frameCaller.start();
  }
  
  JsTimelineLib.JsTimeline.prototype.animateHandler = function(){
    var current_position = (JsTimelineLib.utils.now() - this.animationObject.startTime) / (this.animationObject.endTime - this.animationObject.startTime);
    if(current_position >= 1){
      this.setView(this.animationObject.destinationStartDate, this.animationObject.destinationEndDate);
      this.frameCaller.stop();
    } else {
      var timing_function_result = this.animationObject.timingFunction(current_position);
      var current_start_date = this.animationObject.originStartDate + (timing_function_result * this.animationObject.deltaStartDate);
      var current_end_date = this.animationObject.originEndDate + (timing_function_result * this.animationObject.deltaEndDate);
      this.setView(current_start_date, current_end_date);
    }
  }
  
  JsTimelineLib.JsTimeline.prototype.setView = function(start_date, end_date){
    this.renderFrame.viewFrameStartDate = start_date;
    this.renderFrame.viewFrameEndDate = end_date;
    
    this.renderFrame.timePerPixel = (this.renderFrame.viewFrameEndDate - this.renderFrame.viewFrameStartDate) / (this.renderFrame.pixelWidth);
    
    this.renderFrame.redraw(this._periodTreeRoot);
  }
  
  /* Period obj :
  id: string; mandatory
  parentId: string;
  startDate : number (for now); mandatory
  endDate : number (for now); mandatory
  title : string;
  description : string;
  hasUnloadedChilds: boolean;
  
  color : 32 bit color string;
  
  */
  JsTimelineLib.errors.PERIOD_ROOT_ALREADY_EXISTS = {'message':"Root period already exists."}
  JsTimelineLib.errors.PERIOD_ID_ALREADY_EXISTS = {'message':"Period id already exists."}
  JsTimelineLib.errors.PERIOD_PARENT_ID_DOES_NOT_EXIST = {'message':"Parent id does not exist."}
  JsTimelineLib.errors.PERIOD_NO_ID = {'message':"Period id is not defined or not a string."}
  JsTimelineLib.errors.PERIOD_NO_START = {'message':"Period start is not defined."}
  JsTimelineLib.errors.PERIOD_NO_END = {'message':"Period end is not defined."}
  
  JsTimelineLib.JsTimeline.prototype.addPeriod = function(period_obj){
    var insertion_ok = true;
    var parentPeriodNode = null;
    var is_root_node = false;
    
    //arguments check
    
    if(typeof(period_obj) !== 'object'){
      throw(JsTimelineLib.errors.ARG_NOT_OBJ);
    }

    if(typeof(period_obj.startDate) === 'undefined'){//also test if is adequate date object
      throw(JsTimelineLib.errors.PERIOD_NO_START);
    }
    
    if(typeof(period_obj.endDate) === 'undefined'){
      throw(JsTimelineLib.errors.PERIOD_NO_END);
    }
    
    var period_node = new Object();
    period_node.startDate = period_obj.startDate;
    period_node.endDate = period_obj.endDate;
    
    if(
      (typeof(period_obj.id) === 'undefined')
      || (period_obj.id == null)
      || (period_obj.id == "")
    ){
      throw(JsTimelineLib.errors.PERIOD_NO_ID);
    } else {
      if(typeof(this._periodIndex[period_obj.id]) !== 'undefined'){
        throw(JsTimelineLib.errors.PERIOD_ID_ALREADY_EXISTS);
      }
    }

    if(
      (typeof(period_obj.parentId) === 'undefined')
      || (period_obj.parentId == null)
      || (period_obj.parentId == "")
    ){ //New period is root
      if(this._periodTreeRoot != null){
        throw(JsTimelineLib.errors.PERIOD_ROOT_ALREADY_EXISTS);
      } else {
        this.minDate = period_node.startDate;
        this.maxDate = period_node.endDate;
      }
      is_root_node = true;
    } else {//New period has parent node
      if(typeof(this._periodIndex[period_obj.parentId]) === 'undefined'){
        throw(JsTimelineLib.errors.PERIOD_PARENT_ID_DOES_NOT_EXIST);
      } else {
        
      }
    }

    var internal_period_object = {};
    internal_period_object.id = period_obj.id;
    
    //add check if it fits in parent period dates.
    
    internal_period_object.startDate = period_obj.startDate;
    internal_period_object.endDate = period_obj.endDate;
    
    
    internal_period_object.minTimePerPixel = (internal_period_object.endDate - internal_period_object.startDate) / this.minPeriodWidth;
    
    internal_period_object.childPeriods = [];
    
    if(is_root_node){
      this._periodTreeRoot = internal_period_object;
      internal_period_object.parentPeriod = null;
    } else {
      internal_period_object.parentPeriod = this._periodIndex[period_obj.parentId];
      internal_period_object.parentPeriod.childPeriods.push(internal_period_object);
    }
    
    //graphic object.
    internal_period_object.graphicObject = null;
    internal_period_object.graphicObjectCreated = false;
    
    //Add to domain edge data structure.
    
    this._periodCount++;
    this._periodIndex[internal_period_object.id] = internal_period_object;    
  }
  
  JsTimelineLib.JsTimeline.prototype.updatePeriod = function(period_obj){
  
  }
  
  JsTimelineLib.JsTimeline.prototype.removePeriod = function(period_id){
    
  }
  
  /* Milestone obj:
  id : string;
  date : date;
  title : string;
  
  */
  
  JsTimelineLib.JsTimeline.prototype.addMileStone = function(milestone_obj){
    this.priority = priority;
    
    var event_id = this._eventIdCount;
    this._eventIdCount++;
    return event_id;
  }
  
  JsTimelineLib.JsTimeline.prototype.updateMileStone = function(milestone_obj){
  
  }
  
  JsTimelineLib.JsTimeline.prototype.removeMileStone = function(milestone_obj){
  
  }
      
  JsTimelineLib.MileStone = function(){
  
  }
  
})();