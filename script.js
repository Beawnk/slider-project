class Slider {
	constructor({slider, wrapper, activeClass}) {
		this.slider = document.querySelector(slider);
		this.wrapper = document.querySelector(wrapper);
		this.activeClass = activeClass || "active";
		this.distance = { finalPosition: 0, startX: 0, movement: 0 };
	}

	onStart(event) {
		let moveType;
		if (event.type === "mousedown") {
			event.preventDefault();
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
		const pointerPosition = event.type === "mousemove" ? event.clientX : event.changedTouches[0].clientX;
		const finalPosition = this.updatePosition(pointerPosition);
		this.moveSlide(finalPosition);
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
		this.slider.style.transform = `translate3d(${distanceX}px, 0, 0)`;
	}

	transition(active) {
		this.slider.style.transition = active ? "transform .3s" : "";
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
		this.slideArray = [...this.slider.children].map((element) => {
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
        this.slideArray.forEach((item) => item.element.classList.remove(this.activeClass));
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
		this.onMove = this.onMove.bind(this);
		this.onStop = this.onStop.bind(this);

        this.activePrevSlide = this.activePrevSlide.bind(this);
        this.activeNextSlide = this.activeNextSlide.bind(this);

        this.onResize = debounce(this.onResize.bind(this), 200);
	}

	init() {
		if (this.slider && this.wrapper) {
			this.bindEvents();
			this.transition(true);
			this.addEvents();
			this.sliderConfig();
			return this;
		}
	}
}

class SlideNav extends Slider {
    constructor({slider, wrapper, activeClass}, { prevImg, nextImg }) {
        super({slider, wrapper, activeClass}, { prevImg, nextImg });
        this.prevImg = prevImg;
        this.nextImg = nextImg;
        this.init();
    }

    createArrow() {
        this.arrowWrapper = document.createElement('div');
        this.arrowPrev = document.createElement('span');
        this.arrowNext = document.createElement('span');
        this.arrowWrapper.className = 'arrow-nav';
        this.arrowPrev.className = 'arrow prev';
        this.arrowNext.className = 'arrow next';
        this.wrapper.appendChild(this.arrowWrapper);
        this.wrapper.children[1].appendChild(this.arrowPrev);
        this.wrapper.children[1].appendChild(this.arrowNext);
        this.arrowPrev.style.backgroundImage = `url(${this.prevImg})`;
        this.arrowNext.style.backgroundImage = `url(${this.nextImg})`;
    }

    addArrow() {
        this.prevElement = document.querySelector('.arrow.prev');
        this.nextElement = document.querySelector('.arrow.next');
        this.addArrowEvents();
    }

    addArrowEvents() {
        this.prevElement.addEventListener('click', this.activePrevSlide);
        this.nextElement.addEventListener('click', this.activeNextSlide);
    }

    disableArrow() {
        if (this.index.prev === undefined) {
            this.prevElement.classList.add('disabled');
            this.prevElement.removeEventListener('click', this.activeNextSlide);
        } else if (this.index.prev !== undefined && this.prevElement.classList.contains('disabled')) {
            this.prevElement.classList.remove('disabled');
            this.addArrowEvents();
        }

        if (this.index.next === undefined) {
            this.nextElement.classList.add('disabled');
            this.nextElement.removeEventListener('click', this.activePrevSlide);
        } else if (this.index.next !== undefined && this.nextElement.classList.contains('disabled')) {
            this.nextElement.classList.remove('disabled');
            this.addArrowEvents();
        }
    }

    changeSlide(index) {
        super.changeSlide(index);
        this.disableArrow();
    }

    init() {
        super.init();
        this.createArrow();
        this.addArrow();
        this.changeSlide(0);
        this.disableArrow();
        return this;
    }
}
  
new SlideNav(
    {
        slider: '.slider-content', 
        wrapper: '.wrapper', 
        activeClass: undefined
    }, 
    {   prevImg: '/images/arrow-prev.png', 
        nextImg: '/images/arrow-next.png'
    });

function debounce(callback, delay) {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callback(...args);
        timer = null;
      }, delay);
    };
  }