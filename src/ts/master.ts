import * as M from 'materialize-css';
import * as $ from 'jquery';
import Lazy from 'vanilla-lazyload';
import Swiper, {Autoplay, EffectCoverflow, EffectFade, Navigation, Pagination} from 'swiper';

let hasDark:boolean = false;

import Typed from 'typed.js';
Swiper.use([Autoplay, Navigation, EffectCoverflow, EffectFade, Pagination]);

let rakw:number = null;
let pressed = false;
let startWidth = 0;
let stopped = false;
let pressedTime=0;
let preventClick=false;

const leftTransition = "left .4s cubic-bezier(.76,-0.48,.32,1.44) .07s, right .4s cubic-bezier(.76,-0.48,.32,1.44) .01s";
const rightTransition = "left .4s cubic-bezier(.76,-0.48,.32,1.44) .01s, right .4s cubic-bezier(.76,-0.48,.32,1.44) .07s";


(() => {

	let current_date = new Date();
	let tommorow = current_date.setDate(current_date.getDate() + 1);
	let modal = M.Modal.init(document.querySelectorAll('.modal'));
	let sidenav = M.Sidenav.init(document.querySelectorAll('.sidenav'));
	let lazy = new Lazy(null, document.querySelectorAll('.lazy'));
	let tooltips = M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
		enterDelay: 200
	});
	let carrySlider = null;
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
	
	let typed = null;
	let header = document.querySelector('.header-wrapper');
	hasDark = header?.classList.contains('dark');
	
	resizeHandler();
	scrollHandler();
	
	document.querySelectorAll('.section-slider').forEach((slider:HTMLElement) => {
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
					let text:string = slider.slides[activeIndex].dataset['text'];
	
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
		let text:string = carrySlider.slides[activeIndex].dataset['text'];
		
		typed = new Typed('.typed', {
			strings: [text],
			backDelay: 2000000000,
			typeSpeed: 20,
			loop: true,
			cursorChar: '_',
			smartBackspace: false,
		});
	}
	
	if($('.partners-slider').length){
	
		let partnersSwiper = new Swiper('.partners-slider', {
			slidesPerView: "auto",
			spaceBetween: 40,
			centeredSlides: true,
			loopedSlides: 6,
			loop: true,
			centerInsufficientSlides: true,
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
					subslider.el.querySelectorAll('.swiper-pagination-bullet span').forEach((el:HTMLSpanElement) => {
						el.style.width='0';
					})
	
					startWidth=0;
				}
			}
		});
		document.querySelectorAll('#stories-root .swiper').forEach((story:HTMLElement) => {
	
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
						storySlide.el.querySelectorAll('.swiper-pagination-bullet span').forEach((el:HTMLElement) => {
							el.style.width = '100%';
						});
	
						// Сбрасываем все после текущего
						storySlide.el.querySelectorAll(`[data-slide="${index}"] ~ .swiper-pagination-bullet span`).forEach((el:HTMLElement) => {
							el.removeAttribute('style');
						});
	
						// Сбрасываем текущий
						storySlide.el.querySelector(`[data-slide="${index}"]  span`).removeAttribute('style');
	
						// Сбрасываем глобальный счётчик
						startWidth = 0;
					},
					navigationPrev: function(storySlide){
						let index = storySlide.realIndex;
	
						// Заполняем все
						storySlide.el.querySelectorAll('.swiper-pagination-bullet span').forEach((el:HTMLElement) => {
							el.style.width = '100%';
						});
	
						// Сбрасываем все после текущего
						storySlide.el.querySelectorAll(`[data-slide="${index}"] ~ .swiper-pagination-bullet span`).forEach((el:HTMLElement) => {
							el.removeAttribute('style');
						});
	
						// Сбрасываем текущий
						storySlide.el.querySelector(`[data-slide="${index}"]  span`).removeAttribute('style');
	
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
	
	$(window).on('resize', resizeHandler);
	$('html, body').on('scroll', scrollHandler);
	$('body').on('click', '.folder > a', toggleFolder);
	$('body').on('click', '.bttn-cart', flipSmartBttn);
	$('body').on('click', '.cart-bttn-small.bx-minus', minusSmartBttn);
	$('body').on('click', '.cart-bttn-small.bx-plus', plusSmartBttn);
	$('body').on('click', '.gallery-thumb', loadBig);
	$('body').on('click', '.story-trigger', launchStories);
	$('body').on('click', '.stories-modal', hideStories);
	$('body').on('click', '.stories-modal .closer', hideStories);
	$('body').on('click', '.stories-wrapper .arrow', handleArrowClick);
	$('body').on('click', '.tab', tabClick);
	$('body').on('click', 'form .reset', resetFilters);
	$('body').on('change', '[name=address]', setAddress);
	$('body').on('change', '[name=delivery-day]', setInterval);
	$('body').on('click', '.toggle-actions', toggleActions);
	$('body').on('touchstart', disableContextMenu);
	$('body').on('click', '#interval', openIntervalList);
	$('body').on('click', '.input-field li a', selectInterval);
	$('body').on('click', clickOutside);
	$('body').on('click', '.order-row', toggleOrderDetails);

	if($('[name=address]').length){
		let el = <HTMLElement>document.querySelector('[name=address]');
		$('[name=city]').val(el.dataset['city']);
		$('[name=street]').val(el.dataset['street']);
		$('[name=house]').val(el.dataset['house']);
		$('[name=block]').val(el.dataset['block']);
		$('[name=app]').val(el.dataset['app']);
		$('[name=entrance]').val(el.dataset['entrance']);
		$('[name=floor]').val(el.dataset['floor']);
		$('[name=domofon]').val(el.dataset['domofon']);
	}

})()

function toggleOrderDetails(e:JQuery.ClickEvent)
{
	// Если произведён клик по ссылки, прерываемся
	if((<HTMLElement>e.target).tagName.toLowerCase() != 'a')
	{
		$(e.currentTarget).next().find('.items').slideToggle();
	}
}

function clickOutside(e:JQuery.ClickEvent)
{
	let path = e.originalEvent?.composedPath();
	let filtered = path.filter(el => {
		let element = <HTMLElement>el;
		if(element.classList){
			return element.classList.contains('input-field');
		}
	});
	if(!filtered.length){
		$('.input-field').removeClass('hover');
	}

	filtered = path?.filter((el:HTMLElement) => {
		if(el.classList){
			return el.tagName.toLowerCase() == 'table';
		}
	})
	if(!filtered.length){
		$('.order-row').removeClass('open');
		$('.order-details-row .items').slideUp();
	}
}

function selectInterval(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let el = <HTMLLinkElement>e.currentTarget;
	let value = el.getAttribute('data-value');
	let text = el.textContent;
	let parent = $(el).parents('.input-field');
	let input = parent.find('[type=hidden]');
	let valueContainer = parent.find('input');
	valueContainer.val(text);
	input.val(value);
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
	let scrollTop = document.querySelector('html').scrollTop;

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

	document.querySelectorAll('.gallery-thumb').forEach((el:HTMLLinkElement) => {
		el.classList.remove('active');
	})

	e.currentTarget.classList.add('active');
}

function handleArrowClick(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let el = e.currentTarget;
	let direction = el.classList.contains('left') ? -1 : 1;
	let wrapper = document.querySelector('.stories');
	let currentPos = wrapper?.scrollLeft;
	let shift = (document.querySelector('.stories-wrapper li')?.getBoundingClientRect().width+10) * 3;

	$('.stories').animate({
		scrollLeft: currentPos + (shift * direction)
	}, 400);
}

function flipSmartBttn(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let $parent = $(this).parents('.smart-bttn');
	let $input = $parent.find('input');
	let value = parseInt($input.val()?.toString());
	value++;
	$input.val(value);
	$(this).parents('.smart-bttn').addClass('flip');
}

function minusSmartBttn(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let $parent = $(this).parents('.smart-bttn');
	let $input = $parent.find('input');
	let value = parseInt($input.val()?.toString());
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

function plusSmartBttn(e:JQuery.ClickEvent)
{
	e.preventDefault();
	let $parent = $(this).parents('.smart-bttn');
	let $input = $parent.find('input');
	let value = parseInt($input.val()?.toString());
	value++;
	$input.val(value);
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
	let span = selectedBullet.querySelector('span');

	// Количество слайдов во вложенном слайдере
	let slides = selectedSlider.slides.length;

	if(!pressed)
	{
		startWidth += .2;
	}
	

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
	let slideNum = parseInt(el.dataset['slide']) - 1;
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

	root.el.querySelectorAll('.swiper-pagination-bullet span').forEach((el:HTMLSpanElement) => {
		el.style.width = '0';
	})

	let modal = <HTMLDivElement>document.querySelector('.stories-modal');
	modal.classList.add('open');
	startWidth=0;
	animate();
}

function hideStories(e:JQuery.ClickEvent)
{
	let el = e.target;
	let path = e.originalEvent?.composedPath();

	let stayReasons = path?.filter((el:HTMLElement) => {
		if(el.classList){
			return el.classList.contains('swiper');
		}
	});

	if(stayReasons.length == 0)
	{
		closeStories();
	}

}

function resizeHandler()
{
	// Отработка Stories
	if(document.querySelectorAll('ul.stories').length){
		let storiesWrapper = document.querySelector('.stories-wrapper');
		let stories = storiesWrapper.querySelector('ul.stories');
		let containerWidth = stories?.getBoundingClientRect().width;
		let entryWidth = stories.querySelector('li').getBoundingClientRect().width + 10;
		let entryCount = stories?.querySelectorAll('li').length;
		let contentWidth = entryWidth*entryCount;

		console.log({
			contentWidth, containerWidth
		})

		if(containerWidth < contentWidth)
		{
			storiesWrapper?.querySelectorAll('.arrow').forEach((el:HTMLLIElement) => {
				el.classList.add('visible')
			})
		}else{			
			storiesWrapper?.querySelectorAll('.arrow').forEach((el:HTMLLIElement) => {
				el.classList.remove('visible')
			})
		}
	}

	updateIndicator();
}

function updateIndicator()
{
  let indicator = <HTMLElement>document.querySelector('.indicator');

  if(indicator){	
	let activeTab = <HTMLElement>document.querySelector('.tab.active');
	let left = activeTab.offsetLeft;
	let tabsWidth = (<HTMLElement>document.querySelector('.tabs')).offsetWidth;
	let right = tabsWidth - left - activeTab.offsetWidth;
	
	indicator.style.transition = "none";
	indicator.style.left = left + 'px';
	indicator.style.right = right + 'px';
  }
}

function tabClick(e:JQuery.ClickEvent)
{

	e.preventDefault();
  let indicator = <HTMLElement>document.querySelector('.indicator');
  let parent = this.parentNode;
  let active = document.querySelector('.active');
  let activeindex = [].indexOf.call(document.querySelectorAll('.tab'), active);
  let thisindex = [].indexOf.call(document.querySelectorAll('.tab'), parent);
  
  if(activeindex < thisindex)
  {
    indicator.style.transition = leftTransition;
  }else{
    indicator.style.transition = rightTransition;
  }
  
  let left = this.offsetLeft;
  let tabsWidth = (<HTMLElement>document.querySelector('.tabs')).offsetWidth;
  let right = tabsWidth - this.offsetWidth - this.offsetLeft;
  
  indicator.style.left = left + 'px';
  indicator.style.right = right + 'px';
  let href = '#'+this.href.split('#')[1];
  document.querySelectorAll('.tab-content').forEach(el => {el.classList.remove('active');});
  document.querySelectorAll('.tab').forEach(el => {el.classList.remove('active');});
  parent.classList.add('active');
  document.querySelector(href).classList.add('active');
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