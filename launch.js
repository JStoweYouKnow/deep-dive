window.addEventListener('DOMContentLoaded', () => {
  const onboarding = document.querySelector('#onboarding');
  const toast = document.querySelector('#toast');
  const main = document.querySelector('main');
  if (toast) {
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
  }
  if (main) main.setAttribute('tabindex', '-1');
  if (!onboarding) return;
  onboarding.addEventListener('close', () => localStorage.setItem('deep-dive-onboarding-complete', 'true'));
  if (localStorage.getItem('deep-dive-onboarding-complete') === 'true') onboarding.close();
});
