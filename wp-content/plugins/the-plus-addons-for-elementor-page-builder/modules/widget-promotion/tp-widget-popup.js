// (function () {
  const data = (window.TP_PROMO_WIDGETS && window.TP_PROMO_WIDGETS.widgets) || [];
  const proWidgetTitles = data.map((w) => w.title);
  const promoByTitle = Object.fromEntries(data.map((w) => [w.title, w]));

  function showPromoPopup(targetElement) {
    if (document.getElementById('tp-pro-popup')) return;

    const wrapper = targetElement.closest('.elementor-element-wrapper');
    const titleText = (
      (wrapper && wrapper.querySelector('.title') && wrapper.querySelector('.title').textContent) ||
      ''
    )
      .trim() || 'Pro Widget';

    const details = promoByTitle[titleText] || {};
    const promoUrl = 'https://theplusaddons.com/pricing/';
    const liveDemoUrl = details.demo_url || 'https://theplusaddons.com/widgets/';

    // Floating panel
    const panel = document.createElement('div');
    panel.id = 'tp-pro-popup';
    panel.setAttribute('role', 'dialog');
    panel.style.position = 'fixed';
    panel.style.zIndex = '999999';
    panel.style.maxWidth = '250px';
    panel.style.width = '250px';
    panel.style.pointerEvents = 'auto';

    const dialog = document.createElement('div');
    dialog.className = 'tp-pro-popup__dialog';

    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.className = 'tp-pro-popup__close';
    close.textContent = '×';

    const header = document.createElement('div');
    header.className = 'tp-pro-popup__header';

    const lock = document.createElement('span');
    lock.className = 'eicon-lock';

    const title = document.createElement('span');
    title.className = 'tp-pro-popup__title';
    title.textContent = titleText.replace(/\s*\(Pro\)\s*$/i, '');

    const badge = document.createElement('span');
    badge.className = 'tp-pro-popup__badge';
    badge.textContent = 'PRO';

    const hr = document.createElement('div');
    hr.className = 'tp-pro-popup__separator';

    const p = document.createElement('p');
    p.className = 'tp-pro-popup__desc';
    p.textContent =
      'Unlock this widget by upgrading to The Plus Addons for Elementor Pro. Use Code FIRST20 to get FLAT 20% OFF now.';

    const actions = document.createElement('div');
    actions.className = 'tp-pro-popup__actions';

    const btn = document.createElement('a');
    btn.href = promoUrl;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = 'Get Pro';
    btn.className = 'tp-pro-popup__btn';

    const link = document.createElement('a');
    link.href = liveDemoUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Live Demos';
    link.className = 'tp-pro-popup__link';

    actions.appendChild(btn);
    actions.appendChild(link);

    header.appendChild(lock);
    header.appendChild(title);
    header.appendChild(badge);

    dialog.appendChild(close);
    dialog.appendChild(header);
    dialog.appendChild(hr);
    dialog.appendChild(p);
    dialog.appendChild(actions);

    const arrow = document.createElement('div');
    arrow.className = 'tp-pro-popup__arrow';

    panel.appendChild(dialog);
    panel.appendChild(arrow);
    panel.style.visibility = 'hidden';
    document.body.appendChild(panel);

    function positionPanel() {
      const rect = targetElement.getBoundingClientRect();
      const panelWidth = panel.offsetWidth || 420;
      const panelHeight = panel.offsetHeight || 180;
      const margin = 12;

      const spaceRight = window.innerWidth - rect.right;
      const placeRight = spaceRight > panelWidth + margin;

      let left = placeRight ? rect.right + margin : rect.left - panelWidth - margin;
      left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));

      let top = rect.top + window.scrollY - 10;
      top = Math.max(8 + window.scrollY, Math.min(top, window.scrollY + window.innerHeight - panelHeight - 8));

      panel.style.left = left + 'px';
      panel.style.top = top + 'px';

      arrow.style.top =
        Math.min(
          panelHeight - 20,
          Math.max(20, rect.top + rect.height / 2 + window.scrollY - top - 8)
        ) + 'px';
      arrow.style.left = placeRight ? '-8px' : panelWidth - 8 + 'px';
    }

    function removePopup() {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutsideClick, true);
      if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    }
    function onKey(e) {
      if (e.key === 'Escape') removePopup();
    }
    function onOutsideClick(e) {
      if (!panel.contains(e.target)) removePopup();
    }

    close.addEventListener('click', removePopup, { once: true });
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutsideClick, true);

    requestAnimationFrame(() => {
      panel.style.visibility = 'visible';
      positionPanel();
    });
  }

  function applyPromotionClasses() {
    const root = document.querySelector('body').shadowRoot || document;
    const wrappers = root.querySelectorAll('.elementor-element-wrapper');

    wrappers.forEach((wrapper) => {
      const titleEl = wrapper.querySelector('.title');
      const titleText = (titleEl && titleEl.textContent && titleEl.textContent.trim()) || '';

      if (proWidgetTitles.includes(titleText)) {
        wrapper.classList.add('elementor-element--promotion');

        const button = wrapper.querySelector('button.elementor-element');
        if (button) {
          button.setAttribute('draggable', 'false');
          button.setAttribute('tabindex', '-1');

          ['click', 'mousedown', 'dragstart'].forEach((evt) => {
            button.addEventListener(
              evt,
              function (e) {
                e.preventDefault();
                e.stopPropagation();
                showPromoPopup(button);
                return false;
              },
              { capture: true }
            );

            wrapper.addEventListener(
              evt,
              function (e) {
                e.preventDefault();
                e.stopPropagation();
                showPromoPopup(button);
                return false;
              },
              { capture: true }
            );
          });

          if (!button.querySelector('.eicon-lock')) {
            const lockIcon = document.createElement('i');
            lockIcon.className = 'eicon-lock';
            lockIcon.style.marginRight = '5px';
            button.insertBefore(lockIcon, button.firstChild);
          }
        }
      }
    });
  }

  function setupObserver() {
    const targetPanel = document.querySelector('#elementor-panel-elements') || document;
    if (!targetPanel) return;

    const observer = new MutationObserver(() => {
      applyPromotionClasses();
    });
    observer.observe(targetPanel, { childList: true, subtree: true });
    applyPromotionClasses();
  }

  window.addEventListener('elementor:init', () => {

    elementor.on('panel:init', () => {
      setupObserver();

      elementor.hooks.addFilter('panel/elements/drag/start', (widgetView) => {
        const title = widgetView.model.get('title');
        if (proWidgetTitles.includes(title)) {
          const $el = widgetView.$el;
          $el
            .find('button.elementor-element')
            .off('click')
            .on('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showPromoPopup(e.currentTarget);
            });
          return null;
        }
        return widgetView;

        // if (proWidgetTitles.includes(title)) {
        //   showPromoPopup(widgetView.$el[0]); 
        //   return null; 
        // }

        // return widgetView;
      });

    });

  });
  
// })();


