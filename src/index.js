import html from './template.html';
import css from './styles.css';

class InlineOutline extends window.HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css}</style>${html}`;
    this._$list = this.shadowRoot.getElementById('list');
    this._$list.addEventListener('keydown', (ev) => this.keyDown(ev));
    this._$list.addEventListener('keyup', (ev) => this.keyUp(ev));
  }

  connectedCallback() {
    const $item = this.item();
    this._$list.appendChild($item);
    this.spotlight($item);
  }

  keyDown(ev) {
    switch(ev.key.toLowerCase()) {
      case 'tab':
         // handle tab to indent/outdent to new / parent group
        return this.tab(ev);
      case 'enter':
        // handle enter to create new item in same group
        return this.enter(ev);
      case 'backspace':
        // handle backspace in empty box to remove
        return this.backspace(ev);
      case 'arrowdown':
      case 'arrowup':
        return this.handleArrow(ev);
      default:
        return;
    }
  }

  keyUp(ev) {
    this.handleArrow(ev);
  }

  handleArrow(ev) {
    const keys = ['ArrowUp', 'ArrowDown'];
    if (!keys.includes(ev.key)) return;
    const { selectionStart, selectionEnd } = ev.target;
    if (selectionStart !== selectionEnd) return;
    if (ev.type === 'keyup' && ev.target.dataset.caret == selectionStart) {
      this.moveCaret(ev.target, keys.indexOf(ev.key));
    }
    ev.target.dataset.caret = selectionStart;
  }

  moveCaret(target, index) {
    const $textareas = [...this._$list.querySelectorAll('textarea')];
    const $nextArea = $textareas[Math.max(Math.min($textareas.length, $textareas.indexOf(target) + ((index * 2) - 1)), 0)];
    if (!$nextArea || target === $nextArea) return;
    const position = [$nextArea.value.length, 0][index];
    $nextArea.focus();
    $nextArea.setSelectionRange(position, position);
  }

  tab(ev) {
    ev.preventDefault();
    const $item = ev.target.closest('li');
    const $list = ev.shiftKey 
      ? $item.parentElement?.closest('li')?.parentElement
      : $item?.previousElementSibling?.querySelector('ol');
    $list?.appendChild($item);
    this.spotlight($item);
  }

  spotlight(item) {
    item.querySelector('textarea').focus();
  }

  enter(ev) {
    ev?.preventDefault();
    const $sibling = ev.target.closest('li');
    const $item = this.item();
    $sibling.insertAdjacentElement('afterend', $item);
    this.spotlight($item);
  }

  backspace(ev) {
    if (ev.target.value !== '') return;
    ev.preventDefault();
    // Move existing children to parent ol
    const $target = ev.target;
    const $list = $target.closest('ol');
    if ($list === this._$list && $list.children.length === 1) return;
    $list.append(...$target.nextElementSibling.children);
    $target.parentElement.remove();
    [...this._$list.querySelectorAll('textarea')].at(-1).focus();
  }

  item() {
    const $li = document.createElement('li')
    const $textarea = document.createElement('textarea');
    $textarea.setAttribute('contenteditable', 'plaintext-only');
    $textarea.setAttribute('rows', 1);
    const $ol = document.createElement('ol');
    $li.appendChild($textarea);
    $li.appendChild($ol);
    return $li;
  }
}

window.customElements.define('inline-outline', InlineOutline);