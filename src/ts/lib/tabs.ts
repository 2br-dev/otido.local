interface ITabsOptions{
	headerSelector:string,
	contentSelector:string,
	linkedHeaderSelector?:string
}

class Tabs{

	leftTransition:string = "left .4s cubic-bezier(.76,-0.48,.32,1.44) .07s, right .4s cubic-bezier(.76,-0.48,.32,1.44) .01s";
	rightTransition:string = "left .4s cubic-bezier(.76,-0.48,.32,1.44) .01s, right .4s cubic-bezier(.76,-0.48,.32,1.44) .07s";
	el:HTMLElement;
	tabs:HTMLElement[];
	indicator:HTMLElement;
	tabsContent:HTMLElement;
	linkedHeader:HTMLElement;
	
	constructor(options:ITabsOptions)
	{

		if(!document.querySelectorAll(options.headerSelector).length || !document.querySelectorAll(options.contentSelector).length)
			return;

		this.el = document.querySelector(options.headerSelector);
		this.tabsContent = !options.contentSelector ? <HTMLElement>this.el.nextElementSibling : <HTMLElement>document.querySelector(options.contentSelector);
		this.linkedHeader = document.querySelector(options.linkedHeaderSelector);
		this.tabs = Array.from(this.el.querySelectorAll('.tab'));
		this.indicator = this.el.querySelector('.indicator');
		this.tabs[0].classList.add('active');
		this.tabsContent.querySelector('.tab-content:first-of-type').classList.add('active');
		this.updateIndicator();
		this.tabs.forEach(tabEl => {
			let tab = tabEl;
			tab.querySelector('a').addEventListener('click', this.openTab.bind(this));
		})
		window.addEventListener('resize', this.updateIndicator.bind(this));
	}
	
	updateIndicator()
	{
		this.indicator.style.transition = "none";
		let activeTab = <HTMLElement>this.el.querySelector('.active');
		let left = activeTab.offsetLeft;
		let tabsWidth = this.el.offsetWidth;
		let right = tabsWidth - left - activeTab.offsetWidth;
		
		this.indicator.style.left = left + 'px';
		this.indicator.style.right = right + 'px';
	}
	
	openTab(e:MouseEvent)
	{

		e.preventDefault();

		let target = <HTMLLinkElement>e.currentTarget;
		let parent = <HTMLElement>target.parentNode;
		let active = this.el.querySelector('.active');
		let activeindex = [].indexOf.call(this.el.querySelectorAll('.tab'), active);
		let thisindex = [].indexOf.call(this.el.querySelectorAll('.tab'), parent);
		
		let linkedIndicator:HTMLElement;
		if(this.linkedHeader){
			linkedIndicator = <HTMLElement>this.linkedHeader.querySelector('.indicator');
		}
		
		if(activeindex < thisindex)
		{
			this.indicator.style.transition = this.leftTransition;
			if(linkedIndicator){
				linkedIndicator.style.transition = this.leftTransition;
			}
		}else{
			this.indicator.style.transition = this.rightTransition;
			if(linkedIndicator){
				linkedIndicator.style.transition = this.rightTransition;
			}
		}
		
		//Main tab workout
		let left = target.offsetLeft;
		let tabsWidth = this.el.offsetWidth;
		let right = tabsWidth - target.offsetWidth - target.offsetLeft;
		this.indicator.style.left = left + 'px';
		this.indicator.style.right = right + 'px';
		let href = '#'+target.href.split('#')[1];
		this.tabs.forEach(el => {el.classList.remove('active');});
		parent.classList.add('active');
		
		this.tabsContent.querySelectorAll('.tab-content').forEach(el => {el.classList.remove('active');});
		this.tabsContent.querySelector(href).classList.add('active');
		
		//Linked tab workout
		if(!this.linkedHeader) return;
	
		let linkedTab = this.linkedHeader.querySelectorAll('.tab')[thisindex];
		let linkedLink = linkedTab.querySelector('a');    
		let lleft = linkedLink.offsetLeft;
		let ltabsWidth = this.linkedHeader.offsetWidth;
		let lright = ltabsWidth - linkedLink.offsetWidth - linkedLink.offsetLeft;
		
		if(linkedIndicator)
		{
			linkedIndicator.style.left = lleft + 'px';
			linkedIndicator.style.right = lright + 'px';
		}
		
		this.linkedHeader.querySelectorAll('.tab').forEach(el => {el.classList.remove('active')});
		linkedTab.classList.add('active');
	}
}

export default Tabs;