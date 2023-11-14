import html from './template.html';
import css from './styles.css';

class InlineOutline extends window.HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style type="text/css">${css}</style>${html}`;
  }
}

window.customElements.define('inline-outline', InlineOutline);