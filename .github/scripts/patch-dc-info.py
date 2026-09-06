from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

css_start = '        #infoSidePanel {'
css_end = '        #infoSidePanelContent a:hover { text-decoration: underline; }'
start = s.find(css_start)
end = s.find(css_end, start)
if start < 0 or end < 0:
    raise SystemExit('Original Info CSS block not found')
end += len(css_end)

css_new = '''        #infoSidePanel {
            position: fixed; top: 50%; left: 50%; right: auto;
            width: min(860px, calc(100vw - 28px)); height: min(86vh, 820px);
            background: linear-gradient(155deg, #111a3b, #080c20); color: #eef4ff;
            border: 1px solid rgba(84,232,255,.28); border-radius: 22px;
            box-shadow: 0 24px 80px rgba(0,0,0,.55); z-index: 1100;
            transform: translate(-50%, -46%) scale(.98); opacity: 0; pointer-events: none;
            transition: transform .25s ease, opacity .25s ease;
            padding: 24px; padding-top: 70px; box-sizing: border-box; overflow-y: auto;
        }
        #infoSidePanel.info-panel-visible { transform: translate(-50%, -50%) scale(1); opacity: 1; pointer-events: auto; }
        #infoSidePanelCloseButton {
            position: absolute; top: 18px; right: 20px; width: 46px; height: 46px;
            display: grid; place-items: center; font-size: 24px; font-weight: bold;
            color: #eaf2ff; background: #132344; border: 1px solid rgba(84,232,255,.2);
            border-radius: 14px; cursor: pointer; padding: 0; line-height: 1;
        }
        #infoSidePanelCloseButton:hover { background: #1a315b; color: #fff; }
        #infoSidePanelContent .info-title { margin: -48px 64px 22px 0; color: #f6f9ff; border: 0; padding: 0; font-size: 1.55rem; }
        #infoSidePanelContent p { margin: 10px 0; line-height: 1.6; font-size: .96rem; color: #c7d2ee; }
        #infoSidePanelContent .info-charity { margin-bottom: 20px; padding: 16px 18px; background: #0b1430; border: 1px solid rgba(91,128,230,.25); border-radius: 16px; }
        #infoSidePanelContent .donation-header { display: block; margin: 18px 0 12px; color: #eef4ff; font-size: 1rem; }
        #infoSidePanelContent .dc-payment-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }
        #infoSidePanelContent .dc-payment-card { display: flex; flex-direction: column; min-width: 0; padding: 18px; background: #0b1430; border: 1px solid rgba(91,128,230,.32); border-radius: 17px; }
        #infoSidePanelContent .dc-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
        #infoSidePanelContent .dc-brand-icon { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 42px; border-radius: 12px; background: rgba(84,232,255,.09); border: 1px solid rgba(84,232,255,.28); color: #54e8ff; font-weight: 900; }
        #infoSidePanelContent .dc-brand strong { margin: 0; color: #f4f7ff; font-size: 1.05rem; }
        #infoSidePanelContent .dc-badges { display: flex; flex-wrap: wrap; gap: 7px; margin: 14px 0 16px; }
        #infoSidePanelContent .dc-badges span { padding: 5px 9px; border-radius: 999px; background: #101a3b; border: 1px solid rgba(91,128,230,.28); color: #c4d0ec; font-size: .74rem; font-weight: 700; }
        #infoSidePanelContent .dc-payment-action { display: flex; align-items: center; justify-content: center; min-height: 46px; margin-top: auto; padding: 9px 12px; border-radius: 12px; text-decoration: none; color: #061018; font-weight: 900; text-align: center; background: linear-gradient(90deg,#54e8ff,#4da3ff); }
        #infoSidePanelContent .dc-payment-card.stripe .dc-payment-action { background: linear-gradient(90deg,#ffe45c,#ffb84d); }
        #infoSidePanelContent .dc-payment-action:hover { text-decoration: none; filter: brightness(1.05); }
        #infoSidePanelContent .dc-payment-note { margin: 14px 0 18px; color: #94a3c7; font-size: .82rem; }
        #infoSidePanelContent .dc-crypto { padding: 16px; background: #071126; border: 1px solid rgba(91,128,230,.25); border-radius: 16px; }
        #infoSidePanelContent .dc-crypto h5 { margin: 0 0 12px; color: #54e8ff; font-size: 1rem; }
        #infoSidePanelContent .dc-wallet-list { display: grid; gap: 8px; }
        #infoSidePanelContent .dc-wallet-row { display: grid; grid-template-columns: 52px minmax(0,1fr); gap: 9px; align-items: start; padding: 9px 10px; border-radius: 11px; background: rgba(255,255,255,.035); }
        #infoSidePanelContent .dc-wallet-row strong { margin: 0; color: #54e8ff; }
        #infoSidePanelContent .dc-wallet-row code { display: block; margin: 0; padding: 0; background: transparent; color: #b9c8ee; font-size: .76rem; word-break: break-all; }
        @media (max-width: 650px) {
            #infoSidePanel { width: calc(100vw - 18px); height: calc(100vh - 18px); padding: 20px; padding-top: 68px; border-radius: 18px; }
            #infoSidePanelContent .dc-payment-grid { grid-template-columns: 1fr; }
            #infoSidePanelContent .info-title { font-size: 1.3rem; }
        }'''
s = s[:start] + css_new + s[end:]

fn_start = '            function populateInfoPanel() {'
fn_end = '                elements.infoSidePanelContent.innerHTML = contentHTML;\n            }'
start = s.find(fn_start)
end = s.find(fn_end, start)
if start < 0 or end < 0:
    raise SystemExit('populateInfoPanel function not found')
end += len(fn_end)

fn_new = '''            function populateInfoPanel() {
                const tInfo = T('info');
                const lang = elements.languageSelect?.value || 'en';
                const uiMap = {
                    en: { paypalDesc: 'Pay securely with PayPal or other payment options offered by PayPal Checkout.', stripeDesc: 'Pay securely by card or with payment methods available through Stripe Checkout.', cards: 'Debit / Credit Card', wallets: 'Digital wallets', paypalBtn: 'Donate with PayPal ↗', stripeBtn: 'Donate with Stripe ↗', note: 'Available payment methods can vary by country, device and payment provider.', crypto: 'Crypto Wallet' },
                    hr: { paypalDesc: 'Platite sigurno putem PayPala ili drugim načinima plaćanja koje nudi PayPal Checkout.', stripeDesc: 'Platite sigurno karticom ili načinima plaćanja dostupnima putem Stripe Checkouta.', cards: 'Debitna / kreditna kartica', wallets: 'Digitalni novčanici', paypalBtn: 'Doniraj putem PayPala ↗', stripeBtn: 'Doniraj putem Stripea ↗', note: 'Dostupni načini plaćanja mogu se razlikovati ovisno o državi, uređaju i pružatelju plaćanja.', crypto: 'Kripto novčanik' },
                    de: { paypalDesc: 'Sicher mit PayPal oder weiteren von PayPal Checkout angebotenen Zahlungsmethoden bezahlen.', stripeDesc: 'Sicher per Karte oder mit den über Stripe Checkout verfügbaren Zahlungsmethoden bezahlen.', cards: 'Debit- / Kreditkarte', wallets: 'Digitale Wallets', paypalBtn: 'Mit PayPal spenden ↗', stripeBtn: 'Mit Stripe spenden ↗', note: 'Verfügbare Zahlungsmethoden können je nach Land, Gerät und Zahlungsanbieter variieren.', crypto: 'Krypto-Wallet' },
                    it: { paypalDesc: 'Paga in modo sicuro con PayPal o con gli altri metodi disponibili tramite PayPal Checkout.', stripeDesc: 'Paga in modo sicuro con carta o con i metodi disponibili tramite Stripe Checkout.', cards: 'Carta di debito / credito', wallets: 'Portafogli digitali', paypalBtn: 'Dona con PayPal ↗', stripeBtn: 'Dona con Stripe ↗', note: 'I metodi di pagamento disponibili possono variare in base al Paese, al dispositivo e al fornitore di pagamento.', crypto: 'Portafoglio crypto' },
                    es: { paypalDesc: 'Paga de forma segura con PayPal u otros métodos disponibles mediante PayPal Checkout.', stripeDesc: 'Paga de forma segura con tarjeta o con los métodos disponibles mediante Stripe Checkout.', cards: 'Tarjeta de débito / crédito', wallets: 'Carteras digitales', paypalBtn: 'Donar con PayPal ↗', stripeBtn: 'Donar con Stripe ↗', note: 'Los métodos de pago disponibles pueden variar según el país, el dispositivo y el proveedor de pago.', crypto: 'Cartera de criptomonedas' }
                };
                const ui = uiMap[lang] || uiMap.en;
                const cryptoRows = Object.entries(CRYPTO_ADDRESSES).map(([key, value]) => {
                    const label = tInfo[key.toLowerCase()] || key;
                    return `<div class="dc-wallet-row"><strong>${label}</strong><code>${value}</code></div>`;
                }).join('');

                const contentHTML = `
                    <h4 class="info-title">${tInfo.title}</h4>
                    <div class="info-charity"><p>${tInfo.line1}</p><p>${tInfo.line2} ${tInfo.line3}</p></div>
                    <strong class="donation-header">${tInfo.donationHeader}</strong>
                    <div class="dc-payment-grid">
                        <article class="dc-payment-card">
                            <div class="dc-brand"><span class="dc-brand-icon">P</span><strong>PayPal</strong></div>
                            <p>${ui.paypalDesc}</p>
                            <div class="dc-badges"><span>PayPal</span><span>${ui.cards}</span><span>Apple Pay</span></div>
                            <a class="dc-payment-action" href="${PAYPAL_LINK}" target="_blank" rel="noopener noreferrer">${ui.paypalBtn}</a>
                        </article>
                        <article class="dc-payment-card stripe">
                            <div class="dc-brand"><span class="dc-brand-icon">S</span><strong>Stripe</strong></div>
                            <p>${ui.stripeDesc}</p>
                            <div class="dc-badges"><span>${ui.cards}</span><span>Link</span><span>${ui.wallets}</span></div>
                            <a class="dc-payment-action" href="${STRIPE_LINK}" target="_blank" rel="noopener noreferrer">${ui.stripeBtn}</a>
                        </article>
                    </div>
                    <p class="dc-payment-note">${ui.note}</p>
                    <div class="dc-crypto"><h5>${ui.crypto}</h5><div class="dc-wallet-list">${cryptoRows}</div></div>`;
                elements.infoSidePanelContent.innerHTML = contentHTML;
            }'''
s = s[:start] + fn_new + s[end:]

if 'apps-games-info-standard.js' in s:
    raise SystemExit('Shared Info script is still present; aborting')

p.write_text(s, encoding='utf-8')
