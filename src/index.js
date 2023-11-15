import html from './template.html';
import css from './styles.css';

const rect = ($el) => $el.getBoundingClientRect();
class InlineOutline extends window.HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css}</style>${html}`;
    this._$list = this.shadowRoot.getElementById('list');
    this.resetDrag();
    this._$list.addEventListener('keydown', (ev) => this.keyDown(ev));
    this._$list.addEventListener('keyup', (ev) => this.keyUp(ev));
  }

  init() {
    const $item = this.item();
    this._$list.appendChild($item);
    this.spotlight($item);
  }

  connectedCallback() {
    this.init();
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

  spotlight($item) {
    $item?.querySelector('textarea')?.focus();
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
    $list.append(...$target.nextElementSibling.children);
    $target.parentElement.remove();
    if (!this._$list.children.length) this.init();
    [...this._$list.querySelectorAll('textarea')].at(-1).focus();
  }

  item() {
    const $li = document.createElement('li');
    const $textarea = document.createElement('textarea');
    $textarea.setAttribute('contenteditable', 'plaintext-only');
    $textarea.setAttribute('rows', 1);
    const $ol = document.createElement('ol');
    $li.appendChild($textarea);
    $li.appendChild($ol);
    $li.addEventListener('pointerdown', (ev) => this.onMouseDown(ev));
    return $li;
  }

  resetDrag() {
    this._drag = {
      x: 0,
      y: 0,
      target: null,
      placeholder: null,
      mousemove: Function.prototype,
      mouseup: Function.prototype,
    }
  }

  getPlaceholder(rect) {
    const placeholder = document.createElement('li');
    placeholder.dataset.placeholder = true;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.width = `${rect.width}px`;
    return placeholder;
  }

  handlePlaceholder(ev) {
    const $els = [...this.shadowRoot.elementsFromPoint(ev.pageX, ev.pageY)];
    const hasPlaceholder = $els.includes(this._drag.placeholder);
    if (hasPlaceholder) return;
    const $closestItem = $els.find(($el) => $el.tagName.toLowerCase() === 'li' && ![this._drag.target, this._drag.placeholder].includes($el));
    if (!$closestItem) return;
    const itemRect = rect($closestItem);
    const position = itemRect.top > ev.pageY - this._drag.y ? 'beforebegin' : 'afterend';
    $closestItem.insertAdjacentElement(position, this._drag.placeholder);
  }

  onMouseDown(ev) {
    if (ev.target !== ev.currentTarget) return;
    const targetRect = rect(ev.target);
    const x = targetRect.left;
    const y = targetRect.top;
    this._drag = {
      target: ev.target,
      placeholder: this.getPlaceholder(targetRect),
      x: ev.pageX - x,
      y: ev.pageY - y,
      mousemove: this.onMouseMove.bind(this),
      mouseup: this.onMouseUp.bind(this)
    };
    ev.target.dataset.dragging = true;
    ev.target.parentElement.insertBefore(this._drag.placeholder, this._drag.target);
    Object.assign(this._drag.target.style, {
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`
    });
    document.addEventListener('pointermove', this._drag.mousemove);
    document.addEventListener('pointerup', this._drag.mouseup);
  }

  onMouseMove(ev) {
    const deltaX = ev.pageX - this._drag.x;
    const deltaY = ev.pageY - this._drag.y;
    Object.assign(this._drag.target.style, {
      left: `${deltaX}px`,
      top: `${deltaY}px`
    });
    this.handlePlaceholder(ev);
  }

  onMouseUp() {
    document.removeEventListener('pointermove', this._drag.mousemove);
    document.removeEventListener('pointerup', this._drag.mouseup);
    this._drag.placeholder.parentElement.insertBefore(this._drag.target, this._drag.placeholder);
    this._drag.target.removeAttribute('style');
    this._drag.target.removeAttribute('data-dragging');
    this._drag.placeholder.remove();
    this.spotlight(this._drag.target);
    this.resetDrag();
  }
}

window.customElements.define('inline-outline', InlineOutline);