import { parseNumericAttr } from '../../../helpers/parseNumericAttr.js';
import { parseArrayAttr } from '../../../helpers/parseArrayAttr.js';
import { setAttr } from '../../../helpers/setAttr.js';
import { unique } from '../../../helpers/unique.js';

export const MemoryGameFactory = (Base = class {}) => view =>
  class extends Base {
    constructor () {
      super();
      this.attachShadow({ mode: 'open' });
      this.view = view;
      this.shadowRoot.appendChild(this.view.content.cloneNode(true));
    }

    get rows () {
      return Math.round(parseNumericAttr(this.getAttribute('rows')));
    }

    set rows (value) {
      setAttr(this, 'rows', value);
    }

    get columns () {
      return Math.round(parseNumericAttr(this.getAttribute('columns')));
    }

    set columns (value) {
      setAttr(this, 'columns', value);
    }

    get revealed () {
      return parseArrayAttr(this.getAttribute('revealed')) || [];
    }

    set revealed (value) {
      setAttr(this, 'revealed', unique(value));
    }

    get total () {
      return this.rows * this.columns;
    }

    get renderRoot () {
      return this.shadowRoot;
    }

    get board () {
      return this.renderRoot.querySelector('div');
    }

    get cards () {
      return Array.from(this.children);
    }

    static get observedAttributes () {
      return ['rows', 'columns', 'revealed'];
    }

    connectedCallback () {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      this._handleClick = this._handleClick.bind(this);
      this.renderRoot.addEventListener('click', this._handleClick);
    }

    disconnectedCallback () {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      this.renderRoot.removeEventListener('click', this._handleClick);
    }

    _handleRowsChanged (rows) {
      this.board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    }

    _handleColumnsChanged (columns) {
      this.board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    _handleRevealedChanged (revealed) {
      this.cards.forEach((card, index) => {
        setAttr(card, 'revealed', revealed.includes(index));
      });
    }

    _handleClick ({ target: card }) {
      const index = this.cards.indexOf(card);

      if (index >= 0) {
        this._dispatchEventAndCallMethod('try', { index, card });
      }
    }
  };
