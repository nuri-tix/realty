/* ----- burger menu ---- */

const burger = document.querySelector('.nav-icon')
const menu = document.querySelector('.nav');
const body = document.body;

if (burger && menu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('_active');
    menu.classList.toggle('_active');
    body.classList.toggle('_lock');
  })
}