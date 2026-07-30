const backToTop=document.getElementById('backToTop');
window.addEventListener('scroll',()=>{backToTop.classList.toggle('show',window.scrollY>500)});
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible')}})},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelectorAll('.nav-link').forEach(link=>{link.addEventListener('click',()=>{const menu=document.querySelector('#menuPrincipal');if(menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();})});

const pdfModal=document.getElementById('pdfModal');
const pdfFrame=document.getElementById('pdfFrame');
const pdfModalTitle=document.getElementById('pdfModalLabel');

const resolveAssetPath=(path)=>{
  if(!path) return '';
  if(/^https?:\/\//i.test(path)) return path;
  return new URL(path, window.location.href).href;
};

document.querySelectorAll('[data-pdf]').forEach(card=>{
  card.addEventListener('click',(event)=>{
    event.preventDefault();
    const pdfUrl=resolveAssetPath(card.getAttribute('data-pdf'));
    const title=card.getAttribute('data-title') || 'Documento';
    pdfModalTitle.textContent=title;
    pdfFrame.src=pdfUrl;
    const modal=new bootstrap.Modal(pdfModal);
    modal.show();
  });
});

pdfModal.addEventListener('hidden.bs.modal',()=>{
  pdfFrame.src='about:blank';
});

const contactForm=document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const name=document.getElementById('contactName').value.trim();
    const company=document.getElementById('contactCompany').value.trim();
    const email=document.getElementById('contactEmail').value.trim();
    const message=document.getElementById('contactMessage').value.trim();
    const subject='Solicitud de información';
    const body=[
      `Nombre;: ${name}`,
      `Empresa: ${company}`,
      `Correo: ${email}`,
      `Mensaje: ${message}`
    ].join('\r\n');
    const mailto = `mailto:ventasmx@shivelybros.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}

/* SECTION: Cobertura Comercial - Interactividad de pins y zonas */
const locationMapCard = document.querySelector('.map-interactive-card');
const zoneCards = document.querySelectorAll('.location-zone-card');
const mapPins = document.querySelectorAll('.map-pin');
const pinWrappers = document.querySelectorAll('.pin-wrapper');

function resetZoneHighlight() {
  locationMapCard?.classList.remove('zona-norte', 'zona-noroeste', 'zona-bajio', 'zona-centro', 'zona-centro-sur');
  mapPins.forEach(pin => pin.classList.remove('highlighted'));
  zoneCards.forEach(card => card.classList.remove('active'));
}

function clearActivePins() {
  pinWrappers.forEach(wrapper => wrapper.classList.remove('active'));
}

zoneCards.forEach(card => {
  const zone = card.dataset.zone;
  card.addEventListener('pointerenter', () => {
    resetZoneHighlight();
    locationMapCard?.classList.add(zone);
    card.classList.add('active');
    document.querySelectorAll(`.map-pin[data-zone="${zone}"]`).forEach(pin => pin.classList.add('highlighted'));
  });

  card.addEventListener('pointerleave', () => {
    resetZoneHighlight();
  });

  card.addEventListener('click', () => {
    resetZoneHighlight();
    locationMapCard?.classList.add(zone);
    document.querySelectorAll(`.map-pin[data-zone="${zone}"]`).forEach(pin => pin.classList.add('highlighted'));
    card.classList.add('active');
  });
});

mapPins.forEach(pin => {
  pin.addEventListener('click', event => {
    event.stopPropagation();
    const wrapper = pin.closest('.pin-wrapper');
    const isActive = wrapper?.classList.contains('active');
    clearActivePins();
    if (!isActive && wrapper) {
      wrapper.classList.add('active');
    }
  });
});

window.addEventListener('click', event => {
  if (!event.target.closest('.pin-wrapper') && !event.target.closest('.location-zone-card')) {
    clearActivePins();
  }
});
