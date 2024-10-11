class Slider {
	constructor({ sliderContent, wrapper, activeClass, loop }) {
		this.sliderContent = document.querySelector(sliderContent);
		this.wrapper = document.querySelector(wrapper);
		this.activeClass = activeClass || "active";
		this.loop = loop === true ? loop : false;
		this.distance = { finalPosition: 0, startX: 0, movement: 0 };
	}

	onStart(event) {
		event.preventDefault();
		// skipcq: JS-0119
		let moveType;
		if (event.type === "mousedown") {
			this.distance.startX = event.clientX;
			moveType = "mousemove";
		} else {
			this.distance.startX = event.changedTouches[0].clientX;
			moveType = "touchmove";
		}
		this.wrapper.addEventListener(moveType, this.onMove);
		this.transition(false);
	}

	updatePosition(clientX) {
		this.distance.movement = (this.distance.startX - clientX) * 1.6;
		return this.distance.finalPosition - this.distance.movement;
	}

	onMove(event) {
		const pointerPosition =
			event.type === "mousemove"
				? event.clientX
				: event.changedTouches[0].clientX;
		const finalPosition = this.updatePosition(pointerPosition);
		this.moveSlide(finalPosition);
	}

	onStop(event) {  
        const moveType = event.type === "mouseup" ? "mousemove" : "touchmove";  
        this.wrapper.removeEventListener(moveType, this.onMove);  
      
        this.distance.finalPosition = this.distance.movePosition;  
        this.changeSlideOnStop();  
        this.distance.movement = 0;
    } 

	changeSlideOnStop() {
		if (this.distance.movement > 120 && this.index.next !== undefined) {
			this.index.active === this.totalSlides - 1 ? this.transition(false) : this.transition(true);
			this.activeNextSlide();
		} else if (this.distance.movement < -120 && this.index.prev !== undefined) {
			this.index.active === 0 ? this.transition(false) : this.transition(true);
			this.activePrevSlide();
		} else {
			this.changeSlide(this.index.active);
		}
	}

	moveSlide(distanceX) {
		this.distance.movePosition = distanceX;
		this.sliderContent.style.transform = `translate3d(${distanceX}px, 0, 0)`;
	}

	transition(active) {
		this.sliderContent.style.transition = active ? "transform .3s" : "";
	}

	addEvents() {
		window.addEventListener("resize", this.onResize);
		this.wrapper.addEventListener("mousedown", this.onStart);
		this.wrapper.addEventListener("touchstart", this.onStart);
		this.wrapper.addEventListener("mouseup", this.onStop);
		this.wrapper.addEventListener("touchend", this.onStop);
	}

	slidePosition(slide) {
		const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
		return -(slide.offsetLeft - margin);
	}

	sliderConfig() {
		this.slideArray = [...this.sliderContent.children].map((element) => {
			const position = this.slidePosition(element);
			return { position, element };
		});
		this.totalSlides = this.loop ? this.slideArray.length - 2 : this.slideArray.length;
	}

	slideIndexNav(index) {
		if (this.loop) {
			const totalSlides = this.loop ? this.slideArray.length - 2 : this.slideArray.length; // Exclude duplicates  
			this.index = {  
				prev: (index - 1 + totalSlides) % totalSlides,  
				active: index % totalSlides,  
				next: (index + 1) % totalSlides,  
			}; 
		} else {
			const lastPosition = this.slideArray.length - 1;
			this.index = {
				prev: index ? index - 1 : undefined,
				active: index,
				next: index === lastPosition ? undefined : index + 1,
			};
		}
	}

	changeSlide(index) {
		const activeSlide = this.loop ? this.slideArray[index + 1] : this.slideArray[index];
		this.moveSlide(activeSlide.position);
		this.slideIndexNav(index);
		this.distance.finalPosition = activeSlide.position;
		this.changeActiveClass();
	}

	activePrevSlide() {
		this.newIndex = this.index.prev === -1 ? this.totalSlides - 1 : this.index.prev; // Loop to last if at start  
		this.changeSlide(this.newIndex);
	}

	activeNextSlide() {
		this.newIndex = this.index.next === this.totalSlides ? 0 : this.index.next; // Loop to first if at end  
		this.changeSlide(this.newIndex);
	}

	createDuplicatedSlides() {  
		if (this.loop) { 
			const firstSlide = this.sliderContent.children[0].cloneNode(true);  
			const lastSlide = this.sliderContent.children[this.sliderContent.children.length - 1].cloneNode(true);  
			this.sliderContent.appendChild(firstSlide);  
			this.sliderContent.insertBefore(lastSlide, this.sliderContent.children[0]); 
			this.sliderConfig();
		}  
	} 

	changeActiveClass() {
		this.slideArray.forEach((item) =>
			item.element.classList.remove(this.activeClass)
		);
		this.loop 
		? this.slideArray[this.index.active + 1].element.classList.add(this.activeClass) 
		: this.slideArray[this.index.active].element.classList.add(this.activeClass);
	}

	onResize() {
		setTimeout(() => {
			this.sliderConfig();
			this.changeSlide(this.index.active);
		}, 500);
	}

	bindEvents() {
		this.onStart = this.onStart.bind(this);
		this.onMove = this.onMove.bind(this);
		this.onStop = this.onStop.bind(this);

		this.activePrevSlide = this.activePrevSlide.bind(this);
		this.activeNextSlide = this.activeNextSlide.bind(this);

		this.onResize = debounce(this.onResize.bind(this), 200);
	}

	init() {
		if (this.sliderContent && this.wrapper) {
			this.bindEvents();
			this.addEvents();
			this.sliderConfig();
			this.createDuplicatedSlides();
		}
		return this;
	}
}

class SlideNav extends Slider {
	constructor(
		{ sliderContent, wrapper, activeClass, loop },
		{ arrows, prevImg, nextImg, controls, customControls }
	) {
		super(
			{ sliderContent, wrapper, activeClass, loop }
		);
        this.arrows = arrows === true ? arrows : false;
		this.prevImg = prevImg;
		this.nextImg = nextImg;
		this.controls = controls === true ? controls : false;
		this.customControls = customControls !== undefined ? customControls : '.control';
		
		this.init();
	}

	createArrow() {
		this.arrowWrapper = document.createElement("div");
		this.arrowPrev = document.createElement("span");
		this.arrowNext = document.createElement("span");

		this.arrowWrapper.className = "arrow-nav";
		this.arrowPrev.className = "arrow prev";
		this.arrowNext.className = "arrow next";

		this.wrapper.children[0].appendChild(this.arrowWrapper);
		this.arrowWrapper.appendChild(this.arrowPrev);
		this.arrowWrapper.appendChild(this.arrowNext);

        if (this.prevImg && this.nextImg) {
            this.arrowPrev.style.backgroundImage = `url(${this.prevImg})`;
		    this.arrowNext.style.backgroundImage = `url(${this.nextImg})`;
        } else {
            this.arrowPrev.innerHTML = "🢐";
            this.arrowNext.innerHTML = "🢒";
        }
	}

	addArrow() {
		this.prevElement = document.querySelector(".arrow.prev");
		this.nextElement = document.querySelector(".arrow.next");
		this.addArrowEvents();
	}

	addArrowEvents() {
        const events = ['click', 'touchstart'];  
        events.forEach(event => {
            this.prevElement.addEventListener(event, this.activePrevSlide);  
            this.nextElement.addEventListener(event, this.activeNextSlide);  
        }); 
	}

	disableArrows() {  
        if (this.index.prev === undefined) {  
            this.prevElement.classList.add("disabled");  
            this.prevElement.removeEventListener("click", this.activePrevSlide);  
        } else if (this.index.prev !== undefined && this.prevElement.classList.contains("disabled")) {  
            this.prevElement.classList.remove("disabled");  
            this.addArrowEvents();
        }  
    
        if (this.index.next === undefined) {  
            this.nextElement.classList.add("disabled");  
            this.nextElement.removeEventListener("click", this.activeNextSlide);  
        } else if (this.index.next !== undefined && this.nextElement.classList.contains("disabled")) {  
            this.nextElement.classList.remove("disabled");  
            this.addArrowEvents();  
        }  
    }

	createControls() {
		const controls = document.createElement("ul");
		controls.className = "controls";
		this.wrapper.appendChild(controls);
		this.slideArray.forEach((item, index) => {
			const control = document.createElement("li");
			control.className = "control";
			control.addEventListener("click", () => this.changeSlide(index));
			controls.appendChild(control);
		});
		this.addControls();
	}

    addCustomControls() {
        this.slideArray.forEach(() => {
			this.controlsArray.forEach((control, i) => {
                control.addEventListener("click", () => this.changeSlide(i));
            });
		});
    }

	addControls() {
		this.controlsNode = document.querySelectorAll(
			`${this.customControls}`
		);
		this.controlsArray = [...this.controlsNode];
	}

	activeControl() {
		this.controlsArray.forEach((item) =>
			item.classList.remove(this.activeClass)
		);
		this.controlsArray[this.index.active].classList.add(this.activeClass);
	}

	arrowKeyListener() {
		document.addEventListener("keydown", (event) => {
			if (event.key === "ArrowRight") {
				this.activeNextSlide();
			} else if (event.key === "ArrowLeft") {
				this.activePrevSlide();
			}
		});
	}

	changeSlide(index) {
		super.changeSlide(index);
		if (this.arrows === true) {
            this.disableArrows();
        }
        if (this.controls === true) {
            this.activeControl();
        }
	}

	init() {
		super.init();
        if (this.sliderContent && this.wrapper) {
            if (this.arrows === true) {
                this.createArrow();
                this.addArrow();
            }
            if (this.controls === true) {
                if (this.customControls === '.control') {
                    this.createControls();
                } else {
                    this.addControls();
                    this.addCustomControls();
                }
            }
            this.changeSlide(0);
            if (this.arrows === true) {
                this.disableArrows();
            }
            this.arrowKeyListener();
        }
		return this;
	}
}

// skipcq: JS-R1002
new SlideNav(
	{   
		sliderContent: ".slider-content",
		wrapper: ".slider-wrapper",
		activeClass: undefined,
		loop: true
	},
	{
        arrows: true,
		prevImg: "/images/arrow-prev.png",
		nextImg: "/images/arrow-next.png",
		controls: true,
		customControls: '.custom-control'
	}
);

function debounce(callback, delay) {
	// skipcq: JS-0119
	let timer;
	return (...args) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			callback(...args);
			timer = null;
		}, delay);
	};
}
