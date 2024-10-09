class Slider {
    constructor(slider, wrapper) {
      this.slider = document.querySelector(slider);
      this.wrapper = document.querySelector(wrapper);
      this.distance = { finalPosition: 0, startX: 0, movement: 0 }
    }

    onStart(event) {
      let moveType;
      if (event.type === 'mousedown') {
        event.preventDefault();
        this.distance.startX = event.clientX;
        moveType = 'mousemove';
      } else {
        this.distance.startX = event.changedTouches[0].clientX;
        moveType = 'touchmove';
      }
      this.wrapper.addEventListener(moveType, this.onMove);
      this.transition(false);
      console.log(1);
    }

    updatePosition(clientX) {
      this.distance.movement = (this.distance.startX - clientX) * 1.6;
      return this.distance.finalPosition - this.distance.movement;
      console.log(2);
    }

    onMove(event) {
      const pointerPosition = event.type === 'mousemove' ? event.clientX : event.changedTouches[0].clientX;
      const finalPosition = this.updatePosition(pointerPosition);
      this.moveSlide(finalPosition);
      console.log(3);
    }

    onStop(event) {
       const moveType = event.type === 'mouseup' ? 'mousemove' : 'touchmove'
       this.wrapper.removeEventListener(moveType, this.onMove);
       this.distance.finalPosition = this.distance.movePosition;
       this.transition(true);
       this.changeSlideOnStop();
       console.log(4);
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
      console.log(5);
    }

    transition(active) {
        this.slider.style.transition = active ? 'transform .3s' : '';
    }

    addEvents() {
      this.wrapper.addEventListener('mousedown', this.onStart);
      this.wrapper.addEventListener('touchstart', this.onStart);
      this.wrapper.addEventListener('mouseup', this.onStop);
      this.wrapper.addEventListener('touchend', this.onStop);
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
      }
    }

    changeSlide(index) {
      const activeSlide = this.slideArray[index];
      this.moveSlide(activeSlide.position);
      this.slideIndexNav(index);
      this.distance.finalPosition = activeSlide.position;
    }

    activePrevSlide() {
        if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
    }

    activeNextSlide() {
        if (this.index.next !== undefined) this.changeSlide(this.index.next);
    }

    bindEvents() {
      this.onStart = this.onStart.bind(this);
      this.onMove = this.onMove.bind(this);
      this.onStop = this.onStop.bind(this);
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
  
const newSlider = new Slider('.slider-content', '.wrapper');
newSlider.init().slideIndexNav(3);