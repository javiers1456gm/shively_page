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

const contactButton=document.getElementById('contactButton');
if(contactButton){
  contactButton.addEventListener('click',(event)=>{
    event.preventDefault();
    window.location.href='mailto:ventasmx@shivelybros.com?subject=Solicitud%20de%20informaci%C3%B3n';
  });
}
