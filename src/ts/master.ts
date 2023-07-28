import * as M from 'materialize-css';
import * as $ from 'jquery';
// import M from 'materialize-css';
// import $ from 'jquery';
import Lazy from 'vanilla-lazyload';
import Swiper, {Autoplay, EffectCoverflow, EffectFade, Navigation, Pagination} from 'swiper';
import Zoomer from './lib/zoomer';
import Inputmask from 'inputmask';
import Tabs from './lib/tabs';

let hasDark:boolean = false;
(window as any).JQuery = $;

import Typed from 'typed.js';
Swiper.use([Autoplay, Navigation, EffectCoverflow, EffectFade, Pagination]);

let rakw:number = -1;
let pressed = false;
let startWidth = 0;
let stopped = false;
let pressedTime=0;
let preventClick=false;
let map:any;
let mapCenter:Array<number>;


declare var ymaps:any;

const leftTransition = "left .4s cubic-bezier(.76,-0.48,.32,1.44) .07s, right .4s cubic-bezier(.76,-0.48,.32,1.44) .01s";
const rightTransition = "left .4s cubic-bezier(.76,-0.48,.32,1.44) .01s, right .4s cubic-bezier(.76,-0.48,.32,1.44) .07s";


(() => {

	let current_date = new Date();
	let tommorow = current_date.setDate(current_date.getDate() + 1);
	let modal = M.Modal.init(document.querySelectorAll('.modal'));
	let sidenav = M.Sidenav.init(document.querySelectorAll('.sidenav'));
	let lazy = new Lazy({}, document.querySelectorAll('.lazy'));
	let tooltips = M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
		enterDelay: 200
	});
	let carrySlider:Swiper;
	let datePicker = M.Datepicker.init(document.querySelectorAll('.datepicker'), {
		firstDay: 1,
		autoClose: true,
		minDate: new Date(tommorow),
		format: 'dd mmmm yyyy',
		onSelect: loadIntervals,
		i18n: {
			done: 'OK',
			clear: 'Очистить',
			cancel: 'Отмена',
			weekdays: ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
			weekdaysAbbrev: ['п','в','с','ч','п','с','в'],
			weekdaysShort: ['пн','вт','ср','чт','пт','сб','вс'],
			months: [
				'Январь',
				'Февраль',
				'Март',
				'Апрель',
				'Май',
				'Июнь',
				'Июль',
				'Август',
				'Сентябрь',
				'Октябрь',
				'Ноябрь',
				'Декабрь',
			],
			monthsShort:['Янв','Фвр','Мрт','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
		},
		onClose: () => {
			$('#delivery-time').addClass('visible');
		}
	});

	let inputmask = new Inputmask('+7 (9{3}) 9{3}-9{2}-9{2}')
	inputmask.mask(document.querySelectorAll('[name="phone"'));
	
	let typed:Typed;
	let header = document.querySelector('.header-wrapper');
	if(header)
	{
		hasDark = header?.classList.contains('dark');
	}

	let zoomer = new Zoomer('.zoomer', 'src', true, 300);
	let main_tabs = new Tabs({
		headerSelector: '#main-tabs',
		contentSelector: '#main-tabs-content'
	})

	let secondaryTabs = new Tabs({
		headerSelector: '#secondary-tabs',
		contentSelector: '#secondary-tabs-content'
	})
	
	resizeHandler();
	scrollHandler();
	
	document.querySelectorAll('.section-slider').forEach(s => {
		let slider = <HTMLElement>s;
		let sectionId = slider.dataset['section'];
		let prevEl = `#${sectionId}-prev`;
		let nextEl = `#${sectionId}-next`;
	
		let sectionSlider = new Swiper(slider, {
			slidesPerView: 'auto',
			spaceBetween: 10,
			loop: true,
			speed: 800,
			autoplay: {
				delay: 5000
			},
			navigation: {
				prevEl: prevEl,
				nextEl: nextEl
			},
			on:{
				autoplayTimeLeft: (s:Swiper, time:number, progress:number) => {
					(<SVGElement>document.querySelector(`#${sectionId}-circle-progress`)).style.setProperty('stroke-dashoffset', `calc(320px * (1 - ${1 - progress}))`);
				},
				slideChange: (slider) => {
					(<SVGElement>document.querySelector(`#${sectionId}-circle-progress`)).style.setProperty('stroke-dashoffset', `calc(320px * (1 - ${1 - 1}))`);
				}
			}
		});
	
		slider.addEventListener('mouseenter', (e:MouseEvent) => { (e.currentTarget as any).swiper.autoplay.pause(); });
		slider.addEventListener('mouseleave', (e:MouseEvent) => { (e.currentTarget as any).swiper.autoplay.resume(); });
	})

	if(document.querySelectorAll('#actions-slider')){
		let swiper = new Swiper('#actions-slider', {
			initialSlide: 1,
			speed: 600,
			loop: true,
			loopedSlides: 2,
			effect: 'coverflow',
			slidesPerView: 'auto',
			slideToClickedSlide: true,
			navigation: {
				prevEl: '#actions-prev',
				nextEl: '#actions-next'
			},
			coverflowEffect: {
				slideShadows: false,
			},
			breakpoints:{
				1400: {
					coverflowEffect: {
						rotate: 0,
						stretch: 950,
						depth: 200,
						modifier: 1,
						slideShadows: false,
					}
				},
				1600: {
					coverflowEffect: {
						rotate: 0,
						stretch: 1050,
						depth: 200,
						modifier: 1,
						slideShadows: false,
					}
				},
				1800: {
					coverflowEffect: {
						rotate: 0,
						stretch: 1200,
						depth: 200,
						modifier: 1,
						slideShadows: false,
					}
				}
			}
		});
	}
	
	if(document.querySelectorAll('#carry-slider').length)
	{
		carrySlider = new Swiper('#carry-slider', {
			effect: 'fade',
			loop: true,
			fadeEffect: {
				crossFade: true
			},
			autoplay: {
				delay: 3000
			},
			navigation: {
				prevEl: '#carryPrev',
				nextEl: '#carryNext'
			},
			on:{
				slideChange: (slider:Swiper) => {
					let activeIndex:number = slider.activeIndex;
					let slide = <HTMLElement>slider.slides[activeIndex];
					let text = slide.dataset['text'];
	
					if(!text) return;

					if(typed)
					{
						typed.destroy();
					}
	
					typed = new Typed('.typed', {
						strings: [text],
						backDelay: 2000000000,
						typeSpeed: 20,
						loop: true,
						cursorChar: '_',
						smartBackspace: false,
					});
					
					(window as any).typed = typed;
				}
			}
		})
	
		let activeIndex:number = carrySlider.activeIndex;
		let slide = <HTMLElement>carrySlider.slides[activeIndex];
		let text = slide.dataset['text'];

		if(text)
		{
			typed = new Typed('.typed', {
				strings: [text],
				backDelay: 2000000000,
				typeSpeed: 20,
				loop: true,
				cursorChar: '_',
				smartBackspace: false,
			});
		}
		
	}
	
	if($('.partners-slider').length){
	
		let partnersSwiper = new Swiper('.partners-slider', {
			slidesPerView: 'auto',
			centeredSlides: true,
			loop: true,
			centerInsufficientSlides: true,
			loopedSlides: 12,
			speed: 800,
			autoplay: {
				delay: 1000
			}
		});
	}

	if($('#stories-root').length)
	{
		let storiesSwiper = new Swiper('#stories-root', {
			touchStartPreventDefault: false,
			on:{
				slideChange:function(slider)
				{
					let index = slider.realIndex;
					let activeSlide = (slider.slides[index]);
					let subslider:Swiper = (activeSlide.querySelector('.swiper') as any).swiper
	
					let activeIndex = subslider.realIndex;
					let slidesCount = subslider.slides.length;
	
					subslider.slideTo(0, 0);
					subslider.el.querySelectorAll('.swiper-pagination-bullet span').forEach(el => {
						(<HTMLElement>el).style.width='0';
					})
	
					startWidth=0;
				}
			}
		});
		document.querySelectorAll('#stories-root .swiper').forEach(s => {

			let story = <HTMLElement>s
	
			let nextNav = <HTMLElement>story.querySelector('.next');
			let prevNav = <HTMLElement>story.querySelector('.prev');
			let noSlider = story.querySelectorAll('.swiper-slide').length == 1;
	
			story.addEventListener('mousedown', () => {
				pressed = true;
				let storySlider = (story as any).swiper;
				let activeSlide = storySlider.slides[storySlider.realIndex];
				let video = activeSlide.querySelector('video');
				if(video)
				{
					video.pause();
				}
				pressedTime = Date.now();
			});
	
			story.addEventListener('mouseup', (e:MouseEvent) => {
				pressed = false;
				let nowTime = Date.now();
				let difference = nowTime - pressedTime;
				let storySlider = (story as any).swiper;
				let activeSlide = storySlider.slides[storySlider.realIndex];
				let video = activeSlide.querySelector('video');
				if(video)
				{
					video.play();
				}
				if(difference > 500){
					preventClick=true;
				}else{
					preventClick=false;
				}
				console.log({difference, preventClick});
			});
	
			story.addEventListener('touchstart', (e:TouchEvent) => {
				pressed = true;
				window.oncontextmenu = (e:Event) => {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					return false
				};
				let storySlider = (story as any).swiper;
				let activeSlide = storySlider.slides[storySlider.realIndex];
				let video = activeSlide.querySelector('video');
				if(video)
				{
					video.pause();
				}
				pressedTime = Date.now();
			});
	
			story.addEventListener('touchend', () => {
				pressed = false;
				window.oncontextmenu = (e:Event) => {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					return false
				};
				let storySlider = (story as any).swiper;
				let activeSlide = storySlider.slides[storySlider.realIndex];
				let video = activeSlide.querySelector('video');
				if(video)
				{
					video.play();
				}
				let nowTime = Date.now();
				let difference = nowTime - pressedTime;
				if(difference > 500){
					preventClick=true;
				}else{
					preventClick=false;
				}
				console.log({difference, preventClick});
			});
	
			if(noSlider){
				let pagination = <HTMLInputElement>story.querySelector('.swiper-pagination');
				let page = document.createElement('div');
				page.classList.add('.swiper-pagination-bullet');
				pagination.appendChild(page);
			}
	
			nextNav.addEventListener('click', (e:MouseEvent) => {
				if(preventClick){
					preventClick=false;
					e.stopImmediatePropagation();
					return;
				}
				let el = <HTMLElement>e.currentTarget;
				let reachedEnd = el.classList.contains('swiper-button-disabled');
				let root:Swiper = (document.querySelector('#stories-root') as any).swiper;
	
				let rootIndex = root.realIndex;
				let rootSlides = root.slides.length-1;
				let rootReachedEnd = rootIndex == rootSlides;
				
				if(rootReachedEnd && reachedEnd){
					closeStories();
				}else{
					if(reachedEnd) root.slideNext();
				}
			})
	
			prevNav.addEventListener('click', (e:MouseEvent) => {
				if(preventClick){
					preventClick=false;
					e.stopImmediatePropagation();
					return;
				}
				let el = <HTMLElement>e.currentTarget;
				let reachedEnd = el.classList.contains('swiper-button-disabled');
				let root:Swiper = (document.querySelector('#stories-root') as any).swiper;
				if(reachedEnd) root.slidePrev();
			})
	
			if(noSlider){
				story.classList.add('no-slider');
			}
	
			let storySwiper = new Swiper(story, {
				effect: 'fade',
				touchStartPreventDefault: false,
				fadeEffect:{
					crossFade: true
				},
				navigation: {
					nextEl: nextNav,
					prevEl: prevNav
				},
				pagination: {
					type: 'bullets',
					el: '.swiper-pagination',
					renderBullet: function(index, className){
						return `<div class="${className}" data-slide="${index}"><span></span></div>`
					}
				},
				on:{
					navigationNext: function(storySlide){
	
						let index = storySlide.realIndex;
	
						// Заполняем все
						storySlide.el.querySelectorAll('.swiper-pagination-bullet span').forEach(el => {
							(<HTMLElement>el).style.width = '100%';
						});
	
						// Сбрасываем все после текущего
						storySlide.el.querySelectorAll(`[data-slide="${index}"] ~ .swiper-pagination-bullet span`).forEach(el => {
							(<HTMLElement>el).removeAttribute('style');
						});
	
						// Сбрасываем текущий
						storySlide.el.querySelector(`[data-slide="${index}"]  span`)?.removeAttribute('style');
	
						// Сбрасываем глобальный счётчик
						startWidth = 0;
					},
					navigationPrev: function(storySlide:Swiper){
						let index = storySlide.realIndex;
	
						// Заполняем все
						storySlide.el.querySelectorAll('.swiper-pagination-bullet span').forEach(el => {
							(<HTMLElement>el).style.width = '100%';
						});
	
						// Сбрасываем все после текущего
						storySlide.el.querySelectorAll(`[data-slide="${index}"] ~ .swiper-pagination-bullet span`).forEach(el => {
							(<HTMLElement>el).removeAttribute('style');
						});
	
						// Сбрасываем текущий
						storySlide.el.querySelector(`[data-slide="${index}"]  span`)?.removeAttribute('style');
	
						// Сбрасываем глобальный счётчик
						startWidth = 0;
					},
					slideChange: function(storySlider){
						let currentSlide = storySlider.slides[storySlider.realIndex];
						let video = <HTMLVideoElement>currentSlide.querySelector('video');
						if(video)
						{
							video.currentTime=0;
							video.play();
						}
					}
				}
			});
	
			storySwiper.slideTo(1);
			storySwiper.slideTo(0);
		});
	}

	if($('#map').length) loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU', initMap);
	
	$(window).on('resize', resizeHandler);
	window.addEventListener('scroll', scrollHandler)
	$('body').on('click', '.folder > a', toggleFolder);
	$('body').on('click', '.bttn-cart', flipSmartBttn);
	$('body').on('click', '.cart-bttn-small.bx-minus', minusSmartBttn);
	$('body').on('click', '.cart-bttn-small.bx-plus', plusSmartBttn);
	$('body').on('click', '.gallery-thumb', loadBig);
	$('body').on('click', '.story-trigger', launchStories);
	$('body').on('click', '.stories-modal', hideStories);
	$('body').on('click', '.stories-modal .closer', hideStories);
	$('body').on('click', '.stories-wrapper .arrow', handleArrowClick);
	$('body').on('click', 'form .reset', resetFilters);
	$('body').on('change', '[name=address]', setAddress);
	$('body').on('change', '[name=delivery-day]', setInterval);
	$('body').on('click', '.toggle-actions', toggleActions);
	$('body').on('touchstart', disableContextMenu);
	$('body').on('click', '#interval', openIntervalList);
	$('body').on('click', '.input-field li a', selectInterval);
	$('body').on('click', clickOutside);
	$('body').on('click', '.order-row', toggleOrderDetails);
	$('body').on('change', '.accout-type-selector', switchAccountType);
	$('body').on('click', '.address-wrapper a', openAddress);
	$('body').on('click', '.city-header', openCity);
	$('body').on('change', '[name="reason"]', switchReason);
	$('body').on('mouseleave', '.tooltipped', resetTooltip);
	$('body').on('click', '.scroll-link', scrollToBlock);

	if($('[name=address]').length){
		let el = <HTMLElement>document.querySelector('[name=address]');
		$('[name=city]').val(el.dataset['city'] || "");
		$('[name=street]').val(el.dataset['street'] || "");
		$('[name=house]').val(el.dataset['house'] || "");
		$('[name=block]').val(el.dataset['block'] || "");
		$('[name=app]').val(el.dataset['app'] || "");
		$('[name=entrance]').val(el.dataset['entrance'] || "");
		$('[name=floor]').val(el.dataset['floor'] || "");
		$('[name=domofon]').val(el.dataset['domofon'] || "");
	}

	let url = new URL(window.location.href);
	let params = new URLSearchParams(url.search);
	let scroll = params.get('scroll');

	let headerHeight = document.querySelector('header')?.offsetHeight;

	if(scroll){
		$('html, body').animate({
			scrollTop: $('#content').offset().top - headerHeight - 40
		}, 400);
	}

})()

function scrollToBlock(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let el = <HTMLLinkElement>e.currentTarget;
	let hash = '#' + el.href.split('#')[1];

	let blockPos = $(hash).offset()?.top;

	$('html, body').animate({
		scrollTop: blockPos
	}, 400);
	
}

function resetTooltip(e:JQuery.MouseLeaveEvent)
{
	let el = e.currentTarget;
	let instance = M.Tooltip.getInstance(el);
	let tooltip = (instance as any).tooltipEl;

	setTimeout(() => {
		$(tooltip).removeAttr('style');
	}, 500)

}

function switchReason(e:JQuery.ChangeEvent)
{
	let val = $(e.currentTarget).val();
	if(val == 'other')
	{
		$('.other-reason').slideDown('fast');
	}else{
		$('.other-reason').slideUp('fast');
	}
}

function initMap()
{
	ymaps.ready(() => {

		// Получаем центр карты из среднеарифметического координат адресов
		let coordsHeader = document.querySelectorAll('.address-header a');
		
		let lonArray = new Array<number>();
		let latArray = new Array<number>();
		let coordsArray = new Array();

		coordsHeader.forEach(el => {
			let element = <HTMLElement>el;
			let lon = element.dataset['lon']?.toString();
			let lat = element.dataset['lat']?.toString();

			if(lon && lat)
			{
				lonArray.push(parseFloat(lon));
				latArray.push(parseFloat(lat));
				coordsArray.push([parseFloat(lon), parseFloat(lat), element.innerText.trim()]);
			}
		})

		let minLon = Math.min(...lonArray)
		let maxLon = Math.max(...lonArray)
		let lon = (minLon + maxLon) / 2;

		let minLat = Math.min(...latArray)
		let maxLat = Math.max(...latArray)
		let lat = (minLat + maxLat) / 2;

		mapCenter = [lon, lat]

		map = new ymaps.Map('map', {
			center: [lon, lat],
			zoom: 10,
			controls: []
		})

		map.controls.add('zoomControl');
		map.controls.add('geolocationControl');
		map.controls.add('searchControl');

		// Смещаем центр карты, отодвигаем от списка филиалов
		let pixelCenter = map.getGlobalPixelCenter([lon, lat]);
		let sidebarWidth = document.querySelector('.affiliates')?.clientWidth;
		if(!sidebarWidth) return;
		
		let newPixelCenter = [
			pixelCenter[0] + sidebarWidth / 2,
			pixelCenter[1]
		];

		let geoCenter = map.options.get('projection').fromGlobalPixels(newPixelCenter, map.getZoom());
		map.setCenter(geoCenter);
		

		coordsArray.forEach((coord:any) => {
			let placemark = new ymaps.Placemark([coord[0], coord[1]], {}, {iconColor: 'red'});
			placemark.placemarkText = coord[2];
			map.geoObjects.add(placemark);
			placemark.events.add('click', (e:any) => {
				let pl = placemark;
				let url = `https://maps.yandex.ru?ll=${coord[1]},${coord[0]}&mode=whatshere&whatshere[point]=${coord[1]},${coord[0]}&whatshere[zoom]=17&z=17`
				window.open(url, '_blank');
			});
		})
		map.behaviors.disable('scrollZoom');
	})
}

function flyToAffiliate(coords:Array<number>, zoom:number)
{
	map.setCenter(coords, zoom);

	// Смещаем центр карты, отодвигаем от списка филиалов
	let pixelCenter = map.getGlobalPixelCenter(coords);
	let sidebarWidth = document.querySelector('.affiliates')?.clientWidth;
	if(!sidebarWidth) return;

	let newPixelCenter = [
		pixelCenter[0] + sidebarWidth / 2,
		pixelCenter[1]
	];

	let geoCenter = map.options.get('projection').fromGlobalPixels(newPixelCenter, map.getZoom());
	map.setCenter(geoCenter, zoom);
}

function loadScript(url:string, callback:() => void){

	var script = <any>document.createElement("script")
	script.type = "text/javascript";

	if (script.readyState){  //IE
		script.onreadystatechange = function(){
			if (script.readyState == "loaded" ||
					script.readyState == "complete"){
				script.onreadystatechange = null;
				debugger;
				callback();
			}
		};
	} else {  //Others
		script.onload = function(){
			callback();
		};
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

function openCity(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let el = $(e.currentTarget).next();
	let already =el.hasClass('open');

	$('.contact-city .addresses').slideUp('fast').removeClass('open');
	$('.contact-city .address-info').slideUp('fast').removeClass('open');
	if(!already)
	{
		el.slideDown('fast', () => {
			el.find('.address-wrapper:first-of-type .address-info').slideDown('fast').addClass('open');
			let coordsHost = el.find('.address-wrapper:first-of-type a')[0];
			
			if(coordsHost.dataset['lon'] && coordsHost.dataset['lat']){
				let coords = [
					parseFloat(coordsHost.dataset['lon']),
					parseFloat(coordsHost.dataset['lat'])
				]
				flyToAffiliate(coords, 17);
			}
			
		}).addClass('open');
	}else{
		flyToAffiliate(mapCenter, 10)
	}
}

function openAddress(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let el = <HTMLElement>e.currentTarget;
	let parent = $(el).parents('.contact-city');
	let headerParent = $(el).parents('.address-wrapper');
	let already = headerParent.find('.address-info').hasClass('open');
	$(parent).find('.address-info').slideUp('fast').removeClass('open');
	if(!already)
	{
		let innerParent = $(el).parents('.address-wrapper');
		let addresses = $(innerParent).find('.address-info');
		addresses.slideDown().addClass('open');
	}

	if(el.dataset['lon'] && el.dataset['lat'])
	{
		let coords = [
			parseFloat(el.dataset['lon']),
			parseFloat(el.dataset['lat'])
		]

		flyToAffiliate(coords, 17);
	}
}

function switchAccountType(e:JQuery.ChangeEvent)
{
	let el = e.currentTarget;
	let value = el.value;

	let $modal = $(el).parents('.modal');

	switch(value)
	{
		case "0":
			$modal.find('.law').removeClass('show');
			break;
		case "1":
			$modal.find('.law').addClass('show');
			break;
	}
}

function toggleOrderDetails(e:JQuery.ClickEvent)
{
	// Если произведён клик по ссылки, прерываемся
	if((<HTMLElement>e.target).tagName.toLowerCase() != 'a')
	{
		$(e.currentTarget).next().find('.order-data').slideToggle();
	}
}

function clickOutside(e:JQuery.ClickEvent)
{
	let path = e.originalEvent?.composedPath();
	let filtered:any;
	if(path)
	{
		let filtered = path.filter(el => {
			let element = <HTMLElement>el;
			if(element.classList){
				return element.classList.contains('input-field');
			}
		});
		if(!filtered.length){
			$('.input-field').removeClass('hover');
		}
	}

	filtered = path?.filter(el => {
		let element = <HTMLElement>el;
		if(element.classList){
			return element.tagName.toLowerCase() == 'table';
		}
	})
	if(!filtered.length){
		$('.order-row').removeClass('open');
		$('.order-row td').removeAttr('style');
		$('.order-row .toggle-actions').attr('class', 'bx bx-dots-vertical-rounded bx-sm toggle-actions');
		$('.order-details-row .order-data').slideUp();
	}
}

function selectInterval(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let el = <HTMLLinkElement>e.currentTarget;
	let value = el.getAttribute('data-value');
	if(el.textContent){
		let text:string = el.textContent.toString();
		let parent = $(el).parents('.input-field');
		let input = parent.find('[type=hidden]');
		let valueContainer = parent.find('input');
		valueContainer.val(text);
		input.val(value || "");
		if(text == ""){
			parent.find('.current').addClass('empty');
		}else{
			parent.find('.current').removeClass('empty');
		}
		parent.removeClass('hover');
		e.stopPropagation();
		let elNoNeedRecall = <HTMLElement>document.getElementById("dont-recall-wrapper");
		if(value != 'undefined'){
			elNoNeedRecall.classList.remove('hidden');
		}else{
			elNoNeedRecall.classList.add('hidden');
			let inputNoNeedRecall = <HTMLInputElement>document.getElementById('dont-recall');
			inputNoNeedRecall.removeAttribute('checked');
		}
	}
}

function openIntervalList(e:JQuery.ClickEvent)
{
	let el = e.currentTarget;
	$(el).parents('.input-field').addClass('hover');
}

function toggleActions(e:JQuery.ClickEvent)
{
	e.preventDefault;
	let $row = $(e.target).parents('tr');
	let already = $row.hasClass('open');
	$('.order-row').removeClass('open');
	$('.order-row .toggle-actions').attr('class', 'bx bx-dots-vertical-rounded bx-sm toggle-actions');
	$('.order-row td').removeAttr('style');

	let itemWidth = 41;
	let actionsCount = $row[0].querySelectorAll('.action').length;
	let shiftAmount = actionsCount * itemWidth * -1;

	$row[0].querySelectorAll('td').forEach((el:HTMLElement, i:number) => {
		if(!already){
			el.style.transform = `translateX(${shiftAmount}px)`;
		}else{
			$(el).removeAttr('style');
		}
	})

	let linkClassName = already ? "bx bx-dots-vertical-rounded bx-sm toggle-actions" : "bx bx-x bx-sm toggle-actions"
	e.target.className = linkClassName;

	if(!already){
		$row.addClass('open');
	}
}

function resetFilters(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let form = $(e.currentTarget).parents('form')[0];
	form.reset();
}

function disableContextMenu()
{
	if(window.innerWidth < 600){
		window.oncontextmenu = () => {return false};
	}
}

function scrollHandler()
{
	let header = document.querySelector('.header-wrapper');
	let scrollTop = document.querySelector('html')?.scrollTop;

	if(scrollTop)
	{
		if(scrollTop >= 200)
		{
			header?.classList.add('fixed');
			header?.classList.remove('dark');
			
		}else{
			header?.classList.remove('fixed');
			if(hasDark){
				header?.classList.add('dark');
			}
		}
	}

}

function setInterval(e:JQuery.ChangeEvent)
{
	let el = e.currentTarget;
	let id = el.id;

	if(id === 'manual'){
		$('#delivery-date').addClass('visible');
	}else{
		$('.delivery-details').removeClass('visible');
	}
}

function setAddress(e:JQuery.ChangeEvent)
{
	let el = e.currentTarget;
	let inputs = $('.address-details .input-field');
	let id = el.id;

	if(id == "other"){
		inputs.find('input').removeAttr("disabled");
		inputs.removeClass('disable');
	}else{
		inputs.find('input').attr("disabled", "disabled");
		inputs.addClass('disable');
	}

	$('[name=city]').val(el.dataset['city']);
	$('[name=street]').val(el.dataset['street']);
	$('[name=house]').val(el.dataset['house']);
	$('[name=block]').val(el.dataset['block']);
	$('[name=app]').val(el.dataset['app']);
	$('[name=entrance]').val(el.dataset['entrance']);
	$('[name=floor]').val(el.dataset['floor']);
	$('[name=domofon]').val(el.dataset['domofon']);
}

function loadBig(e:JQuery.ClickEvent)
{
	let thumb = e.currentTarget;
	let img = <HTMLImageElement>thumb.querySelector('img');
	let src = img.src;
	let bigImg = <HTMLImageElement>document.querySelector('#big-image');
	if(bigImg){
		bigImg.src=src;
	}

	document.querySelectorAll('.gallery-thumb').forEach(el => {
		let element = <HTMLElement>el
		element.classList.remove('active');
	})

	e.currentTarget.classList.add('active');
}

function handleArrowClick(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let el = e.currentTarget;
	let direction = el.classList.contains('left') ? -1 : 1;
	let wrapper = document.querySelector('.stories');
	if(wrapper)
	{
		let currentPos = wrapper.scrollLeft;
		let li = document.querySelector('.stories-wrapper li');
		if(li)
		{
			let shift = (li?.getBoundingClientRect().width+10) * 3;
			$('.stories').animate({
				scrollLeft: currentPos + (shift * direction)
			}, 400);
		}
	}
}

function flipSmartBttn(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let $parent = $(this).parents('.smart-bttn');
	let $input = $parent.find('input');
	let inputValue = $input.val();
	if(inputValue){
		let inputStrValue = inputValue.toString();
		let value = parseInt(inputStrValue);
		value++;
		$input.val(value);
		$(this).parents('.smart-bttn').addClass('flip');
	}
}

function minusSmartBttn(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let $parent = $(this).parents('.smart-bttn');
	let $input = $parent.find('input');
	let inputValue = $input.val();
	if(inputValue)
	{
		let inputStrValue = inputValue.toString();
		let value = parseInt(inputStrValue);
		value--;
		if(value == 0){
			$parent.removeClass('flip');
			setTimeout(() => {
				$input.val(value);
			}, 200);
		}else{
			$input.val(value);
		}
	}
}

function plusSmartBttn(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let $parent = $(this).parents('.smart-bttn');
	let $input = $parent.find('input');
	let inputValue = $input.val();
	if(inputValue){
		let value = parseInt(inputValue?.toString());
		value++;
		$input.val(value);
	}
}

function toggleFolder(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let $folderContent = $(this).next();
	let already = $folderContent.attr('style') != "" && $folderContent.attr('style') != undefined && $folderContent.attr('style') != 'display: none;';
	
	$('.folder ul').slideUp('fast');

	if(!already){
		$folderContent.slideDown('fast');
	}
}

function animate()
{

	// return;

	if(stopped){
		stopped = false;
		return;
	}
	
	if(!document.querySelector('.stories-modal')?.classList.contains('open')){
		return;
	}

	rakw = requestAnimationFrame(animate);
	
	// Индекс корневого слайдера
	let root:Swiper = (document.querySelector('#stories-root') as any).swiper;
	let selectedIndex = root.realIndex;
	let rootSlide = document.querySelectorAll('#stories-root .swiper')[selectedIndex];
	
	// Индекс вложенного слайдера
	let selectedSlider:Swiper = (rootSlide as any).swiper;
	let selectedSliderSelection = selectedSlider.realIndex;
	let selectedBullet = rootSlide.querySelector(`.swiper-pagination-bullet-active`);
	let span = selectedBullet?.querySelector('span');

	// Количество слайдов во вложенном слайдере
	let slides = selectedSlider.slides.length;

	if(!pressed)
	{
		startWidth += .2;
	}
	
	if(span)
	{
		span.style.width = startWidth + "%"
	
		if(startWidth >= 100){
	
			if(selectedSliderSelection < (slides - 1)){
				selectedSlider.slideNext();
			}else{
				root.slideNext();
			}
	
			let rootEnd = selectedIndex == root.slides.length - 1;
			let childEnd = selectedSliderSelection == slides - 1;
	
			if(rootEnd && childEnd)
			{
				closeStories();
			}else{
				startWidth = 0
			}
		}
	}
}

function closeStories()
{
	stopped = true;
	let modal = <HTMLDivElement>document.querySelector('.stories-modal');
	modal.classList.remove('open');
	stopped = false;
	startWidth=0;
}

function launchStories(e:JQuery.ClickEvent)
{
	let el = <HTMLLinkElement>e.currentTarget;
	let dataSlide = el.dataset['slide'];
	if(dataSlide)
	{
		let dataSlideNum = dataSlide.toString();
		let slideNum = parseInt(dataSlideNum) - 1;
		let root:Swiper = (document.querySelector('#stories-root') as any).swiper;
		root.slideTo(slideNum, 0);
	
		let subslider = (root.slides[slideNum].querySelector('.swiper') as any).swiper;
		subslider.slideTo(0, 0);
	
		let video = <HTMLVideoElement>subslider.slides[0].querySelector('video');
		if(video)
		{
			video.currentTime=0;
			video.play();
		}
	
		root.el.querySelectorAll('.swiper-pagination-bullet span').forEach(el => {
			let element = <HTMLElement>el;
			element.style.width = '0';
		})
	
		let modal = <HTMLDivElement>document.querySelector('.stories-modal');
		modal.classList.add('open');
		startWidth=0;
		animate();
	}
}

function hideStories(e:JQuery.ClickEvent)
{
	let el = e.target;
	let path = e.originalEvent?.composedPath();
	if(path)
	{
		let stayReasons = path.filter(el => {
			let element = <HTMLElement>el
			if(element.classList){
				return element.classList.contains('swiper');
			}
		});
	
		if(stayReasons.length == 0)
		{
			closeStories();
		}
	}

}

function resizeHandler()
{
	// Отработка Stories
	if(document.querySelectorAll('ul.stories').length){
		let storiesWrapper = document.querySelector('.stories-wrapper');
		let stories = storiesWrapper?.querySelector('ul.stories');
		let storiesLi = stories?.querySelector('li');
		if(storiesLi && stories)
		{
			let containerWidth = stories.getBoundingClientRect().width;
			let entryWidth = storiesLi.getBoundingClientRect().width + 10;
			let entryCount = stories.querySelectorAll('li').length;
			let contentWidth = entryWidth*entryCount;
	
			if(containerWidth < contentWidth)
			{
				storiesWrapper?.querySelectorAll('.arrow').forEach(el => {
					(<HTMLElement>el).classList.add('visible')
				})
			}else{			
				storiesWrapper?.querySelectorAll('.arrow').forEach(el => {
					(<HTMLElement>el).classList.remove('visible')
				})
			}
		}
	}
}

function loadIntervals(date){
    // $('input[name="delivery_date_timestamp"]').val(date.getTime()/1000);
    // $.ajax({
    //     url: $('#delivery-date').data('url'),
    //     type: "POST",
    //     dataType: "JSON",
    //     data: {
    //         delivery_date: date.getTime()/1000
    //     },
    //     success: (res) => {
    //         console.log(res);
    //         $('input[name="delivery_date"]').val(res.formatted_date);
    //         let emptyLi = `<li><a class="waves-effect" data-value="undefined">Любой</a></li>`;
    //         $('#interval-wrapper').empty().append(emptyLi);
    //         for(var key in res.intervals){
    //             let li = `<li><a data-value="${res.intervals[key]}" class="waves-effect">${res.intervals[key]}</a></li>`
    //             $('#interval-wrapper').append(li);
    //         }
    //         $('#delivery-interval').removeClass('hidden');
    //         $('#interval-0').prop('checked', 'checked');
    //     },
    //     error: (err) => {
    //         console.error(err)
    //     }
    // });
}