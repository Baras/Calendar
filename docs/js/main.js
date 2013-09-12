var Calendar = function () {
	this.init();
};
var cEvent = function (options) {
	this.title = options.title || '';
	this.date = options.date || '';
	this.time = options.time || '';
	this.members = options.members || '';
	this.description = options.description || '';
};
Calendar.prototype.init = function () {
	this.container = document.getElementById('cal_container');
	this.blocks = this.container.getElementsByClassName('b-calendar__block');
	this.now = new Date();
	this.loadEventsFromStorage();
	this.draw();
	this.addEvents();
};

Calendar.prototype.clearBlocks = function () {
	this.eventWindow = '';
	for (var i = 0, l = this.blocks.length; i < l; i++) {
		this.blocks[i].innerHTML = '';
		this.blocks[i].removeAttribute('data-date');
		FUNCS.removeClass(this.blocks[i], 'b-calendar__today');
		FUNCS.removeClass(this.blocks[i], 'b-calendar__event');
		FUNCS.removeClass(this.blocks[i], 'b-calendar__active');
	}
};

Calendar.prototype.templates = {
	normalBlock: function (data) {
		return '<div>' + data.dayNum + '</div>';
	},
	firstRowBlock: function (data) {
		return '<div>' + FUNCS.getDayByNum(data.day) + ', ' + data.dayNum + '</div>';
	},
	eventWindow: function (cEvent) {
		//			'<div>' +(cEvent.date || '<input type="text" id="b-event-window__date" placeholder="День, месяц, год">') +'</div>'
		return '<div class="b-event-window"><div class="triangle-with-shadow"></div>' +
			'<div class="b-event-window__exit"></div>' +
			'<div class="b-event-window__top">' +
			'<div>' +
			( cEvent.title ? '<div class="b-event-window__title">' + cEvent.title + '</div>' : '<input type="text" id="b-event-window__title" placeholder="Событие"> ') +
			'</div>' +
			'<div>' + (cEvent.time || '<input type="text" id="b-event-window__time" placeholder="Время">') + '</div>' +
			'<div>' +
			(cEvent.members ? '<div class="b-event-window__members-title">Участники</div>' + cEvent.members : '<input type="text" id="b-event-window__members"  placeholder="Имена участников">') +
			'</div>' +
			'</div>' +
			'<div class="b-event-window__description">' +
			(cEvent.description || '<textarea id="b-event-window__description" placeholder="Описание"></textarea>') +
			'</div>' +
			'<div class="b-event-window__bottom">' +
			'<a class="b-event-window__btn" id="b-event-window__ready">Готово</a>' +
			'<a class="b-event-window__btn" id="b-event-window__remove">Удалить</a>' +
			'</div>' +
			'</div>';
	},
	eventBlock: function (cEvent) {
		return '<div>' +
			'<div class="b-calendar__event-title">' +
			cEvent.title +
			'</div>' +
			'<div>' +
			cEvent.members +
			'</div>' +
			'</div>';
	},
	searchItem: function (cEvent) {
		var dt = new Date(cEvent.date);
		return '<div class="b-search__row" data-date="' + dt.toDateString() + '">' +
			'<div class="b-search__title">' +
			cEvent.title +
			'</div>' +
			'<div>' +
			FUNCS.getMonthByNum(dt.getMonth()) + ' ' + dt.getDate() +
			'</div>' +
			'</div>';
	}
};

Calendar.prototype.draw = function () {
	var day,
		j = 0,
		previousDate = FUNCS.getPreviousDate(this.now),
		previousDateDaysNum = FUNCS.getDaysInMonth(previousDate),
		previousDateLastMonday = FUNCS.getLastMonday(previousDate),
		currentDateDaysNum = FUNCS.getDaysInMonth(this.now),
		currDateText = FUNCS.getMonthByNum(this.now.getMonth()) + ' ' + this.now.getFullYear(),
		dtBox = document.getElementsByClassName('b-switch__date')[0],
		today = new Date(),
		currDate,
		blockTemplate;
	this.clearBlocks();
	for (var i = 0, l = this.blocks.length; i < l; i++) {
		if ((i < 7) && (previousDateDaysNum - previousDateLastMonday) <= 5 && previousDateLastMonday + i <= previousDateDaysNum) {
			//first row prev month
			day = previousDateLastMonday + i;
			blockTemplate = this.templates.firstRowBlock({
				day: (i + 1) === 7 ? 0 : i + 1,
				dayNum: day
			});
			this.blocks[i].appendChild(FUNCS.createElementFromHTMLString(blockTemplate));
			currDate = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDateLastMonday + i);
		}
		else if (i < 7) {
			//first row current month
			j++;
			day = j;
			blockTemplate = this.templates.firstRowBlock({
				day: (i + 1) === 7 ? 0 : i + 1,
				dayNum: day
			});
			this.blocks[i].appendChild(FUNCS.createElementFromHTMLString(blockTemplate));
			currDate = new Date(this.now.getFullYear(), this.now.getMonth(), j);
		}
		else if (j < currentDateDaysNum) {
			//other rows current month
			j++;
			day = j;
			blockTemplate = this.templates.normalBlock({
				dayNum: day
			});
			this.blocks[i].appendChild(FUNCS.createElementFromHTMLString(blockTemplate));
			currDate = new Date(this.now.getFullYear(), this.now.getMonth(), j);
		}
		else break;
		this.blocks[i].setAttribute('data-date', currDate.toDateString());
		if (this.cEvents[currDate.toDateString()]) {
			FUNCS.addClass(this.blocks[i], 'b-calendar__event');
			this.blocks[i].appendChild(FUNCS.createElementFromHTMLString(this.templates.eventBlock(this.cEvents[currDate.toDateString()])));
		}
		if (today.toDateString() === currDate.toDateString()) {
			FUNCS.addClass(this.blocks[i], 'b-calendar__today');
		}
	}
	dtBox.innerHTML = currDateText;
	this.saveEventsToStorage();
};

Calendar.prototype.addEvents = function () {
	var cont = document.getElementsByClassName('b-switch')[0],
		left = cont.getElementsByClassName('u-btn-left')[0],
		right = cont.getElementsByClassName('u-btn-right')[0],
		today = cont.getElementsByClassName('b-switch__today')[0],
		fastEvent = document.getElementById('b-fast__add'),
		fastEventClose = document.getElementsByClassName('b-event-window__exit')[0],
		fastEventInput = document.getElementById('b-fast__input'),
		searchInput = document.getElementById('b-search__input'),
		clearSearchInput = document.getElementsByClassName('b-search__clear')[0],
		renew = document.getElementById('b-renew'),
		self = this;
	left.addEventListener('click', function () {
		self.backward.call(self);
	});
	right.addEventListener('click', function () {
		self.forward.call(self);
	});
	today.addEventListener('click', function () {
		self.jumpToDate.call(self, new Date());
	});
	renew.addEventListener('click', function(){
		var dt = self.now;
		self.loadEventsFromStorage();
		self.draw();
		self.jumpToDate(dt);
	});
	fastEvent.addEventListener('click', function (e) {
		self.showFastEventWindow.call(self);
	});
	fastEventClose.addEventListener('click', function (e) {
		self.hideFastEventWindow.call(self);
		e.stopPropagation();
	});
	fastEventInput.addEventListener('keyup', function (e) {
		if (e.keyCode === 13) {
			if (fastEventInput.value !== '')
				self.addFastEvent.call(self, fastEventInput.value);
			self.hideFastEventWindow.call(self);
		}
	});
	searchInput.addEventListener('keyup', function (e) {
		self.search.call(self);
	});
	clearSearchInput.addEventListener('click', function (e) {
		self.clearSearch.call(self);
	});
	for (var i = 0, l = this.blocks.length; i < l; i++) {
		this.blocks[i].addEventListener('click', function (index) {
			return (function () {
				self.showEventWindow.call(self, self.blocks[index]);
			});
		}(i));
	}
};

Calendar.prototype.forward = function (e) {
	this.now = FUNCS.getNextDate(this.now);
	this.draw();
};

Calendar.prototype.backward = function () {
	this.now = FUNCS.getPreviousDate(this.now);
	this.draw();
};

Calendar.prototype.jumpToDate = function (dt) {
	this.now = dt;
	this.draw();
};

Calendar.prototype.createEvent = function (options) {
	this.cEvents[options.date.toDateString()] = new cEvent(options);
}
Calendar.prototype.updateEvent = function (options) {
	var curEvent = this.cEvents[options.date.toDateString()];
	for (var prop in curEvent) {
		if (curEvent.hasOwnProperty(prop) && options.hasOwnProperty(prop) && typeof options[prop] !== 'undefined')
			curEvent[prop] = options[prop];
	}
}
Calendar.prototype.removeEvent = function (options) {
	if (this.cEvents[options.date.toDateString()])
		delete this.cEvents[options.date.toDateString()];
}
Calendar.prototype.showEventWindow = function (block) {
	var dt = block.getAttribute('data-date'),
		curEvent = this.cEvents[dt],
		eventWindow,
		templateString;

	if (this.eventWindow && this.eventWindow.parentNode !== block) {
		this.closeEventWindow();
	}
	if (!this.eventWindow || this.eventWindow.parentNode !== block) {
		if (dt) {
			if (curEvent)
				templateString = this.templates.eventWindow(curEvent);
			else
				templateString = this.templates.eventWindow(new cEvent({}), dt);
			eventWindow = FUNCS.createElementFromHTMLString(templateString);
			block.appendChild(eventWindow);
			FUNCS.addClass(block, 'b-calendar__active');
			this.eventWindow = eventWindow;
			this.addcEventHandlers();
		}
	}
}
Calendar.prototype.addcEventHandlers = function () {
	var done_btn = document.getElementById('b-event-window__ready'),
		delete_btn = document.getElementById('b-event-window__remove'),
		self = this,
		close_btn = this.eventWindow.getElementsByClassName('b-event-window__exit')[0],
		dt = new Date(this.eventWindow.parentNode.getAttribute('data-date'));


	close_btn.addEventListener('click', function (e) {
		self.closeEventWindow.call(self);
		e.stopPropagation();
	});
	done_btn.addEventListener('click', function (e) {
		var title = document.getElementById('b-event-window__title') ? document.getElementById('b-event-window__title').value : undefined,
			time = document.getElementById('b-event-window__time') ? document.getElementById('b-event-window__time').value : undefined,
			members = document.getElementById('b-event-window__members') ? document.getElementById('b-event-window__members').value : undefined,
			description = document.getElementById('b-event-window__description') ? document.getElementById('b-event-window__description').value : undefined,
			options = {
				title: title,
				date: new Date(dt),
				time: time,
				members: members,
				description: description
			};
		if (self.cEvents[dt.toDateString()]) {
			self.updateEvent.call(self, options);
		}
		else {
			self.createEvent.call(self, options);
		}

		self.closeEventWindow.call(self);
		self.draw();
		e.stopPropagation();
	});
	delete_btn.addEventListener('click', function (e) {
		self.removeEvent.call(self, {
			date: new Date(dt)
		});
		self.closeEventWindow.call(self);
		self.draw();
		e.stopPropagation();
	});
}
Calendar.prototype.closeEventWindow = function () {
	FUNCS.removeClass(this.eventWindow.parentNode, 'b-calendar__active');
	this.eventWindow.parentNode.removeChild(this.eventWindow);
	this.eventWindow = '';
}
Calendar.prototype.showFastEventWindow = function () {
	document.getElementById('b-fast__window').style.display = "block";
}
Calendar.prototype.hideFastEventWindow = function () {
	document.getElementById('b-fast__window').style.display = "";
	document.getElementById('b-fast__input').value = '';
}
Calendar.prototype.addFastEvent = function (str) {
	var months = {
			'января': 0,
			'февраля': 1,
			'марта': 2,
			'апреля': 3,
			'мая': 4,
			'июня': 5,
			'июля': 6,
			'августа': 7,
			'сентября': 8,
			'октября': 9,
			'ноября': 10,
			'декабря': 11
		},
		arr = str.split(', '),
		date_arr = arr[0].split(' '),
		day = date_arr[0],
		month = date_arr[1],
		options = {
			title: arr[2],
			date: new Date(new Date().getFullYear(), months[month.toLowerCase()], day),
			time: arr[1]
		};

	if (this.cEvents[options.date]) {
		this.updateEvent(options);
	}
	else {
		this.createEvent(options);
	}
	this.jumpToDate(options.date);
}
Calendar.prototype.search = function () {
	var input = document.getElementById('b-search__input'),
		searchObj = {},
		rows = document.getElementsByClassName('b-search__row'),
		self = this;
	if (input.value === '') {
		this.hideSearchClearer();
		this.hideSearchResults();
	}
	else {
		this.clearResults();
		for (var ev in this.cEvents) {
			searchObj[ev] = ('' + this.cEvents[ev].title + this.cEvents[ev].date + this.cEvents[ev].members).toLowerCase();
		}

		for (var ev in searchObj) {
			if (searchObj[ev].indexOf(input.value.toLowerCase()) !== -1) {
				document.getElementById('b-search__content').appendChild(
					FUNCS.createElementFromHTMLString(
						this.templates.searchItem(this.cEvents[ev])
					)
				);
			}
		}
		for (var i = 0, l = rows.length; i < l; i++) {
			rows[i].addEventListener('click', function () {
				self.jumpToDate(new Date(this.getAttribute('data-date')));
				self.hideSearchResults();
				self.clearSearch();
			});
		}
		this.showSearchClearer();
		if (rows.length !== 0) {
			this.showSearchResults();
		}
	}

}
Calendar.prototype.clearResults = function () {
	document.getElementById('b-search__content').innerHTML = '';
}
Calendar.prototype.showSearchResults = function () {
	document.getElementById('b-search__window').style.display = 'block';
}
Calendar.prototype.hideSearchResults = function () {
	document.getElementById('b-search__window').style.display = '';
}
Calendar.prototype.hideSearchClearer = function () {
	document.getElementsByClassName('b-search__clear')[0].style.display = '';
}
Calendar.prototype.showSearchClearer = function () {
	document.getElementsByClassName('b-search__clear')[0].style.display = 'block';
}
Calendar.prototype.clearSearch = function () {
	document.getElementById('b-search__input').value = '';
	this.hideSearchResults();
	this.hideSearchClearer();
}
Calendar.prototype.loadEventsFromStorage = function(){
	this.cEvents = (localStorage['events'] && localStorage['events'] !== 'undefined') ? JSON.parse(localStorage['events']) : {};
}
Calendar.prototype.saveEventsToStorage = function(){
	localStorage['events'] = JSON.stringify(this.cEvents);
}
var cal = new Calendar();
