class Slider {
	constructor({ slider, sliderContent, wrapper, activeClass }) {
        this.slider = document.querySelector(slider);
		this.sliderContent = document.querySelector(sliderContent);
		this.wrapper = document.querySelector(wrapper);
		this.activeClass = activeClass || "active";
		this.distance = { finalPosition: 0, startX: 0, movement: 0 };
        this.rafId = null; // Added to handle requestAnimationFrame id  
		this.index = { active: 0, prev: undefined, next: undefined };  
		this.slideArray = [];  
		this.addEvents();  
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
        // Store the current event and use requestAnimationFrame to handle it  
        const pointerPosition = event.type === "mousemove"  
            ? event.clientX  
            : event.changedTouches[0].clientX;  
    
        if (!this.rafId) { // Check if there’s no pending animation frame  
            this.rafId = requestAnimationFrame(() => {  
                const finalPosition = this.updatePosition(pointerPosition);  
                this.moveSlide(finalPosition);  
                this.rafId = null; // Reset the rafId  
            });  
        }  
    } 

	onStop(event) {  
        const moveType = event.type === "mouseup" ? "mousemove" : "touchmove";  
        this.wrapper.removeEventListener(moveType, this.onMove);

        this.distance.finalPosition = this.distance.movePosition;  
        this.transition(true);  
        this.changeSlideOnStop();  
    }

	changeSlideOnStop() {
		if (this.distance.movement > 120 && this.index.next !== undefined) {
			this.activeNextSlide();
		} else if (this.distance.movement < -120 && this.index.prev !== undefined) {
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
		const slides = this.sliderContent.children;  
		this.slideArray = [...slides].map((element) => {  
			const position = this.slidePosition(element);  
			return { position, element };  
		});
	}

	slideIndexNav(index) {
		const lastPosition = this.slideArray.length - 1;
		this.index = {
			prev: index ? index - 1 : undefined,
			active: index,
			next: index === lastPosition ? undefined : index + 1,
		};
	}

	changeSlide(index) {
		const activeSlide = this.slideArray[index];
		this.moveSlide(activeSlide.position);
		this.slideIndexNav(index);
		this.distance.finalPosition = activeSlide.position;
		this.changeActiveClass();
	}

	activePrevSlide() {
		if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
	}

	activeNextSlide() {
		if (this.index.next !== undefined) this.changeSlide(this.index.next);
	}

	changeActiveClass() {
		for (let slide of this.slideArray) {  
			slide.element.classList.remove(this.activeClass);  
		}  
		this.slideArray[this.index.active].element.classList.add(this.activeClass); 
	}

	onResize() {
		setTimeout(() => {
			this.sliderConfig();
			this.changeSlide(this.index.active);
		}, 500);
	}

	bindEvents() {
		this.onStart = this.onStart.bind(this);
		this.onMove = throttle(this.onMove.bind(this), 100);
		this.onStop = this.onStop.bind(this);

		this.activePrevSlide = this.activePrevSlide.bind(this);
		this.activeNextSlide = this.activeNextSlide.bind(this);

		this.onResize = debounce(this.onResize.bind(this), 200);
	}

	init() {
		if (this.sliderContent && this.wrapper) {
			this.bindEvents();
			this.transition(true);
			this.addEvents();
			this.sliderConfig();
		}
		return this;
	}
}

class SlideNav extends Slider {
	constructor(
		{ slider, sliderContent, wrapper, activeClass },
		{ arrows, prevImg, nextImg, controls, customControls }
	) {
		super(
			{ slider, sliderContent, wrapper, activeClass },
			{ prevImg, nextImg, controls, customControls }
		);
        this.arrows = arrows;
		this.prevImg = prevImg;
		this.nextImg = nextImg;
		this.controls = controls;
        if (customControls !== undefined) {
            this.customControls = customControls;
        } else {
            this.customControls = '.control';
        }
		
		this.init();
	}

	createArrow() {
        console.log(1);
		this.arrowWrapper = document.createElement("div");
		this.arrowPrev = document.createElement("span");
		this.arrowNext = document.createElement("span");

		this.arrowWrapper.className = "arrow-nav";
		this.arrowPrev.className = "arrow prev";
		this.arrowNext.className = "arrow next";

		this.slider.appendChild(this.arrowWrapper);
		this.slider.children[1].appendChild(this.arrowPrev);
		this.slider.children[1].appendChild(this.arrowNext);

        if (this.prevImg && this.nextImg) {
            this.arrowPrev.style.backgroundImage = `url(${this.prevImg})`;
		    this.arrowNext.style.backgroundImage = `url(${this.nextImg})`;
        } else {
            this.arrowPrev.innerHTML = "🢐";
            this.arrowNext.innerHTML = "🢒";
        }
		
	}

	addArrow() {
        console.log(2);
		this.prevElement = document.querySelector(".arrow.prev");
		this.nextElement = document.querySelector(".arrow.next");
		this.addArrowEvents();
	}

	addArrowEvents() {
        console.log(3);
        const events = ['click', 'touchstart'];
        events.forEach(event => {
            this.prevElement.addEventListener(event, this.activePrevSlide);
            this.nextElement.addEventListener(event, this.activeNextSlide);
        });
	}

	disableArrows() {
        console.log(4);
		if (this.index.prev === undefined) {
			this.prevElement.classList.add("disabled");
			this.prevElement.removeEventListener("click", this.activeNextSlide);
		} else if (
			this.index.prev !== undefined &&
			this.prevElement.classList.contains("disabled")
		) {
			this.prevElement.classList.remove("disabled");
			this.addArrowEvents();
		}

		if (this.index.next === undefined) {
			this.nextElement.classList.add("disabled");
			this.nextElement.removeEventListener("click", this.activePrevSlide);
		} else if (
			this.index.next !== undefined &&
			this.nextElement.classList.contains("disabled")
		) {
			this.nextElement.classList.remove("disabled");
			this.addArrowEvents();
		}
	}

	createControls() {
        console.log(5);
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
        console.log(6);
        this.slideArray.forEach(() => {
			this.controlsArray.forEach((control, i) => {
                control.addEventListener("click", () => this.changeSlide(i));
            });
		});
    }

	addControls() {
        console.log(7);
		this.controlsNode = document.querySelectorAll(
			`${this.customControls}`
		);
		this.controlsArray = [...this.controlsNode];
	}

	activeControl() {
        console.log(8);
		this.controlsArray.forEach((item) =>
			item.classList.remove(this.activeClass)
		);
		this.controlsArray[this.index.active].classList.add(this.activeClass);
	}

	arrowKeyListener() {
        console.log(9);
		document.addEventListener("keydown", (event) => {
			if (event.key === "ArrowRight") {
				this.activeNextSlide();
			} else if (event.key === "ArrowLeft") {
				this.activePrevSlide();
			}
		});
	}

	changeSlide(index) {
        console.log(10);
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
            this.disableArrows();
            this.arrowKeyListener();
        }
		return this;
	}
}

// skipcq: JS-R1002
new SlideNav(
	{   
        slider: ".slider",
		sliderContent: ".slider-content",
		wrapper: ".slider-wrapper",
		activeClass: undefined,
	},
	{
        arrows: true,
        prevImg: 'images/arrow-prev.png',
        nextImg: 'images/arrow-next.png',
		controls: true,
		customControls: ".custom-control",
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

function throttle(callback, limit) {  
    let lastCall = 0;  
    return function(...args) {  
        const now = Date.now();  
        if (now - lastCall >= limit) {  
            lastCall = now;  
            callback(...args);  
        }  
    };  
}  