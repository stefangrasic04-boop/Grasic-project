const body = document.body;
const gate = document.querySelector('#gate');
const store = document.querySelector('#store');
const enterButton = document.querySelector('#enter-button');
const leaveButton = document.querySelector('#leave-button');
const leaveScreen = document.querySelector('#leave-screen');
const returnButton = document.querySelector('#return-button');
const gateShirt = document.querySelector('#gate-shirt');
const productShirt = document.querySelector('#product-shirt');
const productStage = document.querySelector('#product-stage');
const viewToggle = document.querySelector('#view-toggle');

let hasEntered = sessionStorage.getItem('ugly-entered') === 'true';

function enterStore() {
  sessionStorage.setItem('ugly-entered', 'true');
  hasEntered = true;
  gate.classList.add('is-gone');
  store.classList.add('is-active');
  store.setAttribute('aria-hidden', 'false');
  body.classList.remove('locked');
  setTimeout(() => document.querySelector('#product')?.scrollIntoView({ block: 'start' }), 320);
}

function showGate() {
  sessionStorage.removeItem('ugly-entered');
  hasEntered = false;
  gate.classList.remove('is-gone');
  store.classList.remove('is-active');
  store.setAttribute('aria-hidden', 'true');
  body.classList.add('locked');
}

if (hasEntered) {
  gate.classList.add('is-gone');
  store.classList.add('is-active');
  store.setAttribute('aria-hidden', 'false');
  body.classList.remove('locked');
}

enterButton.addEventListener('click', enterStore);
leaveButton.addEventListener('click', () => {
  gate.classList.add('is-gone');
  leaveScreen.classList.add('is-active');
  leaveScreen.setAttribute('aria-hidden', 'false');
});
returnButton.addEventListener('click', () => {
  leaveScreen.classList.remove('is-active');
  leaveScreen.setAttribute('aria-hidden', 'true');
  gate.classList.remove('is-gone');
});

// The first shirt politely refuses to be inspected.
window.addEventListener('pointermove', (event) => {
  if (hasEntered || window.matchMedia('(pointer: coarse)').matches) return;
  const rect = gateShirt.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const distance = Math.hypot(dx, dy);
  if (distance < 330) {
    const force = (330 - distance) / 330;
    const safeDistance = Math.max(distance, 1);
    const x = -(dx / safeDistance) * force * 62;
    const y = -(dy / safeDistance) * force * 38;
    gateShirt.style.translate = `${x}px ${y}px`;
    gateShirt.style.rotate = `${-x * .04}deg`;
  } else {
    gateShirt.style.translate = '0 0';
    gateShirt.style.rotate = '0deg';
  }
});

// Product rotation and fabric inspection.
let rotationX = -3;
let rotationY = -8;
let scale = 1;
let dragging = false;
let startX = 0;
let startY = 0;
let startRotationX = 0;
let startRotationY = 0;

function updateProductTransform(animate = false) {
  productShirt.style.transition = animate ? 'transform .7s cubic-bezier(.2,.72,.18,1)' : 'none';
  productShirt.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scale})`;
  const normalized = ((rotationY % 360) + 360) % 360;
  const showingBack = normalized > 90 && normalized < 270;
  viewToggle.innerHTML = `${showingBack ? 'VIEW FRONT' : 'VIEW BACK'} <span>↻</span>`;
}

productStage.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) return;
  dragging = true;
  startX = event.clientX;
  startY = event.clientY;
  startRotationX = rotationX;
  startRotationY = rotationY;
  productStage.setPointerCapture(event.pointerId);
});
productStage.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  rotationY = startRotationY + (event.clientX - startX) * .55;
  rotationX = Math.max(-18, Math.min(18, startRotationX - (event.clientY - startY) * .12));
  updateProductTransform(false);
});
productStage.addEventListener('pointerup', () => {
  dragging = false;
  productShirt.style.transition = 'transform .4s cubic-bezier(.2,.72,.18,1)';
});
productStage.addEventListener('pointercancel', () => { dragging = false; });
productStage.addEventListener('wheel', (event) => {
  event.preventDefault();
  scale = Math.max(.82, Math.min(1.7, scale - event.deltaY * .0008));
  updateProductTransform(true);
}, { passive: false });
viewToggle.addEventListener('click', () => {
  const normalized = ((rotationY % 360) + 360) % 360;
  rotationY += normalized > 90 && normalized < 270 ? 180 : 180;
  updateProductTransform(true);
});
productStage.addEventListener('dblclick', () => {
  rotationY += 180;
  updateProductTransform(true);
});

// Bag and concept checkout.
const cart = document.querySelector('#cart');
const cartBackdrop = document.querySelector('#cart-backdrop');
const bagButton = document.querySelector('#bag-button');
const bagCount = document.querySelector('#bag-count');
const addButton = document.querySelector('#add-button');
const closingBuy = document.querySelector('#closing-buy');
const cartClose = document.querySelector('#cart-close');
const removeButton = document.querySelector('#remove-button');
const checkoutButton = document.querySelector('#checkout-button');
const checkout = document.querySelector('#checkout');
const checkoutClose = document.querySelector('#checkout-close');
const checkoutForm = document.querySelector('#checkout-form');
const success = document.querySelector('#success');
const successClose = document.querySelector('#success-close');
let inCart = false;

function openCart() {
  cart.classList.toggle('is-empty', !inCart);
  cart.classList.add('is-open');
  cart.setAttribute('aria-hidden', 'false');
  bagButton.setAttribute('aria-expanded', 'true');
  cartBackdrop.hidden = false;
  body.classList.add('locked');
}
function closeCart() {
  cart.classList.remove('is-open');
  cart.setAttribute('aria-hidden', 'true');
  bagButton.setAttribute('aria-expanded', 'false');
  cartBackdrop.hidden = true;
  if (!checkout.classList.contains('is-active')) body.classList.remove('locked');
}
function addToCart() {
  inCart = true;
  bagCount.textContent = '1';
  openCart();
}
addButton.addEventListener('click', addToCart);
closingBuy.addEventListener('click', addToCart);
bagButton.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);
removeButton.addEventListener('click', () => {
  inCart = false;
  bagCount.textContent = '0';
  cart.classList.add('is-empty');
});
checkoutButton.addEventListener('click', () => {
  closeCart();
  checkout.classList.add('is-active');
  checkout.setAttribute('aria-hidden', 'false');
  body.classList.add('locked');
});
checkoutClose.addEventListener('click', () => {
  checkout.classList.remove('is-active');
  checkout.setAttribute('aria-hidden', 'true');
  body.classList.remove('locked');
});
checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  success.classList.add('is-active');
  success.setAttribute('aria-hidden', 'false');
});
successClose.addEventListener('click', () => {
  success.classList.remove('is-active');
  success.setAttribute('aria-hidden', 'true');
  checkout.classList.remove('is-active');
  checkout.setAttribute('aria-hidden', 'true');
  inCart = false;
  bagCount.textContent = '0';
  body.classList.remove('locked');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Sold out message can be previewed with ?soldout=1.
const isSoldOut = new URLSearchParams(window.location.search).get('soldout') === '1';
if (isSoldOut) {
  addButton.disabled = true;
  addButton.innerHTML = '<span>SOLD OUT.</span><span>×</span>';
  closingBuy.disabled = true;
  closingBuy.innerHTML = 'SOLD OUT.';
  document.querySelector('#stock-copy').innerHTML = '<p>SOLD OUT.</p><p>Good. Most of you listened.</p>';
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (success.classList.contains('is-active')) successClose.click();
  else if (checkout.classList.contains('is-active')) checkoutClose.click();
  else if (cart.classList.contains('is-open')) closeCart();
});

document.querySelector('#sound-button').addEventListener('click', (event) => {
  event.currentTarget.textContent = 'SOUND: STILL OFF';
});
