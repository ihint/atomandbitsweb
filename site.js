// Native menu disclosure stays usable without JavaScript.
const mobileMenu = document.querySelector('.mobile-nav');
if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => { mobileMenu.open = false; });
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileMenu.open) {
            mobileMenu.open = false;
            mobileMenu.querySelector('summary').focus();
        }
    });
    document.addEventListener('click', (event) => {
        if (mobileMenu.open && !mobileMenu.contains(event.target)) {
            mobileMenu.open = false;
        }
    });
}

// This is a sample explanation, with no live workflow or external actions.
document.querySelectorAll('[data-walkthrough]').forEach((demo) => {
    const buttons = [...demo.querySelectorAll('[data-step]')];
    const panels = [...demo.querySelectorAll('[data-panel]')];
    const show = (step) => {
        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.step === step));
        });
        panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== step; });
    };
    buttons.forEach((button) => {
        button.addEventListener('click', () => { show(button.dataset.step); });
    });
    show('0');
    demo.classList.add('enhanced');
});
