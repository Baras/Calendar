var FUNCS = FUNCS || {};
(function(){
	function getDaysInMonth(dt){
			return 33 - new Date(dt.getFullYear(), dt.getMonth(), 33).getDate();
	}
	function getPreviousDate(dt){
		var prevMonth= dt.getMonth() === 0 ? 11 : dt.getMonth()- 1,
			prevYear=prevMonth=== 11 ? dt.getFullYear()-1 : dt.getFullYear();
		return new Date(prevYear, prevMonth, 1);
	}
	function getNextDate(dt){
		var nextMonth= dt.getMonth() === 11 ? 0 : dt.getMonth()+ 1,
			nextYear=nextMonth=== 0 ? dt.getFullYear()+1 : dt.getFullYear();
		return new Date(nextYear, nextMonth, 1);
	}
	function getDayByNum(num){
		var days={
			'0':'Воскресенье',
			'1':'Понедельник',
			'2':'Вторник',
			'3':'Среда',
			'4':'Четверг',
			'5':'Пятница',
			'6':'Суббота'
		};
		return days[num];
	}
	function getMonthByNum(num){
		var months={
			'0':'Январь',
			'1':'Февраль',
			'2':'Март',
			'3':'Апрель',
			'4':'Май',
			'5':'Июнь',
			'6':'Июль',
			'7':'Август',
			'8':'Сентябрь',
			'9':'Октябрь',
			'10':'Ноябрь',
			'11':'Декабрь'
		};
		return months[num];
	}
	function getLastMonday(dt){
		var days=FUNCS.getDaysInMonth(dt),
			lastDay = new Date(dt.getFullYear(), dt.getMonth(), days).getDay(),
			num= lastDay=== 1 ? 0 : lastDay === 0 ? 6 : lastDay-1,
			monday=days-num;
		return monday;
	}

	function createElementFromHTMLString(s){
		var div = document.createElement('div');
		div.innerHTML = s;
		var elements = div.childNodes;
		return div.children[0];
	}
	function getClass(ele) {
		var className = ele.className;
		return className && typeof className.split == 'function' ?
			className.split(/\s+/) : [];
	}

	function hasClass(ele, cls) {
		var arr = getClass(ele);
		return inArray(arr,cls);
	}

	function addClass(ele, cls) {
		var arr;
		if (hasClass(ele, cls) == -1) {
			arr = getClass(ele);
			arr.push(cls);
			ele.className = arr.join(' ');
			return true;
		} else {
			return false;
		}
	}

	function removeClass(ele, cls) {
		var arr, i, max;
		if (hasClass(ele, cls) != -1) {
			arr = getClass(ele);
			for (i = 0,max = arr.length; i < max; i++) {
				if (arr[i] == cls) {
					arr.splice(i--, 1);
				}
			}
			ele.className = arr.join(' ');
			return true;
		}
		return false;
	}
	function inArray(arr, p_val){
		var i,max;
		for (i = 0,max = arr.length; i < max; i++) {
			if (arr[i] == p_val) {
				return i;
			}
		}
		return -1;
	}

	FUNCS.getDaysInMonth = getDaysInMonth;
	FUNCS.getPreviousDate = getPreviousDate;
	FUNCS.getNextDate = getNextDate;
	FUNCS.getDayByNum = getDayByNum;
	FUNCS.getMonthByNum = getMonthByNum;
	FUNCS.getLastMonday= getLastMonday;
	FUNCS.createElementFromHTMLString = createElementFromHTMLString;
	FUNCS.addClass= addClass;
	FUNCS.removeClass = removeClass;
	return FUNCS;
})();