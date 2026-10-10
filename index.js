const slider2 = document.querySelector(".team");
let isDragStart = false, prevPageX, prevScrollleft;

const dragStart = (e) => {
    isDragStart = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollleft = slider2.scrollLeft;
}

const dragging = (e) => {
    if (!isDragStart) return;
    e.preventDefault();
    let positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    slider2.scrollLeft = prevScrollleft - positionDiff;
}

const dragStop = () => {
    isDragStart = false;
}

slider2.addEventListener("mousedown", dragStart);
slider2.addEventListener("mousemove", dragging);
slider2.addEventListener("mouseup", dragStop);
slider2.addEventListener("touchstart", dragStart);
slider2.addEventListener("touchmove", dragging);
slider2.addEventListener("touchend", dragStop);

const sliders = document.querySelectorAll(".slide-in");
const appearOptions = {
    threshold: 0,
    rootMargin: "0px 0px -150px 0px"
};
const appearOnScroll = new IntersectionObserver(function (
    entries,
    appearOnScroll
) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add("show")
            appearOnScroll.unobserve(entry.target)
        }
    });
},
    appearOptions);

sliders.forEach(slider => {
    appearOnScroll.observe(slider)
});

var menu = document.getElementById("menu");
function openmenu(){
    menu.style.right = "0";
}

function closemenu(){
    menu.style.right = "-300px";
}

navbtn = document.querySelectorAll("header nav ul li")

function btn(){
    menu.style.right = "-300px"
}

const scriptURL = 'https://script.google.com/macros/s/AKfycbzKbs5VdrvqywxxqGAPRspQA3fVpKZ735wccGhKdJgqcTmzQxMVzXUWcieqbrxDQbenVA/exec';
const form = document.forms['submit-to-google-sheet'];
const msg = document.getElementById("msg");
const credentials = document.getElementsByClassName(".input");

form.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            msg.innerHTML = "Thank's for your valuable feedback..."
            setTimeout(function(){
                msg.innerHTML = ""
            },5000)
            form.reset()
        })
        .catch(error => console.error('Error!', error.message))
})


jarallax(document.querySelectorAll('.jarallax'), {
    speed: 0.5,
})