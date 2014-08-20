
$(document).ready(function() {
	lone.setUp();
});

var lone = (new function() {
	var self = this;
	this.turn = 0;
	this.points = 0;
	this.actionField;
	this.selectedElement;

	this.resources = {
		tool: {
			name: "Tool",
			amount: 0
			},
		battery: {
			name: "Battery",
			amount: 0
			},
		hullPart: {
			name: "Hull Part",
			amount: 0
			},
		solarPanel : {
			name: "Solar Panel",
			amount: 0
			},
		electronicPart: {
			name: "Electronic Part",
			amount: 0
			}
	};

	this.elements = {
		rescueCapsule: {
			name: "Rescue Capsule",
			amount: 1,
			pointValue: 1,
			buy: function () {
				self.elements.buyElement(0,0,0,0,0);
		    	}
			},
		hullAdapter: {
			name: "Hull Adapter",
			pointValue: 1,
			amount: 0,
			buy: function () {
				self.elements.buyElement(0,0,1,0,0);
		    	}
			},
		solarArray: {
			name: "Solar Array",
			pointValue: 5,
			amount: 0,
			buy: function () {
				self.elements.buyElement(0,1,0,3,1);
		    	}
			},
		foodLab: {
			name: "Food Lab",
			pointValue: 6,
			amount: 0,
			buy: function () {
				self.elements.buyElement(2,0,1,0,2);
		    	}
			},
		plasmaShield: {
			name: "Plasma Shield",
			pointValue: 7,
			amount: 0,
			buy: function () {
				self.elements.buyElement(0,2,0,0,3);
		    	}
			},
		energyCube: {
			name: "Energy Cube",
			pointValue: 5,
			amount: 0,
			buy: function () {
				self.elements.buyElement(1,2,0,0,0);
		    	}
			},
		reactor: {
			name: "Reactor",
			pointValue: 10,
			amount: 0,
			buy: function () {
				self.elements.buyElement(1,1,1,0,1);
		    	}
			},
		commRoom: {
			name: "Comm Room",
			pointValue: 20,
			amount: 0,
			buy: function () {
				self.elements.buyElement(3,1,1,0,4);
		    	}
			},
		buyElement: function(a,b,c,d,e){
			self.resources.tool.amount = self.resources.tool.amount - a;
			self.resources.battery.amount = self.resources.battery.amount - b;
			self.resources.hullPart.amount = self.resources.hullPart.amount - c;
			self.resources.solarPanel.amount = self.resources.solarPanel.amount - d;
			self.resources.electronicPart.amount = self.resources.electronicPart.amount - e;
			
			
		}
	};

	self.setUp = function() {
		$('#board').append(self.getTemplateEmptyRow());
		$('#board').append(self.getTemplateEmptyRow());
		$('#board').append(self.getTemplateEmptyRow());
		var startingField = $('.board_row').children()[13];
		$(startingField).html('<img alt="rescue_capsule" src="img/elem_rescueCapsule.png">');
		$(startingField).removeAttr('onmouseover');
		self.reRender();
		self.fillStatusLog("Welcome Commander...", 1);
		self.fillStatusLog("Due to a leak your Space Station had to be evacuated", 2);
		self.fillStatusLog("You are the only survivor", 3);
		self.fillStatusLog("Collect as much space junk as you need to get back to earth", 4);
	};

	self.action = function(existingField) {
		
		self.actionField = existingField;
		
		if(!self.areEnoughResourcesAvailable())
			return;
		
		if(!self.isClickedFieldAllowed(existingField))
			return;
		
		var directions = '';
		if(self.selectedElement.indexOf("hullAdapter") != -1)
			directions = self.getAdjacentElementString(existingField);
		
		$(self.actionField).html('<img alt="'+self.selectedElement+'" src="./img/elem_'+self.selectedElement+directions+'.png">');
		
		window['lone']['elements'][self.selectedElement]['amount'] += 1;
		self.calculatePoints();
		self.checkIfNewRowIsNeeded();
		self.reRender();
	};
	
	/**
	 * Checks if the clicked Field (the actionField) is able to becomne the selected Element
	 */
	self.isClickedFieldAllowed = function(existingField){
		if(!$(existingField).hasClass('active'))
			return false;

		if(typeof self.selectedElement == 'undefined')
			return false;
		
		if(!typeof self.actionField == 'undefined'){
			var htmlOfActionField = $(self.actionField).html();
			if(htmlOfActionField.indexOf("elem_empty.png") == -1)
				return false;
		}
		
		if(self.adjascentToSolarArray(existingField))
			return false;
		if(self.selectedElement.indexOf("hullAdapter") == -1){
			if((!self.adjacentToHull(existingField) || self.adjacentToForbiddenElements(existingField)))
				return false;
		}
		
		return true;
	};
	
	self.areEnoughResourcesAvailable = function(){
		if(self.selectedElement == 'hullAdapter'){
			if( self.resources.hullPart.amount >= 1){
				self.elements.hullAdapter.buy();
				return true;
			}
		}else if(self.selectedElement == 'solarArray'){
			if(	self.resources.battery.amount >= 1 &&
				self.resources.solarPanel.amount >= 3 &&
				self.resources.electronicPart.amount >= 1)
			{
				self.elements.solarArray.buy();
				return true;
			}
		}else if(self.selectedElement == 'foodLab'){
			if(	self.resources.tool.amount >= 2 &&
				self.resources.hullPart.amount >= 1 &&
				self.resources.electronicPart.amount >= 2)
				{
					self.elements.foodLab.buy();
					return true;
				}
		}else if(self.selectedElement == 'plasmaShield'){
			if(	self.resources.battery.amount >= 2 &&
				self.resources.electronicPart.amount >= 3)
				{
					self.elements.plasmaShield.buy();
					return true;
				}
		}else if(self.selectedElement == 'energyCube'){
			if(	self.resources.tool.amount >= 1 &&
				self.resources.battery.amount >= 2)
				{
					self.elements.energyCube.buy();
					return true;
				}
		}else if(self.selectedElement == 'reactor'){
			if(	self.resources.tool.amount >= 1 &&
				self.resources.battery.amount >= 1 &&
				self.resources.hullPart.amount >= 1 &&
				self.resources.electronicPart.amount >= 1)
				{
					self.elements.reactor.buy();
					return true;
				}
		}else if(self.selectedElement == 'commRoom'){
			if(	self.resources.tool.amount >= 3 &&
				self.resources.battery.amount >= 1 &&
				self.resources.hullPart.amount >= 1 &&
				self.resources.electronicPart.amount >= 4)
				{
					self.elements.commRoom.buy();
					return true;
				}
		}
		
		return false;
	};

	self.selectElement = function(element) {
		var elementID = $(element).attr('id');
		self.selectedElement = elementID.substring(5);
		var siblings = $(element).siblings('.element');
		$.each(siblings, function() {
			$(this).children().children().css('border', 'solid 2px #000000');
		});

		$(element).children().children().css('border', 'dashed 2px #48F31C');
		
		self.highlightValidFields();
	};
	
	/**
	 * Highlights all Fields on the board where the parameter-element can be placed
	 */
	self.highlightValidFields = function() {
		var allFields = $('.board_field');
		$.each(allFields, function() {
			if(self.isClickedFieldAllowed(this)){
				$(this).addClass('highlighted');
			}else{
				$(this).removeClass('highlighted');
			}
				
		});
	};

	self.checkIfNewRowIsNeeded = function() {
		var parent = $(self.actionField).parent();
		var allRows = $('#board').find('.board_row');
		var indexOfRow = $(allRows).index(parent);
		if(indexOfRow == allRows.length-1){
			self.addRow('after');
		}else if(indexOfRow == 0){
			self.addRow('before');
		}
	};

	self.reRender = function() {
		var allFields = $('.board_field');
		$.each(allFields, function() {
			var field = this;
			var htmlOfField = $(field).html();
			if(htmlOfField.indexOf("elem_empty.png") > -1){
				return true; //return true in $.each() == continue;
			}
			$(field).removeClass("active");

			var adjacentFields = self.getAdjacentElementsOf(field);

			adjacentFields.forEach(function(field) {
				if($(field).length == 1 && $(field).html().indexOf("elem_empty.png") != -1)
					$(field).addClass("active");
			});
		});
		
		self.highlightValidFields();
		
		$('#amntBattery').text(self.resources.battery.amount);
		$('#amntHullPart').text(self.resources.hullPart.amount);
		$('#amntElectronicPart').text(self.resources.electronicPart.amount);
		$('#amntSolarPanel').text(self.resources.solarPanel.amount);
		$('#amntTool').text(self.resources.tool.amount);
		$('#amntPoints').text(self.points + ' Points');
		$('#amntTurns').text('Turn ' + self.turn);
	};
	self.adjascentToSolarArray = function(element) {
		var adjacentFields = self.getAdjacentElementsOf(element);
		var trueOrFalse = false;
		adjacentFields.forEach(function(elem) {
			var htmlOfElem = $(elem).html();
			if(htmlOfElem.indexOf("elem_solarArray.png") != -1)
				trueOrFalse = true;
		});
		return trueOrFalse;
	};

	self.adjacentToHull = function(element){
		var adjacentFields = self.getAdjacentElementsOf(element);
		var trueOrFalse = false;
		adjacentFields.forEach(function(elem) {
			var htmlOfElem = $(elem).html();
			if(htmlOfElem.indexOf("elem_hullAdapter") != -1)
				trueOrFalse = true;
		});
		return trueOrFalse;
	};

	self.adjacentToForbiddenElements = function(element){
		var adjacentFields = self.getAdjacentElementsOf(element);
		var trueOrFalse = false;
		adjacentFields.forEach(function(hull) {
			var htmlOfHull = $(hull).html();
			// Forbidden Elements = non hull and non empty
			//if(htmlOfHull.indexOf("elem_misc.png") != -1 || htmlOfHull.indexOf("elem_rescueCapsule.png") != -1)
			if(htmlOfHull.indexOf("elem_empty.png") == -1 && htmlOfHull.indexOf("elem_hullAdapter") == -1)
				trueOrFalse = true;
		});
		return trueOrFalse;
	};

	self.getAdjacentElementsOf = function(field) {
		var indexOfField = $(field).parent().children().index(field);
		var adjacentNextField = $(field).next();
		var adjacentPreviousField = $(field).prev();
		var adjacentTopField = $(field).parent().prev().find("div:eq("+indexOfField+")");
		var adjacentBottomField = $(field).parent().next().find("div:eq("+indexOfField+")");

		var adjacentFields = [];
		
		if(adjacentTopField.length > 0)
			adjacentFields.push(adjacentTopField);
		if(adjacentBottomField.length > 0)
			adjacentFields.push(adjacentBottomField);
		if(adjacentPreviousField.length > 0)
			adjacentFields.push(adjacentPreviousField);
		if(adjacentNextField.length > 0)
			adjacentFields.push(adjacentNextField);

		self.fixAdjacentHulls(adjacentFields);
		
		return adjacentFields;
	};
	
	self.getAdjacentElementString = function(field) {
		var indexOfField = $(field).parent().children().index(field);
		var adjacentNextField = $(field).next();
		var adjacentPreviousField = $(field).prev();
		var adjacentTopField = $(field).parent().prev().find("div:eq("+indexOfField+")");
		var adjacentBottomField = $(field).parent().next().find("div:eq("+indexOfField+")");

		var directions = "";
		
		if(adjacentTopField.length > 0 && $(adjacentTopField).html().indexOf('empty') == -1){
			directions = directions + "u";
		}
		if(adjacentBottomField.length > 0 && $(adjacentBottomField).html().indexOf('empty') == -1){
			directions = directions + "d";
		}
		if(adjacentPreviousField.length > 0 && $(adjacentPreviousField).html().indexOf('empty') == -1){
			directions = directions + "l";
		}
		if(adjacentNextField.length > 0 && $(adjacentNextField).html().indexOf('empty') == -1){
			directions = directions + "r";
		}

		return directions;
	};
	
	self.fixAdjacentHulls = function(adjacentFields){
		adjacentFields.forEach(function(hull) {
			if($(hull).html().indexOf('hullAdapter') != -1)
				$(hull).html('<img alt="Hull Adapter" src="./img/elem_hullAdapter'+self.getAdjacentElementString(hull)+'.png">');
		});
	};

	self.addRow = function(whereToAdd){
		var parentRow = $(self.actionField).parent();
		if(whereToAdd == 'after'){
			$(self.getTemplateEmptyRow()).insertAfter(parentRow);
		}else if(whereToAdd == 'before'){
			$(self.getTemplateEmptyRow()).insertBefore(parentRow);
		}
	};

	self.showModal = function(element) {
		if($(element).html() == 'Cheat Sheet'){
			//get cheat sheet template
			$('#modal').html(self.getTemplateCheatSheet());
		}
		$('#modal_bg').fadeIn('fast');
	};

	self.hideElement = function(element) {
		$('#modal_bg').fadeOut('fast');
	};
	
	self.nextTurn = function() {
		self.turn = self.turn + 1;
		self.resources.tool.amount += self.generateRandomResource(0.5);
		self.resources.battery.amount += self.generateRandomResource(0.5);
		self.resources.hullPart.amount += self.generateRandomResource(0.5);
		self.resources.solarPanel.amount += self.generateRandomResource(0.5);
		self.resources.electronicPart.amount += self.generateRandomResource(0.5);
		self.calculatePoints();
		self.reRender();
	};
	
	/**
	 * calculates the total amount of Points Collected
	 */
	self.calculatePoints = function() {
		var points = 0;
		points += self.elements.rescueCapsule.amount * self.elements.rescueCapsule.pointValue;
		points += self.elements.hullAdapter.amount * self.elements.hullAdapter.pointValue;
		points += self.elements.solarArray.amount * self.elements.solarArray.pointValue;
		points += self.elements.foodLab.amount * self.elements.foodLab.pointValue;
		points += self.elements.plasmaShield.amount * self.elements.plasmaShield.pointValue;
		points += self.elements.energyCube.amount * self.elements.energyCube.pointValue;
		points += self.elements.reactor.amount * self.elements.reactor.pointValue;
		points += self.elements.commRoom.amount * self.elements.commRoom.pointValue;
		points = (points*100 / self.turn+1) -101;
		self.points = points.toFixed(2);
	};
	
	self.generateRandomResource = function(percentage) {
		var amount = 0;
		if(Math.random() < percentage){
			amount = self.generateRandomResource(percentage);
			return amount+1;
		}
		return amount;
	};
	
	self.fillStatusLog = function(log, row) {
		if(row == 1){
			self.fillTextSlow(log, 'logRowOne');
		}else if(row == 2){
			self.fillTextSlow(log, 'logRowTwo');
		}else if(row == 3){
			self.fillTextSlow(log, 'logRowThree');
		}else if(row == 4){
			self.fillTextSlow(log, 'logRowFour');
		}
	};
	
	self.fillTextSlow = function(text, elementID) {
	    
		var textAdder = null;
		var placeHolder = 0;
	    textAdder = setInterval(function(){
	        document.getElementById(elementID).innerHTML += text.charAt(placeHolder);
	        if (++placeHolder == text.length){
	            clearInterval(textAdder);
	        }
	    }, 100);  
	};

	self.getTemplateEmptyRow = function(){
		var template =
			'<div class="row board_row">'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
				+'<div class="board_field" onclick="lone.action(this);">'
					+'<img alt="empty_field" src="img/elem_empty.png">'
				+'</div>'
			+'</div>';
		return template;
	};
	self.getTemplateCheatSheet = function(){
		var template =
			'<div id="cheatsheet">'
				+'<h1>Cheat Sheet</h1>'
				+'<p>TODO</p>'
			+'</div>';
		return template;
	};
});
