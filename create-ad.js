/* eslint-disable no-console */
(function() {
    // Globální pomocné funkce pro publikovat tlačítko a validaci (dostupné i před init)
    function disablePublish(disabled){
        const btn = document.getElementById('publishSideBtn');
        if (!btn) return;
        btn.disabled = !!disabled;
        btn.style.opacity = disabled ? .6 : 1;
    }
    function validateRequired(){
        const titleEl = document.getElementById('serviceTitle');
        const catEl = document.getElementById('serviceCategory');
        const locEl = document.getElementById('serviceLocation');
        const desc = document.getElementById('serviceDescription');
        const noPrev = !!document.getElementById('noPreviewImage')?.checked;
        const previewInput = document.getElementById('previewImage');
        const ok = !!titleEl?.value && !!catEl?.value && !!locEl?.value && !!desc?.value && (noPrev || !!previewInput?.files?.[0]);
        disablePublish(!ok);
        return ok;
    }
    // Po načtení DOM připravit stránku
    document.addEventListener('DOMContentLoaded', () => {
        // Inicializace UI prvků nezávislá na Firebase (aby price inputs fungovaly hned)
        setupPriceControls();

        // Počkat na Firebase a poté rozhodnout podle onAuthStateChanged
        const waitForFirebase = setInterval(async () => {
            if (window.firebaseReady && window.firebaseAuth && window.firebaseDb) {
                clearInterval(waitForFirebase);
                try {
                    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
                    onAuthStateChanged(window.firebaseAuth, async (user) => {
                        if (user) {
                            // Zavřít případný auth modal, pokud se zobrazil dříve
                            const authModal = document.getElementById('authModal');
                            if (authModal) {
                                authModal.style.display = 'none';
                                document.body.style.overflow = 'auto';
                            }
                            
                            // Kontrola aktivního předplatného - POVINNÁ
                            console.log('🔒 Kontroluji předplatné pro vytvoření inzerátu...');
                            
                            const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                            const profileRef = doc(window.firebaseDb, 'users', user.uid, 'profile', 'profile');
                            const profileSnap = await getDoc(profileRef);
                            
                            let hasActiveSubscription = false;
                            let subscriptionExpired = false;
                            
                            console.log('📋 Profil existuje:', profileSnap.exists());
                            
                            if (profileSnap.exists()) {
                                const profile = profileSnap.data();
                                const plan = profile.plan;
                                console.log('📋 Aktuální plán:', plan);
                                
                                if (plan === 'hobby' || plan === 'business') {
                                    // Zkontrolovat, zda předplatné nevypršelo
                                    const planPeriodEnd = profile.planPeriodEnd;
                                    if (planPeriodEnd) {
                                        const endDate = planPeriodEnd.toDate ? planPeriodEnd.toDate() : new Date(planPeriodEnd);
                                        console.log('📅 Datum vypršení:', endDate, 'Nyní:', new Date());
                                        if (endDate >= new Date()) {
                                            hasActiveSubscription = true;
                                            console.log('✅ Předplatné aktivní');
                                        } else {
                                            subscriptionExpired = true;
                                            console.log('❌ Předplatné vypršelo');
                                        }
                                    } else {
                                        // Pokud není datum vypršení, považujeme za aktivní (trial?)
                                        hasActiveSubscription = true;
                                        console.log('✅ Předplatné aktivní (bez data vypršení)');
                                    }
                                } else {
                                    console.log('❌ Žádný platný plán');
                                }
                            } else {
                                console.log('❌ Profil neexistuje');
                            }
                            
                            // Zobrazit blokující overlay pokud není předplatné
                            if (!hasActiveSubscription) {
                                console.log('🚫 BLOKOVÁNO: Chybí předplatné, zobrazuji overlay');
                                
                                // Skrýt formulář
                                const formContainer = document.querySelector('.create-ad-container, .add-service-form, main');
                                if (formContainer) {
                                    formContainer.style.display = 'none';
                                }
                                
                                // Zobrazit upozornění
                                const message = subscriptionExpired 
                                    ? 'Vaše předplatné vypršelo. Pro vytváření inzerátů si prosím obnovte balíček.'
                                    : 'Pro vytváření inzerátů potřebujete aktivní předplatné (Hobby nebo Firma).';
                                
                                // Vytvořit overlay s upozorněním
                                const overlay = document.createElement('div');
                                overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;';
                                overlay.innerHTML = `
                                    <div style="background:#fff;padding:2.5rem;border-radius:16px;max-width:450px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                                        <div style="width:80px;height:80px;background:linear-gradient(135deg,#f77c00,#ff9a3c);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
                                            <i class="fas fa-crown" style="font-size:2.5rem;color:#fff;"></i>
                                        </div>
                                        <h2 style="margin:0 0 1rem;color:#1a1a2e;font-size:1.5rem;">Vyžadováno předplatné</h2>
                                        <p style="color:#666;margin-bottom:1.5rem;line-height:1.6;">${message}</p>
                                        <a href="packages.html" style="display:inline-block;background:linear-gradient(135deg,#f77c00,#ff9a3c);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:1.1rem;transition:transform 0.2s;">
                                            <i class="fas fa-arrow-right"></i> Zobrazit balíčky
                                        </a>
                                        <p style="margin-top:1.5rem;font-size:0.85rem;color:#999;">
                                            Budete přesměrováni za 5 sekund...
                                        </p>
                                    </div>
                                `;
                                document.body.appendChild(overlay);
                                
                                // Přesměrovat po 5 sekundách
                                setTimeout(() => {
                                    window.location.href = 'packages.html';
                                }, 5000);
                                return; // DŮLEŽITÉ: Zastavit a nepokračovat
                            }
                            
                            console.log('✅ Předplatné OK, inicializuji stránku...');
                            initCreateAdPage();
                        } else {
                            // Uživatel není přihlášen – až TEĎ zobrazit login
                            if (typeof window.showAuthModal === 'function') {
                                window.afterLoginCallback = () => window.location.reload();
                                showAuthModal('login');
                            } else {
                                alert('Pro vytvoření inzerátu se prosím přihlaste.');
                                window.location.href = 'index.html';
                            }
                        }
                    });
                } catch (authErr) {
                    console.error('Chyba při inicializaci auth:', authErr);
                    // Bezpečný fallback - přesměrovat na balíčky, protože nemůžeme ověřit předplatné
                    if (!window.firebaseAuth?.currentUser) {
                        if (typeof window.showAuthModal === 'function') {
                            window.afterLoginCallback = () => window.location.reload();
                            showAuthModal('login');
                        } else {
                            alert('Pro vytvoření inzerátu se prosím přihlaste.');
                            window.location.href = 'index.html';
                        }
                    } else {
                        // Pokud nemůžeme ověřit předplatné, raději přesměrujeme
                        console.warn('⚠️ Nelze ověřit předplatné, přesměrovávám na balíčky');
                        alert('Nepodařilo se ověřit předplatné. Budete přesměrováni na stránku balíčků.');
                        window.location.href = 'packages.html';
                    }
                }
            }
        }, 100);
        setTimeout(() => clearInterval(waitForFirebase), 15000);
    });

    // Samostatná inicializace ovládání ceny (funguje i bez Firebase)
    function setupPriceControls() {
        if (window._priceUiInit) return;
        window._priceUiInit = true;

        const p = document.getElementById('servicePrice');
        const pf = document.getElementById('servicePriceFrom');
        const pt = document.getElementById('servicePriceTo');
        const priceInputs = document.querySelector('.price-inline .inputs');
        const unitSel = document.getElementById('unitPills');

        function updatePlaceholders() {
            const unit = (document.querySelector('input[name="priceUnit"]:checked')?.value || 'hour');
            const unitText = unit === 'hour' ? 'hod' : 'práci';
            const cur = 'Kč';
            if (p) p.placeholder = `Cena (např. 500)`;
            if (pf) pf.placeholder = `Od (např. 300)`;
            if (pt) pt.placeholder = `Do (např. 800)`;
        }
        function onPriceTypeChange() {
            const sel = document.querySelector('input[name="priceType"]:checked');
            if (!sel) { if (priceInputs) priceInputs.style.display = 'none'; return; }
            if (priceInputs) priceInputs.style.display = 'block';
            if (p && pf && pt && unitSel) {
                p.style.display = 'none'; pf.style.display = 'none'; pt.style.display = 'none'; unitSel.style.display = 'none';
                p.required = false; pf.required = false; pt.required = false;
                if (sel.value === 'fixed') {
                    unitSel.style.display = 'flex';
                    p.style.display = 'block';
                    p.required = true;
                    setTimeout(() => p?.focus(), 0);
                } else if (sel.value === 'range') {
                    unitSel.style.display = 'flex';
                    pf.style.display = 'block'; pt.style.display = 'block';
                    pf.required = true; pt.required = true;
                    setTimeout(() => pf?.focus(), 0);
                } else {
                    // negotiable
                    unitSel.style.display = 'none';
                }
            }
        }
        document.querySelectorAll('input[name="priceType"]').forEach(r => {
            r.addEventListener('change', onPriceTypeChange);
            r.addEventListener('click', onPriceTypeChange);
        });
        document.querySelectorAll('input[name="priceUnit"]').forEach(r => r.addEventListener('change', updatePlaceholders));

        // Výchozí stav
        if (!document.querySelector('input[name="priceType"]:checked')) {
            const fallback = document.getElementById('priceTypeFixed');
            if (fallback) fallback.checked = true;
        }
        updatePlaceholders();
        onPriceTypeChange();
    }

    function initCreateAdPage() {
        // Počítadlo znaků popisu
        const desc = document.getElementById('serviceDescription');
        const counter = document.getElementById('serviceDescriptionCounter');
        if (desc && counter) {
            const update = () => {
                const max = parseInt(desc.getAttribute('maxlength') || '600', 10);
                const left = Math.max(0, max - (desc.value || '').length);
                counter.textContent = String(left);
            };
            desc.addEventListener('input', update);
            update();
        }

        // Živý náhled karty vpravo
        const titleEl = document.getElementById('serviceTitle');
        const catEl = document.getElementById('serviceCategory');
        const locEl = document.getElementById('serviceLocation');
        const imgPreview = document.getElementById('previewCardImage');
        const titlePreview = document.getElementById('previewCardTitle');
        const metaCat = document.getElementById('previewCardCategory');
        const metaLoc = document.getElementById('previewCardLocation');
        const pricePreview = document.getElementById('previewCardPrice');

        function updatePreview() {
            titlePreview.textContent = (titleEl?.value || 'Název inzerátu').trim() || 'Název inzerátu';
            metaCat.textContent = catEl?.options?.[catEl.selectedIndex || 0]?.text || 'Kategorie';
            metaLoc.textContent = locEl?.options?.[locEl.selectedIndex || 0]?.text || 'Kraj';
            // cenu vypočítáme stejně jako při submitu
            pricePreview.textContent = computePriceText();
        }
        titleEl?.addEventListener('input', updatePreview);
        catEl?.addEventListener('change', updatePreview);
        locEl?.addEventListener('change', updatePreview);
        updatePreview();

        // Náhled obrázku v pravé kartě
        const previewImageInput = document.getElementById('previewImage');
        const noPreviewCheckbox = document.getElementById('noPreviewImage');
        if (imgPreview && !imgPreview.getAttribute('src')) {
            imgPreview.setAttribute('src', '/fotky/bulldogo-logo.png');
        }
        if (previewImageInput && imgPreview) {
            previewImageInput.addEventListener('change', function(e) {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => { imgPreview.src = ev.target.result; };
                reader.readAsDataURL(file);
            });
        }
        if (noPreviewCheckbox && previewImageInput && imgPreview) {
            const updateNoPreviewState = () => {
                const checked = !!noPreviewCheckbox.checked;
                previewImageInput.required = !checked;
                previewImageInput.disabled = checked;
                if (checked) {
                    try { previewImageInput.value = ''; } catch(_) {}
                    imgPreview.src = '/fotky/bulldogo-logo.png';
                } else {
                    if (!previewImageInput.files?.[0]) {
                        imgPreview.src = '/fotky/bulldogo-logo.png';
                    }
                }
                validateRequired();
            };
            noPreviewCheckbox.addEventListener('change', updateNoPreviewState);
            updateNoPreviewState();
        }

        // Přepínání cen
        const priceInputs = document.querySelector('.price-inline .inputs');
        const unitSel = document.getElementById('unitPills');
        const p = document.getElementById('servicePrice');
        const pf = document.getElementById('servicePriceFrom');
        const pt = document.getElementById('servicePriceTo');
        const priceRadios = document.querySelectorAll('input[name=\"priceType\"]');
        priceRadios.forEach(r => {
            r.addEventListener('change', onPriceTypeChange);
            r.addEventListener('click', onPriceTypeChange);
        });
        // Výchozí stav: pokud není nic vybráno, zvolit Fixní
        if (!document.querySelector('input[name=\"priceType\"]:checked')) {
            const fallback = document.getElementById('priceTypeFixed');
            if (fallback) { fallback.checked = true; }
        }
        onPriceTypeChange();
        function onPriceTypeChange() {
            const sel = document.querySelector('input[name=\"priceType\"]:checked');
            if (!sel) { if (priceInputs) priceInputs.style.display = 'none'; return; }
            if (priceInputs) priceInputs.style.display = 'block';
            const unitHint = null;
            if (p && pf && pt && unitSel) {
                p.style.display = 'none'; pf.style.display = 'none'; pt.style.display = 'none'; unitSel.style.display = 'none';
                p.required = false; pf.required = false; pt.required = false;
                if (sel.value === 'fixed') {
                    unitSel.style.display = 'block';
                    p.style.display = 'block';
                    p.required = true;
                    // focus na pole ceny při volbě fixní
                    setTimeout(() => p?.focus(), 0);
                    updatePlaceholders();
                } else if (sel.value === 'range') {
                    unitSel.style.display = 'block';
                    pf.style.display = 'block'; pt.style.display = 'block';
                    pf.required = true; pt.required = true;
                    // focus na první pole rozsahu
                    setTimeout(() => pf?.focus(), 0);
                    updatePlaceholders();
                } else {
                    // negotiable
                    // no inputs required
                }
                updatePreview();
            }
            if (unitSel) unitSel.style.display = sel?.value === 'negotiable' ? 'none' : 'flex';
        }
        function updatePlaceholders() {
            const unit = (document.querySelector('input[name=\"priceUnit\"]:checked')?.value || 'hour');
            const unitText = unit === 'hour' ? 'hod' : 'práci';
            const cur = 'Kč';
            if (p) p.placeholder = `Cena (např. 500)`;
            if (pf) pf.placeholder = `Od (např. 300)`;
            if (pt) pt.placeholder = `Do (např. 800)`;
            updatePreview();
        }
        document.querySelectorAll('input[name=\"priceUnit\"]').forEach(r => r.addEventListener('change', updatePlaceholders));
        ;['input','change'].forEach(evt=>{
            p?.addEventListener(evt, updatePreview);
            pf?.addEventListener(evt, updatePreview);
            pt?.addEventListener(evt, updatePreview);
        });

        // Náhledy obrázků – použít existující helper, když je k dispozici
        if (typeof window.setupImagePreviews === 'function') {
            window.setupImagePreviews();
        }

        // Odeslání formuláře
        const form = document.getElementById('addServiceForm');
        if (form && !form.hasAttribute('data-submit-handler')) {
            form.setAttribute('data-submit-handler', 'true');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Poskládat cenu jako text podle výběru
                const priceText = computePriceText();

                const fd = new FormData(form);
                const data = {
                    title: fd.get('title'),
                    category: fd.get('category'),
                    description: fd.get('description'),
                    price: priceText,
                    location: fd.get('location')
                };

                const previewImage = document.getElementById('previewImage');
                const additionalImages = document.getElementById('additionalImages');
                const noPreview = !!noPreviewCheckbox?.checked;
                if (!noPreview) {
                    if (!previewImage?.files?.[0]) {
                        alert('Náhledový obrázek je povinný (nebo zaškrtněte volbu bez náhledu).');
                        return;
                    }
                    data.previewImage = previewImage.files[0];
                } else {
                    // použít výchozí logo, neuploadovat do Storage
                    data.defaultPreviewUrl = '/fotky/bulldogo-logo.png';
                }
                if (additionalImages?.files?.length) {
                    if (additionalImages.files.length > 10) {
                        alert('Můžete nahrát maximálně 10 dalších fotek.');
                        return;
                    }
                    data.additionalImages = Array.from(additionalImages.files);
                }

                // Odeslat přes existující Firebase funkci
                if (typeof window.addService === 'function') {
                    disablePublish(true);
                    const result = await window.addService(data);
                    disablePublish(false);
                    
                    // Pokud addService vrátila false (např. chybí předplatné), nepřesměrovávat
                    if (result === false) {
                        console.log('❌ Inzerát nebyl přidán - chybí předplatné');
                        return;
                    }
                    
                    // Po úspěchu přesměrovat na moje inzeráty (pokud existuje stránka), nebo na homepage
                    setTimeout(() => {
                        window.location.href = 'my-ads.html';
                    }, 800);
                } else {
                    alert('Chyba: funkcionalita přidání služby není dostupná.');
                }
            });
        }

        // Disablovat publish, dokud nejsou povinné položky (globální helper již existuje)
        ;['input','change'].forEach(evt=>{
            titleEl?.addEventListener(evt, validateRequired);
            catEl?.addEventListener(evt, validateRequired);
            locEl?.addEventListener(evt, validateRequired);
            desc?.addEventListener(evt, validateRequired);
            previewImageInput?.addEventListener('change', validateRequired);
        });
        validateRequired();

        // Helper pro sestavení textu ceny
        function computePriceText(){
            const priceType = document.querySelector('input[name=\"priceType\"]:checked')?.value || 'negotiable';
            const unit = (document.querySelector('input[name=\"priceUnit\"]:checked')?.value || 'hour');
            const unitText = unit === 'hour' ? 'hod' : ''; // Pro "práci" nebudeme zobrazovat jednotku
            const cur = 'Kč';
            if (priceType === 'fixed') {
                const val = (document.getElementById('servicePrice')?.value || '').trim();
                if (!val) return '';
                // Zajistit, že číslo je správně formátované s Kč
                const numVal = val.replace(/[^0-9]/g, ''); // Odebrat všechny nečíselné znaky
                if (!numVal) return '';
                // Pokud je jednotka "hod", zobrazit "750 Kč/hod", jinak jen "750 Kč"
                return unitText ? `${numVal} ${cur}/${unitText}` : `${numVal} ${cur}`;
            } else if (priceType === 'range') {
                const from = (document.getElementById('servicePriceFrom')?.value || '').trim();
                const to = (document.getElementById('servicePriceTo')?.value || '').trim();
                if (!from || !to) return '';
                const numFrom = from.replace(/[^0-9]/g, '');
                const numTo = to.replace(/[^0-9]/g, '');
                if (!numFrom || !numTo) return '';
                // Formát: "200 - 600 Kč/hod" nebo "200 - 600 Kč" (bez jednotky pro práci)
                const unitPart = unitText ? `/${unitText}` : '';
                return `${numFrom} - ${numTo} ${cur}${unitPart}`;
            }
            return 'Dohodou';
        }
    }
})();


